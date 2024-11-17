package ssafy.aissue.common.exception.security;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.SecurityErrorCode;

public class TokenExpiredException extends BaseException {
    public TokenExpiredException() {
        super(SecurityErrorCode.TOKEN_EXPIRED);
    }

}
