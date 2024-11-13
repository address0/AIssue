package ssafy.aissue.api.project.request;


import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "프로젝트 기능 정보 DTO")
public record ProjectFunctionRequest(
        @Schema(description = "기능 제목", example = "로그인 기능")
        String title,

        @Schema(description = "기능 설명", example = "OAuth 기반 로그인 기능을 제공합니다.")
        String description
) {
}
