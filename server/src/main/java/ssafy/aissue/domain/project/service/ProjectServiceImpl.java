package ssafy.aissue.domain.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ssafy.aissue.api.project.request.ProjectFunctionRequest;
import ssafy.aissue.api.project.response.ProjectDetailsResponse;
import ssafy.aissue.api.project.response.ProjectFunctionResponse;
import ssafy.aissue.api.project.response.ProjectMemberResponse;
import ssafy.aissue.common.constant.global.S3_IMAGE;
import ssafy.aissue.common.exception.chatting.ProjectNotFoundException;
import ssafy.aissue.common.util.S3Util;
import ssafy.aissue.domain.chatting.entity.Chatting;
import ssafy.aissue.domain.chatting.repository.ChattingRepository;
import ssafy.aissue.domain.project.command.UpdateProjectCommand;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.entity.ProjectFunction;
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
        Project project = findByJiraProjectKey(jiraProjectKey);
        List<ProjectMember> memberList = projectMemberRepository.findAllByProject(project);
        List<ProjectMemberResponse> members = memberList.stream()
                .map(pm -> new ProjectMemberResponse(pm.getMember().getEmail(), pm.getMember().getName()))
                .toList();
        log.info("[ProjectService] 프로젝트에 멤버들 정보 조회: {}", memberList);

        List<ProjectFunctionResponse> functions = project.getFunctions().stream()
                .map(ProjectFunctionResponse::fromEntity)
                .toList();

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
                members,
                functions
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

        currentProject.updateProjectInfo(
                getUpdatedField(command.name(), currentProject.getTitle()),
                getUpdatedField(command.description(), currentProject.getDescription()),
                getUpdatedField(command.techStack(), currentProject.getTechStack()),
                getUpdatedField(command.feSkill(), currentProject.getFeSkill()),
                getUpdatedField(command.beSkill(), currentProject.getBeSkill()),
                getUpdatedField(command.infraSkill(), currentProject.getInfraSkill()),
                getUpdatedDateField(command.startDate(), currentProject.getStartAt()),
                getUpdatedDateField(command.endDate(), currentProject.getEndAt()),
                imageUrl
        );
        Project updatedProject = projectRepository.save(currentProject);

        List<ProjectFunctionResponse> functions = updatedProject.getFunctions().stream()
                .map(ProjectFunctionResponse::fromEntity)
                .toList();

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
                members,
                functions
        );
    }

    @Override
    @Transactional
    public List<ProjectFunctionResponse> getProjectFunctions(String jiraProjectKey) {
        Project project = projectRepository.findByJiraProjectKey(jiraProjectKey)
                .orElseThrow(ProjectNotFoundException::new);

        return project.getFunctions().stream()
                .map(ProjectFunctionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<ProjectFunctionResponse> updateProjectFunctions(String jiraProjectKey, List<ProjectFunctionRequest> functions) {
        Project project = projectRepository.findByJiraProjectKey(jiraProjectKey)
                .orElseThrow(ProjectNotFoundException::new);

        // 기존 기능 목록을 비우고 새로운 기능으로 교체
        project.getFunctions().clear();

        List<ProjectFunction> newFunctions = functions.stream()
                .map(req -> ProjectFunction.create(req.title(), req.description(), project))
                .toList();

        project.getFunctions().addAll(newFunctions);
        projectRepository.save(project);

        // 업데이트된 기능 목록을 ProjectFunctionResponse 형태로 반환
        return newFunctions.stream()
                .map(ProjectFunctionResponse::fromEntity)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public Project createProject(Project project) {
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

    private String handleProjectImage(MultipartFile imageFile, String projectId, String existingImageUrl) {
        if (imageFile == null || imageFile.isEmpty()) {
            return existingImageUrl != null && !existingImageUrl.isEmpty() ? existingImageUrl : S3_IMAGE.DEFAULT_URL;
        }
        return s3Util.uploadImageToS3(imageFile, projectId, "project/");
    }
}
