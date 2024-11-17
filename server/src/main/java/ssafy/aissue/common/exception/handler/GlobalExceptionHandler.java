package ssafy.aissue.common.exception.handler;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.common.exception.global.AccessDeniedRequestException;
import ssafy.aissue.common.exception.member.InvalidLoginInfoException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(InvalidLoginInfoException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public CommonResponse handleInvalidLoginInfoException(InvalidLoginInfoException e) {
        log.error("InvalidLoginInfoException Error", e);
        return CommonResponse.unauthorized(e.getErrorCode());
    }

    @ExceptionHandler(AccessDeniedRequestException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public CommonResponse handleAccessDeniedRequestException(AccessDeniedRequestException e) {
        log.error("AccessDeniedRequestException Error", e);
        return CommonResponse.forbidden(e.getErrorCode());
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleAuthorizationDeniedException(AuthorizationDeniedException e, HttpServletRequest request) {
        log.error("AuthorizationDeniedException Error", e);
        return """
                {
                    "code": 403,
                    "message": "해당 회원이 접근 권한이 없습니다.",
                    "result": {
                        "path": "%s"
                    }
                }
                """.formatted(request.getRequestURI());

    }


}
