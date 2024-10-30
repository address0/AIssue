package ssafy.aissue.common.exception.chatting;

public class ProjectAccessDeniedException extends RuntimeException {

    public ProjectAccessDeniedException(String message) {
        super(message);
    }

    public ProjectAccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}
