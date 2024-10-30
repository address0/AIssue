package ssafy.aissue.common.exception.security;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.SecurityErrorCode;

public class NotAuthenticatedException extends BaseException {
    public NotAuthenticatedException() {
        super(SecurityErrorCode.NOT_AUTHENTICATED_ERROR);
    }
}
