package ssafy.aissue.api.project.request;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;
import ssafy.aissue.domain.project.command.UpdateProjectCommand;

import java.time.LocalDate;

@Schema(description = "프로젝트 정보 변경 요청 DTO")
public record ProjectUpdateRequest (

        @Schema(description = "프로젝트 jiraID", example = "S11P31A403")
        String jiraId,

        @Schema(description = "프로젝트 이름", example = "aissue")
        String name,

        @Schema(description = "프로젝트 주제", example = "jira를 이용한 프로젝트")
        String description,

        @Schema(description = "프로젝트 시작일", example = "2024-11-01")
        LocalDate startDate,

        @Schema(description = "프로젝트 종료일", example = "2024-11-30")
        LocalDate endDate,

        @Schema(description = "기타 프로젝트 기술스택", example = "webRTC")
        String techStack,

        @Schema(description = "프론트 엔드 기술 스택", example = "React")
        String feSkill,

        @Schema(description = "백엔드 기술 스택", example = "Spring Boot")
        String beSkill,

        @Schema(description = "인프라 기술 스택", example = "AWS")
        String infraSkill,

        @Schema(description = "프로젝트 이미지 파일")
        MultipartFile projectImagePath,

        @Schema(description = "사진 삭제 여부", example = "true")
        boolean deleteImage


){
    public UpdateProjectCommand toCommand() {
        return new UpdateProjectCommand(jiraId, name, description, startDate, endDate, techStack, feSkill, beSkill, infraSkill,projectImagePath,deleteImage);
    }
}
