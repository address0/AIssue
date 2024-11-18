package ssafy.aissue.common.exception.security;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.SecurityErrorCode;

public class InvalidPasswordException extends BaseException {
    public InvalidPasswordException() {
        super(SecurityErrorCode.INVALID_PASSWORD);
    }
}
