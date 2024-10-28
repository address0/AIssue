package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;

public class VerificationException extends BaseException {
    public VerificationException() {
        super(MemberErrorCode.VERIFICATION_FAILURE);
    }
}

