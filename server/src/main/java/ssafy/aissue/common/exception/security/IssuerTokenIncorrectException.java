package ssafy.aissue.common.exception.security;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.SecurityErrorCode;

public class IssuerTokenIncorrectException extends BaseException {
    public IssuerTokenIncorrectException() {
        super(SecurityErrorCode.ISSUER_TOKEN_INCORRECT);
    }
}
