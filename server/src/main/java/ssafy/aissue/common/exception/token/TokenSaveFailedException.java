package ssafy.aissue.common.exception.token;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.TokenErrorCode;

public class TokenSaveFailedException extends BaseException {
    public TokenSaveFailedException() {
        super(TokenErrorCode.TOKEN_SAVE_FAILED);
    }
}
