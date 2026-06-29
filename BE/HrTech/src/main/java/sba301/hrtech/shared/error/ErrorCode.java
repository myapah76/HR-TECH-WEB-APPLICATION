package sba301.hrtech.shared.error;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    // Token
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token has expired"),
    TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "Token not found"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token is invalid"),
    TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, "Token has been revoked"),
    MISSING_COOKIE(HttpStatus.BAD_REQUEST, "Missing authentication cookie"),

    // Redis
    REDIS_DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "Redis data not found"),
    OTP_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save OTP"),
    OTP_DELETE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete OTP"),
    OTP_RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "OTP rate limit exceeded"),

    // Auth
    EMAIL_NOT_FOUND(HttpStatus.NOT_FOUND, "Email not found"),
    EMAIL_ALREADY_REGISTERED(HttpStatus.CONFLICT, "Email already registered"),
    WRONG_PASSWORD(HttpStatus.UNAUTHORIZED, "Wrong password"),
    WRONG_OTP_CODE(HttpStatus.BAD_REQUEST, "Wrong OTP code"),
    OTP_EXPIRED(HttpStatus.BAD_REQUEST, "OTP expired"),
    TOO_MANY_FAILED_ATTEMPTS(HttpStatus.TOO_MANY_REQUESTS, "Too many failed attempts"),
    PENDING_USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Pending user not found"),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    USER_ALREADY_REGISTERED(HttpStatus.CONFLICT, "User already registered"),

    // Role
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "Role not found"),

    // Common
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad request"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation error"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "Invalid input"),

    // Skill
    SKILL_NOT_FOUND(HttpStatus.NOT_FOUND, "Skill not found"),
    SKILL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Skill already exists"),
    SKILL_SELF_RELATIONSHIP(HttpStatus.BAD_REQUEST, "Skill cannot relate to itself"),

    // Recommendation
    CV_NOT_FOUND(HttpStatus.NOT_FOUND, "CV not found"),
    JOB_NOT_FOUND(HttpStatus.NOT_FOUND, "Job not found"),
    CV_HAS_NO_SKILLS(HttpStatus.BAD_REQUEST, "CV has no skills"),
    CV_CONTENT_EMPTY(HttpStatus.BAD_REQUEST, "CV content is empty"),

    //Cv
    CV_NOT_BELONG_TO_USER(HttpStatus.FORBIDDEN, "CV does not belong to the user"),

    // AI
    AI_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "AI service unavailable"),
    AI_EXTRACTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AI extraction failed"),

    // Job
    JOB_NOT_FOUND_CODE(HttpStatus.NOT_FOUND, "Job not found"),
    JOB_INVALID_STATUS(HttpStatus.BAD_REQUEST, "Job status is invalid"),
    JOB_NOT_OWNER(HttpStatus.FORBIDDEN, "You are not the owner of this job"),
    JOB_COMPANY_NOT_APPROVED(HttpStatus.FORBIDDEN, "Company is not approved"),
    JOB_PERMISSION_DENIED(HttpStatus.FORBIDDEN, "Permission denied"),
    JOB_SKILL_NOT_FOUND(HttpStatus.NOT_FOUND, "Job skill not found"),

    // Subscription
    SUBSCRIPTION_PLAN_NOT_FOUND(HttpStatus.NOT_FOUND, "Subscription plan not found"),
    INSUFFICIENT_QUOTA(HttpStatus.PAYMENT_REQUIRED, "Insufficient quota for this operation"),

    // Payment
    HAS_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Payment error occurred"),
    ORDER_CODE_NOT_FOUND(HttpStatus.NOT_FOUND, "Order code not found"),
    WEBHOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "Webhook not found"),
    PAYMENT_VERIFICATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Payment verification failed"),

    // Feature
    FEATURE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Feature already exists"),
    FEATURE_NOT_FOUND(HttpStatus.NOT_FOUND, "Feature not found"),

    // Company
    COMPANY_NOT_FOUND(HttpStatus.NOT_FOUND, "Company not found"),
    COMPANY_BANNED(HttpStatus.FORBIDDEN, "Company has been deactivated or banned"),
    DUPLICATE_TAX_CODE(HttpStatus.BAD_REQUEST, "Tax code is already registered"),
    USER_ALREADY_COMPANY_MEMBER(HttpStatus.BAD_REQUEST, "User is already a member of a company"),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "Member not found"),
    OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, "Company owner not found"),
    INVALID_MEMBER_ASSOCIATION(HttpStatus.BAD_REQUEST, "User does not belong to this company"),
    INVALID_TARGET_MEMBER(HttpStatus.BAD_REQUEST, "Invalid target member"),
    CANNOT_ASSIGN_OWNER(HttpStatus.BAD_REQUEST, "Cannot assign OWNER role via member management"),
    CANNOT_REMOVE_OWNER(HttpStatus.BAD_REQUEST, "Owner cannot be removed"),
    INVALID_OWNER_COUNT(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid number of owners after operation"),

    // CV
    CV_ACCESS_DENIED(HttpStatus.FORBIDDEN, "CV access denied"),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "Invalid file type"),
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed"),
    CV_EMPTY(HttpStatus.BAD_REQUEST, "CV content is empty"),
    EMPTY_FILE(HttpStatus.BAD_REQUEST, "Uploaded file is empty"),

    // OTP
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized access"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "You do not have permission to perform this action"),
    EMAIL_SEND_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send email"),

    //Tax
    TAX_VERIFICATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Tax verification failed"),
    INVALID_TAX_CODE(HttpStatus.BAD_REQUEST, "Invalid tax code"),


    //Chat
    CHAT_SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "Chat session not found"),

    // Interview
    GENERATE_QUESTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate interview question"),
    INTERVIEW_SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "Interview session not found"),
    INTERVIEW_SESSION_NOT_IN_PROGRESS(HttpStatus.BAD_REQUEST, "Interview session is not in progress"),
    INTERVIEW_QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Interview question not found"),
    INTERVIEW_QUESTION_NOT_BELONG_TO_SESSION(
            HttpStatus.BAD_REQUEST,
            "Interview question does not belong to the session"
    ),
    INTERVIEW_SESSION_ACCESS_DENIED(
            HttpStatus.FORBIDDEN,
            "You do not have access to this interview session"
    ),
    EVALUATE_SESSION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to evaluate interview session"),
    JSON_SERIALIZATION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "JSON serialization error"),
    INTERVIEW_ALREADY_EVALUATED(HttpStatus.BAD_REQUEST, "Interview session has already been evaluated"),
    RESULT_NOT_FOUND(HttpStatus.NOT_FOUND, "Result interview not found"),

    // Cloudinary
    INVALID_CLOUDINARY_URL(HttpStatus.BAD_REQUEST, "Invalid Cloudinary URL"),

    // Generic
    FORBIDDEN_ACTION(HttpStatus.FORBIDDEN, "Access denied"),
    INVALID_ROLE(HttpStatus.BAD_REQUEST, "Invalid role"),
    PASSWORD_CHANGE_REQUIRED(HttpStatus.FORBIDDEN, "Password change is required"),
    UNCATEGORIZED_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "Uncategorized exception");


    private final HttpStatus statusCode;
    private final String message;

    ErrorCode(HttpStatus statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }

    public String getMessage() {
        return message;
    }
}