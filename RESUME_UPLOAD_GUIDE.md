# Resume Upload Feature - Testing Guide

## What's Been Fixed

The resume upload feature has been fully implemented with the following components:

### 1. API Routes Created
- `/api/roles` - Create and list roles
- `/api/roles/[id]` - Get role details with candidates
- `/api/resumes/upload` - Upload and process resumes
- `/api/candidates/[id]` - View and update candidate status

### 2. Pages Created
- `/dashboard/roles/new` - Create new job role
- `/dashboard/roles/[id]` - View role details and upload resumes
- `/dashboard/candidates/[id]` - View candidate details

### 3. Features Implemented
- **Resume Parsing**: Extracts name, email, phone, and skills from text
- **AI Scoring**: Matches candidate skills against role requirements (0-100 score)
- **Auto-Categorization**: 
  - Shortlisted (≥70)
  - Review (50-69)
  - Rejected (<50)
- **Multi-file Upload**: Upload multiple resumes at once
- **Detailed Logging**: Console logs for debugging

## How to Test

### Step 1: Create a Role
1. Go to http://localhost:3000/dashboard
2. Click "New Role" button
3. Fill in the form:
   - Title: "Senior Frontend Developer"
   - Department: "Engineering"
   - Description: "Looking for experienced React developer"
   - Required Skills: "React, TypeScript, Node.js"
   - Experience Level: "Senior"
   - Education: "Bachelor's"
4. Click "Create Role"

### Step 2: Upload Resumes
1. You'll be redirected to the role detail page
2. Click "Upload Resumes" button
3. Select one or more files:
   - Use the provided `test-resume.txt` file
   - Or create your own .txt, .pdf, .doc, or .docx files
4. Wait for upload to complete
5. You should see an alert: "Successfully processed X resume(s)"

### Step 3: View Candidates
1. The candidates will appear in the list below
2. Filter by status: All, Shortlisted, Review, Rejected
3. Click on a candidate to view details
4. You can manually override the AI decision using the buttons

## Test Resume File

A sample resume file `test-resume.txt` has been created in the project root with:
- Name: John Doe
- Skills: JavaScript, React, Node.js, TypeScript, Python, SQL, AWS, Docker
- Email and phone number
- Experience and education details

This resume should score well for roles requiring JavaScript/React/Node.js skills.

## Debugging

If upload fails, check:
1. Browser console (F12) for error messages
2. Server logs in the terminal running `npm run dev`
3. The upload API includes extensive console.log statements

Common issues:
- File size too large (Next.js default limit is 4MB)
- Unsupported file type
- Missing authorization token
- Database connection issues

## File Format Support

Currently supported formats:
- .txt (best for testing)
- .pdf (requires text extraction)
- .doc/.docx (requires text extraction)

For MVP, .txt files work best as they use simple `file.text()` extraction.

## Next Steps

After testing, you can:
1. Upload real resumes
2. Create multiple roles
3. Test the candidate detail page
4. Try manual status overrides
5. Check the dashboard statistics update

The system is now fully functional for the MVP scope!
