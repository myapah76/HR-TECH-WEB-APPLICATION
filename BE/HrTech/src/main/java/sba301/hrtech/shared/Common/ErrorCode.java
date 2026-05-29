package sba301.hrtech.shared.common;

import org.springframework.stereotype.Component;

@Component
public class ErrorCode {
    //Token
    public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
    public static final String TOKEN_INVALID = "TOKEN_INVALID";
    public static final String TOKEN_REVOKED = "TOKEN_REVOKED";

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
}
