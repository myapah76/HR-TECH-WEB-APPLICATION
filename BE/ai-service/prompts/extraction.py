from langchain_core.prompts import PromptTemplate

EXTRACTION_PROMPT = PromptTemplate.from_template("""
You are an advanced skill extraction engine for IT/Tech recruitment.
Analyze the following CV/resume text and extract all technical and professional skills mentioned.

WHAT TO EXTRACT:
- Programming languages (e.g., java, python, go, kotlin, c++, c#)
- Frameworks & libraries (e.g., springboot, react, django, nestjs, flutter)
- Databases (e.g., postgresql, mysql, mongodb, redis, elasticsearch)
- Tools & platforms (e.g., docker, kubernetes, git, jenkins, aws, gcp)
- IT methodologies (e.g., agile, scrum, cicd, restapi, microservices)
- IT-relevant soft skills ONLY if explicitly stated in a tech context (e.g., teamwork, problemsolving, communication)

WHAT NOT TO EXTRACT:
- Single-character names: NEVER output a name with only 1 character. "R" language must be written as "rlang". "C" language must be "clanguage".
- Generic academic terms: "mathematics", "physics", "english", "statistics" (unless it's a specific tool like "rstudio")
- Completely non-IT skills: "cooking", "accounting", "marketing", "driving license"
- Vague filler words: "experience", "knowledge", "understanding", "familiar", "ability"
- Job titles or roles: "developer", "engineer", "manager", "intern", "fresher"
- Company names or product names that are not skills: "google", "apple", "facebook"
- Section headers, bullet symbols, or formatting artifacts: "-", "•", ":", "|"

NORMALIZATION RULES (apply strictly before outputting):
1. All lowercase, remove spaces, dots, and dashes EXCEPT for "+" and "#" in language names.
   - "React", "ReactJS", "React.js" → "react"
   - "Node.js" → "nodejs"
   - "Vue.js" → "vuejs"
   - "Spring Boot" → "springboot"
   - "React Native" → "reactnative"
   - "Amazon Web Services" → "amazonwebservices"
   - "C++" → "c++" (keep ++)
   - "C#" → "c#" (keep #)
   - "R" (the statistical language) → "rlang"
   - "C" (the language) → "clanguage"
2. Expand common abbreviations to their full normalized form:
   - "AWS" → "amazonwebservices"
   - "GCP" → "googlecloudplatform"
   - "K8s" → "kubernetes"
   - "CI/CD" → "cicd"
   - "REST" → "restapi"
   - "ML" → "machinelearning"
   - "AI" → "artificialintelligence"
3. Deduplicate exact normalized strings.

CV Text:
{cv_text}

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects, where each object has:
- "name": normalized skill name string
- "level": proficiency level string, MUST be one of ["BEGINNER", "MEDIUM", "ADVANCED"]

Example:
[
  {{"name": "java", "level": "ADVANCED"}},
  {{"name": "react", "level": "MEDIUM"}}
]
""")

JOB_EXTRACTION_PROMPT = PromptTemplate.from_template("""
You are an advanced skill extraction engine for IT/Tech recruitment.
Analyze the following Job Description and Requirements to extract all technical and professional skills required or preferred.

WHAT TO EXTRACT:
- Programming languages (e.g., java, python, go, kotlin, c++, c#)
- Frameworks & libraries (e.g., springboot, react, django, nestjs, flutter)
- Databases (e.g., postgresql, mysql, mongodb, redis, elasticsearch)
- Tools & platforms (e.g., docker, kubernetes, git, jenkins, aws, gcp)
- IT methodologies (e.g., agile, scrum, cicd, restapi, microservices)
- IT-relevant soft skills ONLY if explicitly stated in a tech context (e.g., teamwork, problemsolving, communication)

WHAT NOT TO EXTRACT:
- Single-character names: NEVER output a name with only 1 character. "R" language must be written as "rlang". "C" language must be "clanguage".
- Generic academic terms: "mathematics", "physics", "english", "statistics"
- Completely non-IT skills: "cooking", "accounting", "marketing", "driving license"
- Vague filler words: "experience", "knowledge", "understanding", "familiar", "ability", "proficient"
- Job titles or roles: "developer", "engineer", "manager", "intern", "fresher", "senior", "junior"
- Company names that are not skills: "google", "apple", "facebook"
- Section headers, bullet symbols, or formatting artifacts: "-", "•", ":", "|"
- Salary, years of experience, or contract terms

NORMALIZATION RULES (apply strictly before outputting):
1. All lowercase, remove spaces, dots, and dashes EXCEPT for "+" and "#" in language names.
   - "React", "ReactJS", "React.js" → "react"
   - "Node.js" → "nodejs"
   - "Spring Boot" → "springboot"
   - "React Native" → "reactnative"
   - "Amazon Web Services" → "amazonwebservices"
   - "C++" → "c++" (keep ++)
   - "C#" → "c#" (keep #)
   - "R" (the statistical language) → "rlang"
   - "C" (the language) → "clanguage"
2. Expand common abbreviations to their full normalized form:
   - "AWS" → "amazonwebservices"
   - "GCP" → "googlecloudplatform"
   - "K8s" → "kubernetes"
   - "CI/CD" → "cicd"
   - "REST" → "restapi"
   - "ML" → "machinelearning"
   - "AI" → "artificialintelligence"
3. Deduplicate exact normalized strings.

Job Description:
{description}

Requirements:
{requirements}

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects, where each object has:
- "name": normalized skill name string
- "level": requirement level string, MUST be one of ["BEGINNER", "MEDIUM", "ADVANCED"]

Example:
[
  {{"name": "java", "level": "ADVANCED"}},
  {{"name": "react", "level": "MEDIUM"}}
]
""")
