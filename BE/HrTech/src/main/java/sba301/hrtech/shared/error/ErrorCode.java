package sba301.hrtech.shared.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    //Token
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token expired"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token invalid"),
    TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, "Token revoked"),
    MISSING_COOKIE(HttpStatus.BAD_REQUEST, "Missing cookie"),

    //Redis
    REDIS_DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "Redis data not found"),
    OTP_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "OTP save failed"),
    OTP_DELETE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "OTP delete failed"),
    OTP_RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "OTP rate limit exceeded"),

    //Auth
    Email_Not_Found(HttpStatus.NOT_FOUND, "Email not found"),
    Email_Already_Registered(HttpStatus.CONFLICT, "Email already registered"),
    Wrong_Password(HttpStatus.BAD_REQUEST, "Wrong password"),
    Wrong_Otp_Code(HttpStatus.BAD_REQUEST, "Wrong OTP code"),
    Otp_Expired(HttpStatus.BAD_REQUEST, "OTP expired"),
    Too_Many_Failed_Attempts(HttpStatus.TOO_MANY_REQUESTS, "Too many failed attempts"),
    Pending_User_Not_Found(HttpStatus.NOT_FOUND, "Pending user not found"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Forbidden"),

    //User
    User_Not_Found(HttpStatus.NOT_FOUND, "User not found"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    User_Already_Registered(HttpStatus.CONFLICT, "User already registered"),

    //Role
    Role_Not_Found(HttpStatus.NOT_FOUND, "Role not found"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "Role not found"),

    //Common code
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad request"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Not found"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation error"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "Invalid input"),

    //Skill
    SKILL_NOT_FOUND(HttpStatus.NOT_FOUND, "Skill not found"),
    SKILL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Skill already exists"),
    SKILL_SELF_RELATIONSHIP(HttpStatus.BAD_REQUEST, "Skill cannot relate to itself"),

    //Recommendation
    CV_NOT_FOUND(HttpStatus.NOT_FOUND, "CV not found"),
    JOB_NOT_FOUND(HttpStatus.NOT_FOUND, "Job not found"),
    CV_HAS_NO_SKILLS(HttpStatus.BAD_REQUEST, "CV has no skills"),
    CV_CONTENT_EMPTY(HttpStatus.BAD_REQUEST, "CV content is empty"),

    //AI / Ollama / Gemini
    AI_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "AI service unavailable"),
    AI_EXTRACTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AI extraction failed"),

    //Job
    JOB_NOT_FOUND_CODE(HttpStatus.NOT_FOUND, "Job not found"),
    JOB_INVALID_STATUS(HttpStatus.BAD_REQUEST, "Job invalid status"),
    JOB_NOT_OWNER(HttpStatus.FORBIDDEN, "Job not owner"),
    JOB_COMPANY_NOT_APPROVED(HttpStatus.FORBIDDEN, "Job company not approved"),
    JOB_PERMISSION_DENIED(HttpStatus.FORBIDDEN, "Job permission denied"),
    JOB_SKILL_NOT_FOUND(HttpStatus.NOT_FOUND, "Job skill not found"),

    //Subscription Plan
    SUBSCRIPTION_PLAN_NOT_FOUND(HttpStatus.NOT_FOUND, "Subscription plan not found"),

    //Payment
    HAS_ERROR(HttpStatus.BAD_GATEWAY, "Payment service error"),
    ORDER_CODE_NOT_FOUND(HttpStatus.NOT_FOUND, "Order code not found"),
    WEBHOOK_NOT_FOUND(HttpStatus.BAD_GATEWAY, "Webhook not found"),

    // Feature
    FEATURE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Feature already exists"),
    FEATURE_NOT_FOUND(HttpStatus.NOT_FOUND, "Feature not found"),

    // Chat
    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "Chat session not found"),

    // Company
    ALREADY_OWNS_COMPANY(HttpStatus.BAD_REQUEST, "Each user can only register or belong to one company."),
    DUPLICATE_TAX_CODE(HttpStatus.BAD_REQUEST, "This tax code is already registered."),
    COMPANY_NOT_FOUND(HttpStatus.NOT_FOUND, "Company not found."),
    ALREADY_MEMBER(HttpStatus.BAD_REQUEST, "User is already a member of a company."),
    CANNOT_ASSIGN_OWNER(HttpStatus.BAD_REQUEST, "Cannot assign OWNER role via member management."),
    INVALID_ROLE(HttpStatus.BAD_REQUEST, "Invalid company role. Must be HR or HR_MANAGER."),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "Member not found."),
    INVALID_MEMBER_ASSOCIATION(HttpStatus.BAD_REQUEST, "User does not belong to this company."),
    CANNOT_REMOVE_OWNER(HttpStatus.BAD_REQUEST, "Company OWNER cannot be removed. Transfer ownership first."),
    OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, "Current owner not found."),
    INVALID_TARGET_MEMBER(HttpStatus.BAD_REQUEST, "Target member must be an active member of the same company."),
    INVALID_OWNER_COUNT(HttpStatus.INTERNAL_SERVER_ERROR, "Ownership transfer resulted in an invalid number of owners."),

    // Tax Verification
    TAX_VERIFICATION_FAILED(HttpStatus.BAD_REQUEST, "Tax verification failed."),
    INVALID_TAX_CODE(HttpStatus.BAD_REQUEST, "Invalid tax code."),
    TAX_VERIFICATION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred during tax code verification."),

    // CV Upload / Access
    CV_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Bạn không có quyền xem hoặc sửa CV này!"),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "Chỉ chấp nhận file PDF hoặc ảnh!"),
    INVALID_TITLE(HttpStatus.BAD_REQUEST, "Tên CV không được để trống!"),

    // Cloudinary File
    EMPTY_FILE(HttpStatus.BAD_REQUEST, "Uploaded file is empty."),
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary.")
    ;

    private final HttpStatus statusCode;
    private final String message;
}
