package ssafy.aissue.api.project.response;


import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "프로젝트 멤버 정보 응답 DTO")
public record ProjectMemberResponse(
        @Schema(description = "멤버 이메일", example = "member1@example.com")
        String email,

        @Schema(description = "멤버 이름", example = "Member One")
        String name
) {
}
