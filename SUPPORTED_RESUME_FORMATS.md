# Supported Resume Formats - HireFlow

## 📄 Currently Accepted Formats

The file input accepts the following formats:
```html
<input accept=".pdf,.doc,.docx,.txt" />
```

### Format List:
1. **.txt** - Plain text files
2. **.pdf** - PDF documents
3. **.doc** - Microsoft Word (legacy)
4. **.docx** - Microsoft Word (modern)

---

## ⚠️ Current Implementation Status

### ✅ Fully Working: `.txt` (Plain Text)

**Method**: `file.text()`

**How it works**:
```javascript
async function extractTextFromFile(file: File): Promise<string> {
  const text = await file.text();
  return text;
}
```

**Pros**:
- ✅ Simple and reliable
- ✅ No external libraries needed
- ✅ Works perfectly for MVP testing
- ✅ Fast processing

**Cons**:
- ❌ Only works for plain text files
- ❌ Cannot extract text from PDF/DOC/DOCX

**Best for**:
- Testing and development
- Simple resume submissions
- Text-based applications

---

### ⚠️ Limited Support: `.pdf`, `.doc`, `.docx`

**Current Status**: **ACCEPTED BUT NOT FULLY FUNCTIONAL**

**What happens**:
1. Files are accepted by the file input
2. `file.text()` is called on them
3. For binary files (PDF, DOC, DOCX), this returns:
   - Raw binary data as text (unreadable)
   - Or empty string
   - Or garbled characters

**Result**: 
- ❌ Name extraction fails (gets binary data)
- ❌ Email extraction fails
- ❌ Phone extraction fails
- ❌ Skills extraction fails
- ❌ Score will be 0 or incorrect

---

## 🔧 What Needs to Be Added for Full Support

### For PDF Files

**Option 1: pdf-parse (Node.js)**
```bash
npm install pdf-parse
```

```javascript
import pdf from 'pdf-parse';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}
```

**Option 2: pdfjs-dist (Browser + Server)**
```bash
npm install pdfjs-dist
```

---

### For DOC/DOCX Files

**Option 1: mammoth (DOCX only)**
```bash
npm install mammoth
```

```javascript
import mammoth from 'mammoth';

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
```

**Option 2: textract (All formats)**
```bash
npm install textract
```

```javascript
import textract from 'textract';

async function extractTextFromFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(filePath, (error, text) => {
      if (error) reject(error);
      else resolve(text);
    });
  });
}
```

---

## 📊 Current vs Full Implementation

| Format | Accepted | Extracted | Parsed | Scored |
|--------|----------|-----------|--------|--------|
| .txt | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| .pdf | ✅ Yes | ❌ No | ❌ No | ❌ No |
| .doc | ✅ Yes | ❌ No | ❌ No | ❌ No |
| .docx | ✅ Yes | ❌ No | ❌ No | ❌ No |

---

## 🎯 Recommended Approach for MVP

### Option 1: Text Files Only (Current - WORKING)
**Best for**: Quick testing and MVP demo

**Change needed**:
```tsx
// In app/dashboard/roles/[id]/page.tsx
<input
  type="file"
  multiple
  accept=".txt"  // Only accept text files
  onChange={handleFileUpload}
/>
```

**Pros**:
- ✅ Works perfectly right now
- ✅ No additional dependencies
- ✅ Fast and reliable
- ✅ Good for testing

**Cons**:
- ❌ Users must convert resumes to .txt
- ❌ Not production-ready

---

### Option 2: Add PDF Support (Recommended)
**Best for**: Production MVP

**Steps**:
1. Install pdf-parse:
   ```bash
   npm install pdf-parse
   ```

2. Update extraction function:
   ```javascript
   import pdf from 'pdf-parse';
   
   async function extractTextFromFile(file: File): Promise<string> {
     const fileType = file.name.split('.').pop()?.toLowerCase();
     
     if (fileType === 'txt') {
       return await file.text();
     }
     
     if (fileType === 'pdf') {
       const arrayBuffer = await file.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       const data = await pdf(buffer);
       return data.text;
     }
     
     throw new Error(`Unsupported file type: ${fileType}`);
   }
   ```

3. Update accept attribute:
   ```tsx
   accept=".pdf,.txt"
   ```

**Pros**:
- ✅ Supports most common resume format (PDF)
- ✅ Still supports text files
- ✅ One additional dependency
- ✅ Production-ready

**Cons**:
- ⚠️ Requires npm install
- ⚠️ Slightly slower processing

---

### Option 3: Full Format Support
**Best for**: Post-MVP / Production

**Steps**:
1. Install multiple libraries:
   ```bash
   npm install pdf-parse mammoth
   ```

2. Create comprehensive extraction:
   ```javascript
   async function extractTextFromFile(file: File): Promise<string> {
     const fileType = file.name.split('.').pop()?.toLowerCase();
     const arrayBuffer = await file.arrayBuffer();
     const buffer = Buffer.from(arrayBuffer);
     
     switch (fileType) {
       case 'txt':
         return await file.text();
       
       case 'pdf':
         const pdfData = await pdf(buffer);
         return pdfData.text;
       
       case 'docx':
         const docxResult = await mammoth.extractRawText({ buffer });
         return docxResult.value;
       
       case 'doc':
         // Requires additional library or conversion
         throw new Error('DOC format not yet supported');
       
       default:
         throw new Error(`Unsupported file type: ${fileType}`);
     }
   }
   ```

**Pros**:
- ✅ Supports all major formats
- ✅ Production-ready
- ✅ Best user experience

**Cons**:
- ⚠️ Multiple dependencies
- ⚠️ More complex code
- ⚠️ Slower processing

---

## 🚀 Quick Fix for Current System

### Immediate Solution (No Code Changes)

**Tell users to**:
1. Open their resume in Word/PDF viewer
2. Select all text (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into Notepad
5. Save as .txt file
6. Upload the .txt file

**Or provide a converter**:
- Use online tools: PDF to Text converter
- Save as .txt from Word: File → Save As → Plain Text

---

## 📝 Testing Guide

### Test with .txt (Works Now)
```
1. Use test-resume.txt (provided)
2. Upload → ✅ Works perfectly
3. Score: 100, Status: Shortlisted
```

### Test with .pdf (Currently Broken)
```
1. Upload any PDF resume
2. Upload → ⚠️ Accepted but fails parsing
3. Result: Name = binary data, Score = 0
```

### Test with .docx (Currently Broken)
```
1. Upload any DOCX resume
2. Upload → ⚠️ Accepted but fails parsing
3. Result: Name = binary data, Score = 0
```

---

## 💡 Recommendation

**For MVP Testing (Now)**:
- ✅ Use `.txt` files only
- ✅ Update accept attribute to `accept=".txt"`
- ✅ Provide sample text resume
- ✅ Document limitation

**For Production (Next)**:
- 🔧 Add PDF support with pdf-parse
- 🔧 Update accept to `accept=".pdf,.txt"`
- 🔧 Test with real PDF resumes
- 🔧 Add error handling for unsupported formats

**For Full Release (Later)**:
- 🚀 Add DOCX support with mammoth
- 🚀 Add file type validation
- 🚀 Add file size limits
- 🚀 Add progress indicators
- 🚀 Store actual files (not just names)

---

## 🎯 Current Status Summary

**What works**: `.txt` files ✅  
**What's accepted but broken**: `.pdf`, `.doc`, `.docx` ⚠️  
**What's needed**: PDF parsing library 🔧  

**For testing right now**: Use `test-resume.txt` - it works perfectly!
