// lib/gmail.ts
import { google } from 'googleapis';
import prisma from './prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { parseResume } from '@/lib/types'; // adjust path if your n8n methods are in another file
import { createErrorDetails, logError } from './errorNotifications';

const S3_BUCKET = process.env.AWS_S3_BUCKET!;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const s3 = new S3Client({ region: AWS_REGION });

export const oauth2ClientFromTokens = (tokens: { access_token: string; refresh_token?: string }) => {
  const o = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  o.setCredentials(tokens);
  return o;
};

export async function getOAuthUrl(state?: string) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify', // to mark messages read
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
  ];
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state
  });
}

/**
 * Exchange authorization code for tokens and upsert into Integration table
 */
export async function exchangeCodeAndSaveIntegration(userId: string, code: string) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  const { tokens } = await oAuth2Client.getToken(code);
  const now = new Date();
  const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(now.getTime() + 3600 * 1000);

  // Upsert Integration record
  const up = await prisma.integration.upsert({
    where: { userId_provider: { userId, provider: 'google_gmail' } as any },
    create: {
      userId,
      provider: 'google_gmail',
      status: 'connected',
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || '',
      expiresAt,
      scopes: tokens.scope ? tokens.scope.split(' ') : [],
    },
    update: {
      status: 'connected',
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || undefined,
      expiresAt,
      scopes: tokens.scope ? tokens.scope.split(' ') : undefined
    }
  });

  return up;
}

/**
 * Poll unread messages, download attachments, upload to S3, create Candidate + WorkflowExecution
 * Returns array of processed candidate ids
 */
export async function fetchAndProcessUnreadEmails(userIntegrationId: string, opts?: { markRead?: boolean }) {
  // find integration row
  const integration = await prisma.integration.findUnique({ where: { id: userIntegrationId } });
  if (!integration) throw new Error('Integration not found');

  const tokens = { access_token: integration.accessToken, refresh_token: integration.refreshToken || undefined };
  const auth = oauth2ClientFromTokens(tokens);
  const gmail = google.gmail({ version: 'v1', auth });

  // List messages matching has:attachment and is:unread
  const listResp = await gmail.users.messages.list({
    userId: 'me',
    q: 'has:attachment is:unread'
  });

  const messageIds = listResp.data.messages || [];
  if (messageIds.length === 0) return [];

  const processedCandidateIds: string[] = [];

  for (const m of messageIds) {
    try {
      const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
      const payload = msg.data.payload;
      const headers = payload?.headers || [];
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();

      // Look for parts with filename -> attachments
      const parts = payload?.parts || [];
      for (const part of parts) {
        if (part.filename && part.filename.length) {
          // Get attachment id
          const attachId = part.body?.attachmentId;
          if (!attachId) continue;

          const attachResp = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: m.id!,
            id: attachId
          });
          const data = attachResp.data.data!;
          // data is base64url string
          const buffer = Buffer.from(data, 'base64');

          // Upload to S3
          const key = `resumes/email/${m.id}/${part.filename}`;
          await s3.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: part.mimeType || 'application/octet-stream'
          }));

          // Create Candidate in DB (minimal profile, parsing will fill rest)
          const candidate = await prisma.candidate.create({
            data: {
              roleId: '', // unknown if not associated to role — you may modify to map to default role or parse JD from email
              profile: {
                source: 'email',
                from,
                subject,
                receivedAt: date,
                s3Path: key,
                fileName: part.filename
              },
              status: 'received'
            }
          });

          // Create initial WorkflowExecution
          const wf = await prisma.workflowExecution.create({
            data: {
              candidateId: candidate.id,
              roleId: '', // blank for now; update if you have role mapping logic
              userId: integration.userId,
              status: 'in_progress',
              decisions: [],
              generatedContent: {},
              startTime: new Date(),
            }
          });

          // Option A: If you want to extract text server-side and call parseResume(text, filename)
          // (requires pdf/text extraction library). Simpler now: call your n8n webhook with S3 URL
          // using your existing parseResume function which expects text. If parseResume accepts S3 URL,
          // pass it; otherwise you can implement simple text extraction.

          // I will call your parseResume with a minimal placeholder (n8n should be able to fetch from S3)
          let parseResult;
          try {
            // If your parseResume accepts S3 URL or raw text, modify accordingly.
            // Here we attempt to call parseResume with a small payload telling n8n where to fetch the file.
            parseResult = await parseResume(JSON.stringify({ s3Path: key }), part.filename);
          } catch (pErr) {
            logError(createErrorDetails('N8N_RESUME_PARSER_FAILED', { originalError: String(pErr), candidateId: candidate.id }));
            parseResult = { data: null, error: { code: 'N8N_RESUME_PARSER_FAILED', shouldFallback: true } };
          }

          // Write ReasoningLog entry
          await prisma.reasoningLog.create({
            data: {
              actionType: 'parse',
              entityId: candidate.id,
              entityName: 'candidate',
              inputData: { s3Path: key, from, subject },
              outputData: parseResult.data || { error: parseResult.error },
              reasoning: parseResult.data ? 'Parsed via n8n' : 'Parse failed or fallback used',
              confidenceScore: parseResult.data?.matchScore || 0,
              status: parseResult.data ? 'success' : 'failed'
            }
          });

          // Update candidate evaluation/profile and workflow
          await prisma.candidate.update({
            where: { id: candidate.id },
            data: {
              profile: parseResult.data ? { ...candidate.profile as any, parsed: parseResult.data } : (candidate.profile as any),
              evaluation: parseResult.data ? { overallScore: parseResult.data.matchScore || 0 } : undefined,
              status: parseResult.data && (parseResult.data.matchScore >= 80) ? 'shortlisted' : 'received'
            }
          });

          await prisma.workflowExecution.update({
            where: { id: wf.id },
            data: {
              status: 'completed',
              decisions: parseResult.data ? [{ decision: parseResult.data.recommendation || 'review', confidence: parseResult.data.matchScore || 0 }] : [],
              generatedContent: {},
              endTime: new Date(),
              totalDuration: Math.max(0, (new Date()).getTime() - (wf.startTime.getTime()))
            }
          });

          processedCandidateIds.push(candidate.id);
        }
      }

      // Mark message as read if requested / after success
      if (opts?.markRead !== false) {
        await gmail.users.messages.modify({ userId: 'me', id: m.id!, requestBody: { removeLabelIds: ['UNREAD'] } });
      }
    } catch (err) {
      logError(createErrorDetails('SERVER_ERROR', { originalError: String(err), messageId: m.id }));
      // Continue processing other messages
    }
  }

  return processedCandidateIds;
}
