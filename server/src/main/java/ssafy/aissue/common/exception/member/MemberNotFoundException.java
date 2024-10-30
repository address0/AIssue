package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;


public class MemberNotFoundException extends BaseException {
    public MemberNotFoundException() {
        super(MemberErrorCode.PLAYER_NOT_FOUND);
    }
}
