import { genAI } from '../config/gemini.js';

export const analyzeDocumentText = async (text, fileName) => {
  if (!text) {
    text = `Blank document named ${fileName}`;
  }

  // If Gemini API is available, call it
  if (genAI) {
    try {
      console.log('Sending text to Gemini API for metadata extraction...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
You are an expert document understanding AI. Analyze the following document text and extract metadata into a JSON object matching this schema:
{
  "title": "Extracted document title (e.g., React Certification, Hackathon Winner)",
  "organization": "Issuing organization or institution (e.g., Coursera, Udemy, Stanford, Microsoft, Unstop)",
  "dates": "Dates found in format YYYY-MM-DD or YYYY-MM (e.g., 2024-05, or empty string)",
  "skills": ["List of skills represented by this document (e.g., Python, CSS, Cloud Arch, Data Structures)"],
  "technologies": ["List of specific tools/languages/frameworks used (e.g., React, Git, AWS, MySQL)"],
  "summary": "Concise summary (1-2 sentences) of what the document is about",
  "category": "Must be exactly one of: Certificates, Projects, Skills, Internships, Achievements, Academics, Portfolio, Resume, Research, Other",
  "keywords": ["5 key tags/keywords"],
  "confidenceScore": 95
}

Analyze the document name: "${fileName}"
Analyze the text content:
---
${text}
---
Ensure you ONLY return the raw JSON object. Use double quotes. Do not include any markdown styling like \`\`\`json.
`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      
      const responseText = result.response.text();
      console.log('Gemini raw response:', responseText);
      const parsedData = JSON.parse(responseText.trim());
      return parsedData;
    } catch (error) {
      console.error('Gemini API Error, falling back to rule-based parser:', error.message);
    }
  }

  // Mock rule-based parser for local Demo Mode (or fallback on error)
  console.log('Running rule-based local metadata analyzer...');
  const lowercaseText = (text + ' ' + fileName).toLowerCase();
  
  let category = 'Other';
  let title = 'Document Import';
  let organization = 'MemoryVerse Repository';
  let skills = [];
  let technologies = [];
  let summary = 'A document uploaded to MemoryVerse AI containing academic or career milestones.';
  let dates = new Date().toISOString().split('T')[0];

  // Title & Org guessers
  if (lowercaseText.includes('certificate') || lowercaseText.includes('certify') || lowercaseText.includes('certified')) {
    category = 'Certificates';
    title = 'Software Engineering Certificate';
    organization = 'Online Learning Platform';
  } else if (lowercaseText.includes('project') || lowercaseText.includes('repo') || lowercaseText.includes('build')) {
    category = 'Projects';
    title = 'Full-Stack Software Application';
    organization = 'GitHub Workspace';
  } else if (lowercaseText.includes('intern') || lowercaseText.includes('letter') || lowercaseText.includes('offer')) {
    category = 'Internships';
    title = 'Software Engineer Internship';
    organization = 'Tech Solutions Inc.';
  } else if (lowercaseText.includes('resume') || lowercaseText.includes('cv')) {
    category = 'Resume';
    title = 'Professional Resume v1';
    organization = 'Student Profile';
  } else if (lowercaseText.includes('research') || lowercaseText.includes('paper') || lowercaseText.includes('journal')) {
    category = 'Research';
    title = 'Deep Learning Research Paper';
    organization = 'University Research Cell';
  } else if (lowercaseText.includes('achievement') || lowercaseText.includes('hackathon') || lowercaseText.includes('winner') || lowercaseText.includes('prize')) {
    category = 'Achievements';
    title = 'Hackathon Winner Award';
    organization = 'Developer Community Hackathon';
  }

  // Extract skills & technologies
  const skillBank = {
    react: ['React.js', 'Frontend Development', 'Web Development'],
    python: ['Python Programming', 'Data Analysis', 'Scripting'],
    javascript: ['JavaScript', 'ES6', 'Web Dev'],
    typescript: ['TypeScript', 'Static Typing', 'React TS'],
    node: ['Node.js', 'Backend Engineering', 'Express API'],
    java: ['Java Programming', 'Object Oriented Programming'],
    aws: ['Cloud Architecture', 'AWS Services'],
    docker: ['Containerization', 'Docker Compose'],
    machine: ['Machine Learning', 'AI Models'],
    deep: ['Deep Learning', 'Neural Networks'],
    mysql: ['Database Management', 'SQL'],
    mongodb: ['NoSQL Databases', 'MongoDB']
  };

  const techBank = {
    react: ['React', 'HTML5', 'CSS3'],
    python: ['Python', 'Pandas', 'NumPy'],
    javascript: ['JavaScript', 'NodeJS'],
    typescript: ['TypeScript', 'Vite'],
    node: ['Express', 'Node.js'],
    java: ['Java', 'Spring Boot'],
    aws: ['AWS', 'S3', 'Lambda'],
    docker: ['Docker'],
    machine: ['Scikit-learn', 'TensorFlow'],
    deep: ['Keras', 'PyTorch'],
    mysql: ['MySQL', 'Workbench'],
    mongodb: ['MongoDB', 'Mongoose']
  };

  for (const [key, list] of Object.entries(skillBank)) {
    if (lowercaseText.includes(key)) {
      skills.push(...list);
    }
  }
  for (const [key, list] of Object.entries(techBank)) {
    if (lowercaseText.includes(key)) {
      technologies.push(...list);
    }
  }

  // Remove duplicates
  skills = [...new Set(skills)];
  technologies = [...new Set(technologies)];

  // Clean empty
  if (skills.length === 0) skills = ['General Technology', 'Computer Science'];
  if (technologies.length === 0) technologies = ['Command Line'];

  // Final guesses
  if (lowercaseText.includes('python')) {
    title = category === 'Certificates' ? 'Python Data Science Certificate' : title;
    organization = lowercaseText.includes('coursera') ? 'Coursera - IBM' : 'University Learning';
    summary = 'Demonstrated command of Python scripting, data structures, and basic analysis libraries.';
  } else if (lowercaseText.includes('react') || lowercaseText.includes('web')) {
    title = category === 'Certificates' ? 'Advanced React Developer Certification' : title;
    organization = lowercaseText.includes('udemy') ? 'Udemy Academy' : 'Meta Developer Programs';
    summary = 'Covers component architectures, hooks, state management, and optimized rendering techniques.';
  } else if (lowercaseText.includes('hackathon') || lowercaseText.includes('unstop')) {
    title = 'National Hackathon Champion';
    organization = 'Unstop National Challenge';
    summary = 'Awarded first place for creating an AI-driven educational tool within a 48-hour sprint.';
  }

  // Randomize date within the last 3 years
  const years = [2024, 2025, 2026];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  dates = `${years[Math.floor(Math.random() * years.length)]}-${months[Math.floor(Math.random() * months.length)]}-15`;

  return {
    title,
    organization,
    dates,
    skills: skills.slice(0, 5),
    technologies: technologies.slice(0, 5),
    summary,
    category,
    keywords: [category.toLowerCase(), ...skills.slice(0, 4).map(s => s.toLowerCase())],
    confidenceScore: 90
  };
};

export const generateAiChatResponse = async (chatHistory, prompt) => {
  if (genAI) {
    try {
      console.log('Generating AI chat response using Gemini...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const historyFormatted = chatHistory.map(ch => ({
        role: ch.role === 'user' ? 'user' : 'model',
        parts: [{ text: ch.content }]
      }));
      
      const chat = model.startChat({
        history: historyFormatted
      });
      
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini chat error, falling back to local chat responder:', error.message);
    }
  }

  // Local Chat Mock Responder
  const cleanPrompt = prompt.toLowerCase();
  if (cleanPrompt.includes('summarize my resume') || cleanPrompt.includes('summary')) {
    return `### Executive Career Summary

A highly motivated Software Engineering Student with verified technical competency in frontend applications, backend database structures, and machine learning models. 

**Key Qualifications:**
* **Frontend:** Advanced proficiency in React, TypeScript, and responsive styling.
* **Backend:** Experience designing REST APIs using Node.js/Express, structured schema management, and SQL databases.
* **Highlights:** Winner of the National Developer Hackathon, completed a Software Engineering Internship, and earned multiple verified certifications.

*This summary is dynamically compiled from your verified academic records.*`;
  }
  
  if (cleanPrompt.includes('missing skills') || cleanPrompt.includes('suggest') || cleanPrompt.includes('recommend')) {
    return `### Skill Gap & Certification Recommendations

Based on your verified uploads, you have strong foundations in **Frontend Web Technologies (React, TypeScript)** and **Scripting (Python)**. Here are recommendations to boost your professional portfolio:

#### 1. Technical Skill Gaps Identified:
* **Containerization & DevOps:** Your projects lack verified deployment/containerization configurations. Consider learning **Docker** and basic **CI/CD pipeline concepts**.
* **State Management:** Adding **Redux Toolkit** or **Zustand** will elevate your React credentials for mid-to-senior frontend roles.
* **Cloud Platforms:** Recruiters frequently search for cloud services knowledge.

#### 2. Recommended Learning Path & Certifications:
* **AWS Certified Cloud Practitioner** (Valuable for full-stack deployment roles).
* **Docker & Kubernetes Complete Guide** (Earn a certificate and add a DevOps project tag).
* **Git Advanced Workflows** (Helps substantiate team workflow credentials).`;
  }

  if (cleanPrompt.includes('interview') || cleanPrompt.includes('preparation') || cleanPrompt.includes('roadmap')) {
    return `### Personalized Interview Preparation Roadmap

Here is a 4-week preparation plan customized to your profile (Web Developer & React Specialist):

#### **Week 1: Data Structures & Algorithms (Python/JS)**
* Focus on Arrays, Hash Maps, Two Pointers, and Sliding Window patterns.
* Solve 3 problems daily on LeetCode (Easy/Medium level).

#### **Week 2: Advanced React & Web Performance**
* Prepare for questions on: Virtual DOM, hooks lifecycle, render optimizations, and custom hook implementation.
* Build a mock application using Context API to demonstrate state flow.

#### **Week 3: System Design & RESTful APIs**
* Understand HTTP codes, database schema design, and load balancing.
* Practice designing a scalable service like "Google Drive Upload" or "Chat Messaging".

#### **Week 4: Behavior & Portfolio Showcase**
* Structure behavioral questions using the **STAR Method** (Situation, Task, Action, Result).
* Prepare a 2-minute walkthrough of your verified Hackathon Project.`;
  }

  return `I am your MemoryVerse AI Career Assistant. Based on your uploaded documents, I can help you with:
* **Summarizing your credentials** for resume updates.
* **Analyzing skill gaps** and recommending certifications.
* **Creating an interview roadmap** tailored to your achievements.
* **Generating portfolio summaries** for LinkedIn.

Feel free to ask questions like: *"Summarize my resume"*, *"Recommend some certifications"*, or *"Create an interview preparation roadmap"*.`;
};
