package ssafy.aissue.common.exception.security;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.SecurityErrorCode;

public class InvalidSignatureTokenException extends BaseException {
    public InvalidSignatureTokenException() {
        super(SecurityErrorCode.INVALID_SIGNATURE_TOKEN);
    }
}
