from langchain_core.prompts import PromptTemplate

MAP_RELATIONSHIPS_PROMPT = PromptTemplate.from_template("""
You are an expert IT Skill Taxonomy System.
Given a list of NEW extracted skills and the FULL existing DB of skills, plus a list of canonical roles, determine:
1. "suggested_roles": Which canonical roles apply to each new skill (e.g. "react" -> ["frontend", "fullstack"]). Pick ONLY from the provided roles list: {roles}. If no role applies, return [].
2. "relations": Direct relationships between the new skill and skills in the DB (or other new skills).

RELATIONSHIP TYPES:
- "PARENT_OF": Skill A is a broader category / parent technology of Skill B (e.g. "javascript" PARENT_OF "react", "python" PARENT_OF "django", "devops" PARENT_OF "docker").
- "RELATED_TO": Skill A and Skill B are complementary or frequently used together in the same stack (e.g. "react" RELATED_TO "redux", "docker" RELATED_TO "kubernetes", "springboot" RELATED_TO "postgresql").

RULES:
- Only declare a relationship if you are 100% confident it is valid in IT domain.
- Do NOT create self-relationships (A -> A).
- Use exact lowercase normalized skill names as provided.
- For PARENT_OF relations, explicitly specify which skill is "parent" and which is "child".
- Target skill in relation MUST exist in the DB skills or new skills list.

OUTPUT FORMAT:
Return a JSON array of objects. Each object represents one new skill:
[
  {{
    "new_skill": "react",
    "suggested_roles": ["frontend", "fullstack"],
    "relations": [
      {{ "parent": "javascript", "child": "react", "type": "PARENT_OF" }},
      {{ "target": "redux", "type": "RELATED_TO" }}
    ]
  }}
]

If no relations are found for a new skill, set its "relations" to [].
Make sure the returned JSON is valid.

New Skills:
{new_skills}

All DB Skills:
{db_skills}
""")

VALIDATE_SKILLS_PROMPT = PromptTemplate.from_template("""
You are an expert IT taxonomist.
You are given a list of extracted skill strings that are NOT in our database yet.
Some might be real IT skills (e.g. "python", "react", "docker", "aws"), while others might be fake, garbage text, misspelled, generic soft skills, or non-IT terms (e.g. "cooking", "experience", "xyz123tech", "good", "knowledge").

Your task is to filter the list and return ONLY the strings that represent actual, recognized IT technologies, programming languages, frameworks, tools, or IT methodologies.
DO NOT normalize or change the spelling of the valid skills, return them exactly as provided in the input list.

Input skills to validate:
{skills}

Return ONLY a valid JSON array of strings containing the valid skills. Do NOT wrap it in extra markdown format like ```json.
If none are valid, return: []
""")
