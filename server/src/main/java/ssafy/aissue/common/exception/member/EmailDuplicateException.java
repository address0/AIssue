package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;

public class EmailDuplicateException extends BaseException {
    public EmailDuplicateException() {
        super(MemberErrorCode.EMAIL_DUPLICATE);
    }
}
