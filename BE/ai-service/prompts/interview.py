from langchain_core.prompts import PromptTemplate

INTERVIEW_QUESTIONS_PROMPT = PromptTemplate.from_template("""
You are an expert IT Technical Recruiter.
Generate a list of {num_questions} interview questions in Vietnamese for a candidate applying for the position of '{target_role}'.

Inputs:
- Candidate CV Text: {cv_text}
- Job Description (JD): {jd_text}

Rules for Question Generation:
1. The questions must test both Technical Skills (core concepts, architectural design) and Behavioral/Soft Skills.
2. Align the difficulty with the candidate's experience level from CV, and requirements from JD.
3. Tailor at least 2 questions directly targeting the projects or specific technologies mentioned in the candidate's CV.
4. Output must be a clean JSON array of strings representing the questions. Do NOT wrap it in extra markdown format like ```json, just pure JSON array.

Example:
[
  "Question 1?",
  "Question 2?"
]
""")

EVALUATE_AUDIO_ANSWER_PROMPT = """
You are an expert Senior IT Recruiter.
Analyze the candidate's spoken answer (provided in the audio file) to the following interview question, using the candidate's CV and the Job Description (JD) as context.

Inputs:
- Candidate CV: {cv_text}
- Job Description (JD): {jd_text}
- Interview Question: {question}

Tasks:
Evaluate the candidate's spoken answer directly from the audio file:
1. Rate the answer correctness and completeness on a scale of 0.0 to 10.0. Set this as "score".
2. Provide constructive feedback (nhận xét) on technical accuracy, completeness, and communication structure (e.g., clarity, confidence, pacing heard in the audio) in Vietnamese. Set this as "feedback".
3. Provide a recommended model answer (câu trả lời tối ưu gợi ý) in Vietnamese. Set this as "modelAnswer".

CRITICAL RULES:
- All output fields (feedback, modelAnswer) MUST be in Vietnamese.
- Output must be a clean JSON object matching the following structure (do NOT wrap it in markdown block like ```json):
{{
  "score": 8.0,
  "feedback": "...",
  "modelAnswer": "..."
}}
"""

INTERVIEW_EVALUATION_PROMPT = PromptTemplate.from_template("""
You are an expert Senior IT Recruiter.
Evaluate the candidate's overall mock interview performance based on the CV, Job Description (JD), and the feedback/scores of each question they answered.
Inputs:
- Candidate CV: {cv_text}
- Job Description (JD): {jd_text}
- Question Feedbacks:
{transcript_text}
Evaluation Guidelines:
1. Rate the overall score on a scale of 0.0 to 10.0.
2. Rate individual score components: Technical (chuyên môn), Communication (giao tiếp), Soft Skills (kỹ năng mềm) on a scale of 0.0 to 10.0.
3. Detail strengths and weaknesses in Vietnamese.
4. Provide a general feedback summary in Vietnamese.
5. Language: All feedbacks, suggestions, and text MUST be in Vietnamese.
6. Output must be a clean JSON object matching the following structure, do NOT wrap it in extra markdown format like ```json, just pure JSON:
{{
  "overallScore": 8.5,
  "technicalScore": 8.0,
  "communicationScore": 9.0,
  "softSkillsScore": 8.5,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "generalFeedback": "..."
}}
""")
