package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;

public class MessageSendingException extends BaseException {
    public MessageSendingException() {
        super(MemberErrorCode.MESSAGE_SENDING);
    }
}
