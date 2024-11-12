package ssafy.aissue.api.project.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "프로젝트 상세 정보 응답 DTO")
public record ProjectDetailsResponse(
        @Schema(description = "프로젝트 이미지 경로", example = "1")
        String projectImage,

        @Schema(description = "프로젝트 제목", example = "aissue")
        String title,

        @Schema(description = "프로젝트 주제", example = "aissue")
        String description,

        @Schema(description = "기타 기술 스택", example = "Spring Boot, React")
        String techStack,

        @Schema(description = "프론트엔드 기술 스택", example = "React")
        String feSkill,

        @Schema(description = "백엔드 기술 스택", example = "Spring Boot")
        String beSkill,

        @Schema(description = "인프라 기술 스택", example = "AWS")
        String infraSkill,

        @Schema(description = "프로젝트 시작일", example = "2024-11-01")
        String startAt,

        @Schema(description = "프로젝트 종료일", example = "2024-11-03")
        String endAt,

        @Schema(description = "프로젝트 상제정보 작성완료 여부/ 작성이필요하면 false", example = "false")
        Boolean isCompleted,

        @Schema(description = "프로젝트 멤버 정보 목록")
        List<ProjectMemberResponse> members
) {
    public static ProjectDetailsResponse of(String projectImage, String title, String description, String techStack,String feSkill, String beSkill, String infraSkill, String startAt, String endAt, Boolean isCompleted,List<ProjectMemberResponse> members) {
        return new ProjectDetailsResponse(projectImage, title, description, techStack,feSkill,beSkill,infraSkill, startAt, endAt, isCompleted, members);
    }
}
