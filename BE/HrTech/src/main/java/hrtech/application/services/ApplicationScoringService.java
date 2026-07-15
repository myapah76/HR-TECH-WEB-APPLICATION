package hrtech.application.services;

import hrtech.application.abstractions.repositories.ApplicationRepository;
import hrtech.application.abstractions.repositories.ApplicationScoreRepository;
import hrtech.application.abstractions.repositories.SkillMatchRepository;
import hrtech.application.dtos.response.ApplicationDetailResponse;
import hrtech.application.entities.Application;
import hrtech.application.entities.ApplicationScore;
import hrtech.application.entities.SkillMatch;
import hrtech.application.entities.enums.MatchStatus;
import hrtech.application.entities.enums.MatchType;
import hrtech.application.mapper.ApplicationMapper;
import hrtech.shared.enums.ScoreGrade;
import hrtech.shared.enums.SkillLevel;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.skill.abstractions.services.IRecommendationService;
import hrtech.skill.dtos.response.SkillMatchDetail;
import hrtech.skill.dtos.response.SkillMatchScoreResponse;
import hrtech.subscription.abstractions.services.ICreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationScoringService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationScoreRepository applicationScoreRepository;
    private final SkillMatchRepository skillMatchRepository;
    private final IRecommendationService recommendationService;
    private final ICreditService creditService;
    private final ApplicationMapper applicationMapper;

    public ApplicationDetailResponse scoreApplication(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        if (application.getApplicationScore() != null) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Application has already been scored.");
        }

        // Deduct token (APP_SCORING costs 10 AI_CREDIT)
        boolean isProcessed = false;

        if (creditService.hasCandidateFeatureAccess(userId, "APP_SCORING")) {
            creditService.deductCandidateQuota(userId, "AI_CREDIT", 10);
            isProcessed = true;
        }

        if (!isProcessed) {
            try {
                if (creditService.hasCompanyFeatureAccess(userId, "APP_SCORING")) {
                    creditService.deductCompanyFeatureQuota(userId, "AI_CREDIT", 10);
                    isProcessed = true;
                }
            } catch (Exception e) {
                // Ignore if user is not a company member
            }
        }

        if (!isProcessed) {
            throw new AppException(ErrorCode.FORBIDDEN, "Gói của bạn không có tính năng Chấm điểm CV (APP_SCORING). Vui lòng nâng cấp gói.");
        }

        try {
            SkillMatchScoreResponse matchScore = recommendationService.calculateMatchScore(application.getCv().getId(), application.getJob().getId());
            ScoreGrade grade = matchScore.getGrade();

            ApplicationScore applicationScore = ApplicationScore.builder()
                    .application(application)
                    .overallScore(BigDecimal.valueOf(matchScore.getOverallScore()))
                    .grade(grade)
                    .aiSummary("AI Score calculated from graph and embeddings")
                    .aiSuggestion(generateSuggestion(grade))
                    .modelVersion("1.0")
                    .scoredAt(Instant.now())
                    .build();

            applicationScore = applicationScoreRepository.save(applicationScore);
            application.setApplicationScore(applicationScore);

            // Save SkillMatch entities
            for (SkillMatchDetail detail : matchScore.getSkillDetails()) {
                MatchStatus mStatus;
                try {
                    mStatus = MatchStatus.valueOf(detail.getMatchStatus());
                } catch (Exception e) {
                    mStatus = MatchStatus.MISSING;
                }

                MatchType mType;
                try {
                    mType = MatchType.valueOf(detail.getMatchType());
                } catch (Exception e) {
                    if (detail.getMatchType() != null && detail.getMatchType().contains("RELATED")) {
                        mType = MatchType.RELATED;
                    } else if (detail.getMatchType() != null && detail.getMatchType().contains("PARENT")) {
                        mType = MatchType.PARENT;
                    } else if ("EXACT".equals(detail.getMatchType())) {
                        mType = MatchType.DIRECT;
                    } else {
                        mType = null;
                    }
                }

                SkillLevel reqLevel = null;
                try {
                    if (detail.getRequiredLevel() != null) reqLevel = SkillLevel.valueOf(detail.getRequiredLevel());
                } catch (Exception ignored) {}

                SkillLevel candLevel = null;
                try {
                    if (detail.getCandidateLevel() != null) candLevel = SkillLevel.valueOf(detail.getCandidateLevel());
                } catch (Exception ignored) {}

                SkillMatch skillMatch = SkillMatch.builder()
                        .applicationScore(applicationScore)
                        .skillNeo4jId(detail.getSkillNeo4jId())
                        .requiredLevel(reqLevel)
                        .candidateLevel(candLevel)
                        .matchStatus(mStatus)
                        .matchType(mType)
                        .weight(BigDecimal.valueOf(1.0))
                        .isMandatory(false)
                        .build();
                skillMatchRepository.save(skillMatch);
            }

        } catch (Exception e) {
            log.error("Failed to calculate AI match score for application {}", application.getId(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Failed to score application: " + e.getMessage());
        }

        return applicationMapper.toDetailResponse(application);
    }

    private String generateSuggestion(ScoreGrade grade) {
        return switch (grade) {
            case EXCELLENT -> "Ứng viên rất phù hợp với vị trí này.";
            case GOOD -> "Ứng viên khá phù hợp, cần kiểm tra thêm ở vòng phỏng vấn.";
            case FAIR -> "Ứng viên đạt yêu cầu cơ bản, nhưng thiếu một số kỹ năng quan trọng.";
            case POOR -> "Ứng viên chưa đáp ứng yêu cầu của vị trí này.";
        };
    }
}
