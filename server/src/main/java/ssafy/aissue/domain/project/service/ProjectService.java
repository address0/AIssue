package ssafy.aissue.domain.project.service;


import ssafy.aissue.domain.project.entity.Project;

public interface ProjectService {
    Project findByJiraProjectKey(String jiraProjectKey);
    // 새 프로젝트를 생성하고 Chatting 인스턴스를 자동으로 생성하는 메서드
    Project createProject(Project project);
}