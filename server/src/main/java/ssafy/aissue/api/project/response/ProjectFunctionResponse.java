package ssafy.aissue.api.project.response;

import io.swagger.v3.oas.annotations.media.Schema;
import ssafy.aissue.domain.project.entity.ProjectFunction;

@Schema(description = "프로젝트 기능 응답 DTO")
public record  ProjectFunctionResponse(
        @Schema(description = "기능 제목", example = "로그인 기능")
        String title,

        @Schema(description = "기능 설명", example = "OAuth 기반 로그인 기능을 제공합니다.")
        String description
) {
    public static ProjectFunctionResponse fromEntity(ProjectFunction function) {
        return new ProjectFunctionResponse(function.getTitle(), function.getDescription());
    }
}
