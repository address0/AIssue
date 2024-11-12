package ssafy.aissue.domain.project.command;


import java.time.LocalDate;
import org.springframework.web.multipart.MultipartFile;

public record UpdateProjectCommand(
        String jiraId,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        String techStack,
        String feSkill,
        String beSkill,
        String infraSkill,
        MultipartFile projectImagePath,
        boolean deleteImage
) {
}
