package ssafy.aissue.common.exception.global;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.GlobalErrorCode;

public class AccessDeniedRequestException extends BaseException {
    public AccessDeniedRequestException() {
        super(GlobalErrorCode.ACCESS_DENIED_REQUEST);
    }
}

