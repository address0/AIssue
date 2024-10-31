package ssafy.aissue.common.exception.chatting;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.ChattingErrorCode;

public class ProjectNotFoundException  extends BaseException {
    public ProjectNotFoundException() {
        super(ChattingErrorCode.PROJECT_NOT_FOUND);
    }
}