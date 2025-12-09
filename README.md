# HireFlow - AI-Powered Resume Screening

An agentic AI assistant that autonomously screens resumes, shortlists candidates with explainable reasoning, and auto-schedules interviews for lean HR teams.

## 🚀 Features

- **Autonomous Resume Screening:** AI-powered parsing and evaluation of 300-500 resumes per role
- **Explainable AI Reasoning:** Transparent scoring with detailed breakdowns
- **Auto-Scheduling:** Automated interview coordination with Gmail and Google Calendar
- **Human-in-Loop:** Approval gates and override capabilities
- **Audit Trails:** Complete reasoning logs for all AI decisions
- **MCP Integration:** Standardized tool access for AI agents

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **AI/LLM:** OpenAI GPT-4
- **Storage:** AWS S3
- **Integrations:** Gmail API, Google Calendar API (via MCP)
- **Testing:** Jest, fast-check (property-based testing)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- AWS account (for S3)
- Gmail and Google Calendar OAuth credentials

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hireflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   - Database URL
   - NextAuth secret
   - OpenAI API key
   - AWS credentials
   - Gmail/Calendar OAuth credentials

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
hireflow/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions
│   ├── ai/               # AI services (parsing, evaluation)
│   ├── mcp/              # MCP server integrations
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema
├── public/               # Static assets
└── tests/                # Test files

```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Property-based tests
Property-based tests use `fast-check` to validate correctness properties across 100+ random inputs.

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:
- **User:** HR users and authentication
- **UserSettings:** Approval gates, thresholds, availability
- **Role:** Job postings with evaluation criteria
- **Candidate:** Candidate profiles and evaluations
- **Interview:** Scheduled interviews
- **ReasoningLog:** Audit trail of AI decisions
- **Integration:** OAuth connections (Gmail, Calendar)

## 🔐 Security

- PII encryption at rest (AES-256)
- OAuth 2.0 for integrations
- JWT tokens for API authentication
- Input validation and sanitization
- Rate limiting on API endpoints

## 📈 Performance Targets

- Resume processing: 500 resumes in <5 minutes
- Single evaluation: <3 seconds
- Dashboard load: <1 second for 1000 candidates
- Real-time updates: <500ms latency

## 🤝 Contributing

This project follows the spec-driven development methodology. See `.kiro/specs/ai-resume-screening/` for:
- Requirements document
- Design document
- Implementation tasks

## 📝 License

[Add your license here]

## 👥 Team

[Add team information here]

## 📞 Support

For questions or issues, please contact [support email]
