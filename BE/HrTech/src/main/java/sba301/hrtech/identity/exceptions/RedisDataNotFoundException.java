package sba301.hrtech.identity.exceptions;

import org.springframework.http.HttpStatus;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

public class RedisDataNotFoundException extends AppException {

    public RedisDataNotFoundException(String key) {
        super(HttpStatus.NOT_FOUND,ErrorCode.REDIS_DATA_NOT_FOUND,
                "Data for key '" + key + "' not found or has expired");
    }
}
