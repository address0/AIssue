package ssafy.aissue.common.exception.security;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.SecurityErrorCode;

public class InvalidTokenException extends BaseException {

    public InvalidTokenException() {
        super(SecurityErrorCode.INVALID_TOKEN);
    }
}

