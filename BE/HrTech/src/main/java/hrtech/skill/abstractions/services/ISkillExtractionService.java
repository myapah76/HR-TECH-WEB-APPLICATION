package hrtech.skill.abstractions.services;

import hrtech.skill.dtos.response.CvExtractionResponse;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import hrtech.skill.dtos.response.JobExtractionResponse;
public interface ISkillExtractionService {

    /**
     * Extract skills from CV using Gemini AI.
     * 1. Get parsedContent from CV (PostgreSQL)
     * 2. Send to Gemini API for skill extraction
     * 3. Match extracted skills with existing Neo4j skills
     * 4. Create new SkillNodes (isVerified=false) with embeddings for unknown skills
     * 5. Create CvSkill bridge records in PostgreSQL
     */
    CompletableFuture<CvExtractionResponse> extractAndSaveSkills(UUID cvId);

    CompletableFuture<JobExtractionResponse> extractAndSaveJobSkills(UUID jobId);
}
