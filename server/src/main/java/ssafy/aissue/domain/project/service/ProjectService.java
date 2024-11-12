package ssafy.aissue.domain.project.service;


import ssafy.aissue.api.project.response.ProjectDetailsResponse;
import ssafy.aissue.domain.project.command.UpdateProjectCommand;
import ssafy.aissue.domain.project.entity.Project;

public interface ProjectService {
    Project findByJiraProjectKey(String jiraProjectKey);
    ProjectDetailsResponse getProject(String jiraProjectKey);
    ProjectDetailsResponse updateProject(UpdateProjectCommand command);
    Project createProject(Project project);

}