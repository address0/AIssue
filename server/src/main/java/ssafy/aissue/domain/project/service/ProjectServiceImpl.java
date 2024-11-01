package ssafy.aissue.domain.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.aissue.common.exception.chatting.ProjectNotFoundException;
import ssafy.aissue.domain.chatting.entity.Chatting;
import ssafy.aissue.domain.chatting.repository.ChattingRepository;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.repository.ProjectRepository;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ChattingRepository chattingRepository;

    @Override
    public Project findByJiraProjectKey(String jiraProjectKey) {
        return projectRepository.findByJiraProjectKey(jiraProjectKey).orElseThrow(ProjectNotFoundException::new);
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
}