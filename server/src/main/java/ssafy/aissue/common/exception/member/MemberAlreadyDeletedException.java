package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;


public class MemberAlreadyDeletedException extends BaseException {
    public MemberAlreadyDeletedException() {
        super(MemberErrorCode.PLAYER_ALREADY_DELETED);
    }
}

