package ssafy.aissue.common.exception.member;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.MemberErrorCode;

public class InvalidJiraCredentialsException extends BaseException {
    public InvalidJiraCredentialsException() {
        super(MemberErrorCode.INVALID_JIRA_CREDENTIALS);
    }
}
