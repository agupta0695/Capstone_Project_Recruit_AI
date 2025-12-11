# Gmail and Calendar Integration with n8n

## Overview
This guide explains how to integrate Gmail and Google Calendar with your hiring application using n8n workflows.

## Prerequisites
1. n8n instance running (Docker or local)
2. Google Cloud Project with Gmail and Calendar APIs enabled
3. OAuth2 credentials configured

## Setup Steps

### 1. Google Cloud Configuration

#### Enable APIs
1. Go to Google Cloud Console
2. Enable Gmail API
3. Enable Google Calendar API

#### Create OAuth2 Credentials
1. Go to APIs & Services > Credentials
2. Create OAuth2 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:5678/rest/oauth2-credential/callback`
   - `https://your-n8n-domain.com/rest/oauth2-credential/callback`

### 2. n8n Credential Setup

#### Gmail OAuth2 Credential
1. In n8n, go to Settings > Credentials
2. Create new credential: "Gmail OAuth2 API"
3. Enter your Google OAuth2 credentials:
   - Client ID: `your-client-id`
   - Client Secret: `your-client-secret`
4. Authorize and save as "Gmail OAuth2"

#### Google Calendar OAuth2 Credential
1. Create new credential: "Google Calendar OAuth2 API"
2. Enter the same OAuth2 credentials
3. Authorize and save as "Google Calendar OAuth2"

### 3. Import n8n Workflows

#### Gmail Sender Workflow
- **File**: `n8n-workflows/gmail-sender-workflow.json`
- **Webhook URL**: `http://localhost:5678/webhook/send-email`
- **Purpose**: Send emails for interview invitations and rejections

#### Calendar Scheduler Workflow
- **File**: `n8n-workflows/calendar-scheduler-workflow.json`
- **Webhook URL**: `http://localhost:5678/webhook/schedule-event`
- **Purpose**: Create calendar events for interviews

### 4. Workflow Configuration

#### Gmail Workflow Setup
1. Import the Gmail workflow JSON
2. Configure Gmail node credentials to use "Gmail OAuth2"
3. Test the webhook endpoint
4. Activate the workflow

#### Calendar Workflow Setup
1. Import the Calendar workflow JSON
2. Configure Google Calendar node credentials to use "Google Calendar OAuth2"
3. Set calendar ID to "primary" or specific calendar
4. Test the webhook endpoint
5. Activate the workflow

## API Integration

### Email Sending
```javascript
// Send interview invitation
const emailResponse = await fetch('http://host.docker.internal:5678/webhook/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'candidate@email.com',
    subject: 'Interview Invitation - Software Engineer',
    body: 'Dear John, We are pleased to invite you for an interview...'
  })
});
```

### Calendar Event Creation
```javascript
// Schedule interview
const calendarResponse = await fetch('http://host.docker.internal:5678/webhook/schedule-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Interview: John Doe - Software Engineer',
    description: 'Technical interview for Software Engineer position',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T11:00:00Z',
    attendees: 'candidate@email.com,interviewer@company.com',
    location: 'Online Meeting'
  })
});
```

## Workflow Triggers

### Automatic Email Sending
The application automatically sends emails when:
1. **Candidate Shortlisted**: Interview invitation to candidate + HR notification
2. **Candidate Rejected**: Polite rejection email to candidate

### Automatic Calendar Scheduling
The application automatically creates calendar events when:
1. **Interview Scheduled**: Creates Google Calendar event with meeting link
2. **Attendees Added**: Includes candidate and interviewer emails

## Testing

### Test Email Workflow
```bash
curl -X POST http://localhost:5678/webhook/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email from n8n workflow"
  }'
```

### Test Calendar Workflow
```bash
curl -X POST http://localhost:5678/webhook/schedule-event \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "attendees": "test@example.com"
  }'
```

## Troubleshooting

### Common Issues

#### OAuth2 Authorization Failed
- Check client ID and secret
- Verify redirect URIs in Google Cloud Console
- Re-authorize credentials in n8n

#### Webhook Not Responding
- Ensure n8n workflows are active
- Check webhook URLs are correct
- Verify n8n is accessible from application

#### Gmail API Quota Exceeded
- Check Google Cloud Console quotas
- Implement rate limiting in application
- Consider using batch operations

#### Calendar Events Not Created
- Verify Calendar API is enabled
- Check calendar permissions
- Ensure attendee emails are valid

### Debug Mode
Enable debug logging in n8n:
```bash
docker run -e N8N_LOG_LEVEL=debug n8nio/n8n
```

## Security Considerations

1. **OAuth2 Scopes**: Use minimal required scopes
2. **Webhook Security**: Consider adding authentication to webhooks
3. **Data Privacy**: Ensure compliance with email and calendar data handling
4. **Rate Limiting**: Implement proper rate limiting for API calls

## Production Deployment

### Environment Variables
```bash
# n8n Configuration
N8N_HOST=your-n8n-domain.com
N8N_PORT=443
N8N_PROTOCOL=https

# Google OAuth2
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Scaling Considerations
- Use n8n cloud or dedicated server for production
- Implement proper monitoring and alerting
- Set up backup and recovery procedures
- Monitor API quotas and usage

## Integration Status

✅ **Gmail Workflow**: Ready for production
✅ **Calendar Workflow**: Ready for production
✅ **API Integration**: Implemented with fallbacks
✅ **Error Handling**: Comprehensive error handling
✅ **Testing**: Test scripts available

## Next Steps

1. Set up Google Cloud credentials
2. Import n8n workflows
3. Configure OAuth2 credentials
4. Test email and calendar integration
5. Deploy to production environment