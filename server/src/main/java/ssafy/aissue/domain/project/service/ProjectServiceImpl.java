package ssafy.aissue.domain.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ssafy.aissue.api.project.response.ProjectDetailsResponse;
import ssafy.aissue.api.project.response.ProjectMemberResponse;
import ssafy.aissue.common.constant.global.S3_IMAGE;
import ssafy.aissue.common.exception.chatting.ProjectNotFoundException;
import ssafy.aissue.common.util.S3Util;
import ssafy.aissue.domain.chatting.entity.Chatting;
import ssafy.aissue.domain.chatting.repository.ChattingRepository;
import ssafy.aissue.domain.project.command.UpdateProjectCommand;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.entity.ProjectMember;
import ssafy.aissue.domain.project.repository.ProjectMemberRepository;
import ssafy.aissue.domain.project.repository.ProjectRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final ChattingRepository chattingRepository;
    private final S3Util s3Util;

    @Override
    public Project findByJiraProjectKey(String jiraProjectKey) {
        return projectRepository.findByJiraProjectKey(jiraProjectKey).orElseThrow(ProjectNotFoundException::new);
    }

    @Override
    @Transactional
    public ProjectDetailsResponse getProject(String jiraProjectKey) {
        // `findByJiraProjectKey`를 이용해 프로젝트 조회
        Project project = findByJiraProjectKey(jiraProjectKey);
        List<ProjectMember> memberList = projectMemberRepository.findAllByProject(project);
        List<ProjectMemberResponse> members = memberList.stream()
                .map(pm -> new ProjectMemberResponse(pm.getMember().getEmail(), pm.getMember().getName()))
                .toList();
        log.info("[ProjectService] 프로젝트에 맴버들 정보 조회: {}", memberList);

        String preSignedUrl = generatePreSignedUrl(project.getProjectImage());

        return ProjectDetailsResponse.of(
                preSignedUrl,
                project.getTitle(),
                project.getDescription(),
                project.getTechStack(),
                project.getFeSkill(),
                project.getBeSkill(),
                project.getInfraSkill(),
                project.getEndAt() != null ? project.getEndAt().toString() : null,
                project.getEndAt() != null ? project.getEndAt().toString() : null,
                project.getIsCompleted(),
                members
        );
    }

    @Override
    @Transactional
    public ProjectDetailsResponse updateProject(UpdateProjectCommand command) {
        log.info("[ProjectService] 프로젝트 정보 업데이트 요청: {}", command);
        Project currentProject = findByJiraProjectKey(command.jiraId());
        List<ProjectMember> memberList = projectMemberRepository.findAllByProject(currentProject);
        List<ProjectMemberResponse> members = memberList.stream()
                .map(pm -> new ProjectMemberResponse(pm.getMember().getEmail(), pm.getMember().getName()))
                .toList();

        MultipartFile profileImageFile = command.projectImagePath();

        String imageUrl = S3_IMAGE.DEFAULT_URL;
        if (!command.deleteImage()) {
            imageUrl = handleProjectImage(profileImageFile, command.jiraId(), currentProject.getProjectImage());
        }

        String preSignedUrl = generatePreSignedUrl(imageUrl);

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
                imageUrl
        );
        Project updatedProject = projectRepository.save(currentProject);
        return ProjectDetailsResponse.of(
                preSignedUrl,
                updatedProject.getTitle(),
                updatedProject.getDescription(),
                updatedProject.getTechStack(),
                updatedProject.getFeSkill(),
                updatedProject.getBeSkill(),
                updatedProject.getInfraSkill(),
                updatedProject.getEndAt() != null ? updatedProject.getEndAt().toString() : null,
                updatedProject.getEndAt() != null ? updatedProject.getEndAt().toString() : null,
                updatedProject.getIsCompleted(),
                members
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