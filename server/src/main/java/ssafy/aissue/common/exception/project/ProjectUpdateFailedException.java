package ssafy.aissue.common.exception.project;

public class ProjectUpdateFailedException extends RuntimeException {

    public ProjectUpdateFailedException() {
        super("프로젝트 업데이트 중 오류가 발생했습니다.");
    }

    public ProjectUpdateFailedException(String message) {
        super(message);
    }

    public ProjectUpdateFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
