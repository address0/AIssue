package ssafy.aissue.common.exception.token;


import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.TokenErrorCode;

public class TokenTypeNotMatchedException extends BaseException {
    public TokenTypeNotMatchedException() {
        super(TokenErrorCode.NOT_MATCHED_TOKEN_TYPE);
    }
}
