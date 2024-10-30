package ssafy.aissue.common.exception.security;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.SecurityErrorCode;

public class FilterException extends BaseException {
    public FilterException() {
        super(SecurityErrorCode.FILTER_ERROR);
    }
}
