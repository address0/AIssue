package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;

public class EmailNotFoundException extends BaseException {
    public EmailNotFoundException() {
        super(MemberErrorCode.EMAIL_NOT_FOUND);
    }
}
