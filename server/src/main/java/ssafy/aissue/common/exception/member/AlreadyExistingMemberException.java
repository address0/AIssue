package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;

public class AlreadyExistingMemberException extends BaseException {
    public AlreadyExistingMemberException() {
        super(MemberErrorCode.PLAYER_DUPLICATE);
    }
}
