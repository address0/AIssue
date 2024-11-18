package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;

public class NameDuplicateException extends BaseException {
    public NameDuplicateException() {
        super(MemberErrorCode.NICKNAME_DUPLICATE);
    }
}
