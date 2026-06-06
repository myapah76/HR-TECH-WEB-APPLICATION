package sba301.hrtech.shared.common;

import org.springframework.stereotype.Component;

@Component
public class ErrorCode {
    //Token
    public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
    public static final String TOKEN_INVALID = "TOKEN_INVALID";
    public static final String TOKEN_REVOKED = "TOKEN_REVOKED";
    public static final String MISSING_COOKIE = "MISSING_COOKIE";

    //Redis
    public static final String REDIS_DATA_NOT_FOUND= "REDIS_DATA_NOT_FOUND";
    public static final String OTP_SAVE_FAILED = "OTP_SAVE_FAILED";
    public static final String OTP_DELETE_FAILED = "OTP_DELETE_FAILED";
    public static final String OTP_RATE_LIMIT_EXCEEDED = "OTP_RATE_LIMIT_EXCEEDED";

    //Auth
    public static final String Email_Not_Found = "Email_Not_Found";
    public static final String Email_Already_Registered = "Email_Already_Registered";
    public static final String Wrong_Password = "Wrong_Password";
    public static final String Wrong_Otp_Code = "Wrong_Otp_Code";
    public static final String Otp_Expired = "OTP_EXPIRED";
    public static final String Too_Many_Failed_Attempts = "Too_Many_Failed_Attempts";
    public static final String Pending_User_Not_Found = "Pending_User_Not_Found";

    //User
    public static final String User_Not_Found = "User_Not_Found";
    public static final String User_Already_Registered = "User_Already_Registered";

    //Role
    public static  final String Role_Not_Found = "Role_Not_Found";


    //Common code
    public static final String BAD_REQUEST = "BAD_REQUEST";
    public static final String NOT_FOUND = "NOT_FOUND";
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";
    public static final String INVALID_INPUT = "INVALID_INPUT";

    //Skill
    public static final String SKILL_NOT_FOUND = "SKILL_NOT_FOUND";
    public static final String SKILL_ALREADY_EXISTS = "SKILL_ALREADY_EXISTS";
    public static final String SKILL_SELF_RELATIONSHIP = "SKILL_SELF_RELATIONSHIP";

    //Recommendation
    public static final String CV_NOT_FOUND = "CV_NOT_FOUND";
    public static final String JOB_NOT_FOUND = "JOB_NOT_FOUND";
    public static final String CV_HAS_NO_SKILLS = "CV_HAS_NO_SKILLS";
    public static final String CV_CONTENT_EMPTY = "CV_CONTENT_EMPTY";

    //AI / Ollama / Gemini
    public static final String AI_SERVICE_UNAVAILABLE = "AI_SERVICE_UNAVAILABLE";
    public static final String AI_EXTRACTION_FAILED = "AI_EXTRACTION_FAILED";

    //Job
    public static final String JOB_NOT_FOUND_CODE = "JOB_NOT_FOUND";
    public static final String JOB_INVALID_STATUS = "JOB_INVALID_STATUS";
    public static final String JOB_NOT_OWNER = "JOB_NOT_OWNER";
    public static final String JOB_COMPANY_NOT_APPROVED = "JOB_COMPANY_NOT_APPROVED";
    public static final String JOB_PERMISSION_DENIED = "JOB_PERMISSION_DENIED";
    public static final String JOB_SKILL_NOT_FOUND = "JOB_SKILL_NOT_FOUND";
}

