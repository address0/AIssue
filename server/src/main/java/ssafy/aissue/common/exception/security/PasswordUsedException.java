package ssafy.aissue.common.exception.security;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.SecurityErrorCode;

public class PasswordUsedException extends BaseException {
    public PasswordUsedException() {super (SecurityErrorCode.PASSWORD_USED);}

}
