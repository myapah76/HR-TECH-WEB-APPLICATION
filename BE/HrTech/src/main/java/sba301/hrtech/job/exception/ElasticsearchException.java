package sba301.hrtech.job.exception;

import org.springframework.http.HttpStatus;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

public class ElasticsearchException extends AppException {

    public ElasticsearchException(String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.Elastic_Search_Failed, message);
    }
}