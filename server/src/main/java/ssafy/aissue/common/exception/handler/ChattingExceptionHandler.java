package ssafy.aissue.common.exception.handler;


import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.common.exception.chatting.ProjectNotFoundException;

@RestControllerAdvice
@Slf4j
public class ChattingExceptionHandler {

    @ExceptionHandler(ProjectNotFoundException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public CommonResponse handleChattingException(ProjectNotFoundException e) {
        log.error("ProjectNotFoundException Error", e);
        return CommonResponse.unauthorized(e.getErrorCode());
    }
}
