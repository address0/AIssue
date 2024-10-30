package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;

public class InvalidLoginInfoException extends BaseException {
    public InvalidLoginInfoException() {
        super(MemberErrorCode.INVALID_LOGIN_INFO);
    }
}

