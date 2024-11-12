package ssafy.aissue.domain.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ssafy.aissue.api.project.response.ProjectDetailsResponse;
import ssafy.aissue.common.constant.global.S3_IMAGE;
import ssafy.aissue.common.exception.chatting.ProjectNotFoundException;
import ssafy.aissue.common.util.S3Util;
import ssafy.aissue.domain.chatting.entity.Chatting;
import ssafy.aissue.domain.chatting.repository.ChattingRepository;
import ssafy.aissue.domain.project.command.UpdateProjectCommand;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.repository.ProjectRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ChattingRepository chattingRepository;
    private final S3Util s3Util;

    @Override
    public Project findByJiraProjectKey(String jiraProjectKey) {
        return projectRepository.findByJiraProjectKey(jiraProjectKey).orElseThrow(ProjectNotFoundException::new);
    }

    @Override
    public ProjectDetailsResponse getProject(String jiraProjectKey) {
        // `findByJiraProjectKey`를 이용해 프로젝트 조회
        Project project = findByJiraProjectKey(jiraProjectKey);

        // 프로젝트 데이터를 `ProjectDetailsResponse`에 매핑하여 반환
        return ProjectDetailsResponse.of(
                project.getProjectImage(),
                project.getTitle(),
                project.getDescription(),
                project.getTechStack(),
                project.getFeSkill(),
                project.getBeSkill(),
                project.getInfraSkill(),
                project.getEndAt() != null ? project.getEndAt().toString() : null,
                project.getEndAt() != null ? project.getEndAt().toString() : null,
                project.getIsCompleted()
        );
    }

    @Override
    @Transactional
    public ProjectDetailsResponse updateProject(UpdateProjectCommand command) {
        log.info("[ProjectService] 프로젝트 정보 업데이트 요청: {}", command);
        Project currentProject = findByJiraProjectKey(command.jiraId());

        MultipartFile profileImageFile = command.projectImagePath();

        String imageUrl = S3_IMAGE.DEFAULT_URL;
        if (!command.deleteImage()) {
            imageUrl = handleProjectImage(profileImageFile, command.jiraId(), currentProject.getProjectImage());
        }
        log.info("[ProjectService] 프로젝트 이미지 URL: {}", imageUrl);
        String preSignedUrl = generatePreSignedUrl(imageUrl);
        log.info("[ProjectService] 프로젝트 이미지 PreSigned URL: {}", preSignedUrl);


        String updatedTitle = getUpdatedField(command.name(), currentProject.getTitle());
        String updatedDescription = getUpdatedField(command.description(), currentProject.getDescription());
        String updatedTechStack = getUpdatedField(command.techStack(), currentProject.getTechStack());
        String updatedFeSkill = getUpdatedField(command.feSkill(), currentProject.getFeSkill());
        String updatedBeSkill = getUpdatedField(command.beSkill(), currentProject.getBeSkill());
        String updatedInfraSkill = getUpdatedField(command.infraSkill(), currentProject.getInfraSkill());
        LocalDate updatedStartAt = getUpdatedDateField(command.startDate(), currentProject.getStartAt());
        LocalDate updatedEndAt = getUpdatedDateField(command.endDate(), currentProject.getEndAt());
        currentProject.updateProjectInfo(
                updatedTitle,
                updatedDescription,
                updatedTechStack,
                updatedFeSkill,
                updatedBeSkill,
                updatedInfraSkill,
                updatedStartAt,
                updatedEndAt,
                preSignedUrl
        );
        Project updatedProject = projectRepository.save(currentProject);
        return ProjectDetailsResponse.of(
                updatedProject.getProjectImage(),
                updatedProject.getTitle(),
                updatedProject.getDescription(),
                updatedProject.getTechStack(),
                updatedProject.getFeSkill(),
                updatedProject.getBeSkill(),
                updatedProject.getInfraSkill(),
                updatedProject.getEndAt() != null ? updatedProject.getEndAt().toString() : null,
                updatedProject.getEndAt() != null ? updatedProject.getEndAt().toString() : null,
                updatedProject.getIsCompleted()
        );
    }

    @Override
    @Transactional
    public Project createProject(Project project) {
        // 프로젝트를 먼저 저장
        Project savedProject = projectRepository.save(project);

        // 프로젝트와 연관된 Chatting 인스턴스 생성 및 저장
        Chatting chatting = new Chatting();
        chatting.setProject(savedProject);
        chattingRepository.save(chatting);

        return savedProject;
    }

    private String generatePreSignedUrl(String imageUrl) {
        if (imageUrl == null) {
            return "";
        }
        String imagePath = extractImagePath(imageUrl);
        return s3Util.getPresignedUrlFromS3(imagePath);
    }

    private String extractImagePath(String imageUrl) {
        return imageUrl.substring(imageUrl.indexOf("project/"));
    }

    private String getUpdatedField(String newValue, String currentValue) {
        return (newValue == null || newValue.isEmpty()) ? currentValue : newValue;
    }

    private LocalDate getUpdatedDateField(LocalDate newValue, LocalDate currentValue) {
        return (newValue == null) ? currentValue : newValue;
    }


    /**
     * 프로필 이미지를 처리합니다. MultipartFile이 제공되면 S3에 업로드하고, 그렇지 않으면 기존 이미지를 유지합니다.
     *
     * @param imageFile         업로드할 이미지 파일
     * @param projectId          플레이어 ID
     * @param existingImageUrl  기존 이미지 URL
     * @return 새로운 이미지 URL 또는 기존 이미지 URL
     */
    private String handleProjectImage(MultipartFile imageFile, String projectId, String existingImageUrl) {
        // 이미지 파일이 없거나 비어있는 경우
        if (imageFile == null || imageFile.isEmpty()) {
            if (existingImageUrl != null && !existingImageUrl.isEmpty()) {
                return existingImageUrl; // 기존 이미지가 있으면 반환
            } else {
                return S3_IMAGE.DEFAULT_URL; // 기본 이미지 URL 반환
            }
        }
        // 이미지 파일이 있는 경우 S3에 업로드
        return s3Util.uploadImageToS3(imageFile, projectId, "project/");
    }

}