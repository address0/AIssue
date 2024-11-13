package ssafy.aissue.domain.project.service;


import ssafy.aissue.api.project.request.ProjectFunctionRequest;
import ssafy.aissue.api.project.response.ProjectDetailsResponse;
import ssafy.aissue.api.project.response.ProjectFunctionResponse;
import ssafy.aissue.domain.project.command.UpdateProjectCommand;
import ssafy.aissue.domain.project.entity.Project;

import java.util.List;

public interface ProjectService {
    Project findByJiraProjectKey(String jiraProjectKey);
    ProjectDetailsResponse getProject(String jiraProjectKey);
    ProjectDetailsResponse updateProject(UpdateProjectCommand command);
    Project createProject(Project project);
    List<ProjectFunctionResponse> updateProjectFunctions(String jiraProjectKey, List<ProjectFunctionRequest> functions);
    List<ProjectFunctionResponse> getProjectFunctions(String jiraProjectKey);

}