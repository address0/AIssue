package ssafy.aissue.common.exception.errorcode;

import lombok.AllArgsConstructor;
import lombok.Getter;

import static ssafy.aissue.api.StatusCode.*;

@Getter
@AllArgsConstructor
public enum ChattingErrorCode implements BaseErrorCode {

    PROJECT_NOT_FOUND(BAD_REQUEST, "CHAT_404", "해당하는 프로젝트가 존재하지 않습니다.");

    private final Integer httpStatus;
    private final String code;
    private final String message;
}

