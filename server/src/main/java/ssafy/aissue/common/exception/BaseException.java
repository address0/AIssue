package ssafy.aissue.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import ssafy.aissue.common.exception.errorcode.BaseErrorCode;

@Getter
@AllArgsConstructor
public class BaseException extends RuntimeException {
    private final BaseErrorCode errorCode;
}
