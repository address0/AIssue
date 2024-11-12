package ssafy.aissue.api.project;


import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.api.project.request.ProjectUpdateRequest;
import ssafy.aissue.api.project.response.ProjectDetailsResponse;
import ssafy.aissue.domain.project.service.ProjectService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/project")
public class ProjectController {

    private final ProjectService projectService;

    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "프로젝트 정보 조회", description = "프로젝트 정보를 조회하는 API입니다.")
    @GetMapping("/{jiraProjectKey}")
    public CommonResponse<ProjectDetailsResponse> getProject(@PathVariable String jiraProjectKey) {
        log.info("[ProjectController] 프로젝트 상세 정보 조회 >>>> jiraProjectKey: {}", jiraProjectKey);
        ProjectDetailsResponse response = projectService.getProject(jiraProjectKey);
        return CommonResponse.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "프로젝트 정보 수정", description = "프로젝트 정보를 수정하는 API입니다.")
    @PutMapping(value = "/project", consumes = { "multipart/form-data" })
    public CommonResponse<ProjectDetailsResponse> updateProject(@ModelAttribute @Validated ProjectUpdateRequest request ) {
        log.info("[ProjectController] 프로젝트 정보 수정 >>>> request: {}", request);
        ProjectDetailsResponse response = projectService.updateProject(request.toCommand());
        return CommonResponse.ok(response);
    }
}
