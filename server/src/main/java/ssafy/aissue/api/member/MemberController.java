package ssafy.aissue.api.member;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.api.member.request.MemberSignupRequest;
import ssafy.aissue.api.member.response.MemberJiraIdResponse;
import ssafy.aissue.api.member.response.MemberProjectIdsResponse;
import ssafy.aissue.api.member.response.MemberSignupResponse;
import ssafy.aissue.common.util.SecurityUtil;
import ssafy.aissue.domain.member.service.MemberService;
import ssafy.aissue.common.exception.security.NotAuthenticatedException;

import java.util.List;


@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/member")
@Tag(name = "Member", description = "회원관리")
public class MemberController {


    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;


    @Operation(summary = "회원가입", description = "회원가입 정보입니다.")
    @PostMapping(value="/signup")
    public CommonResponse<MemberSignupResponse> signup(@ModelAttribute @Validated MemberSignupRequest request){
        log.info("[PlayerController] 회원가입 >>>> request: {}", request);
        MemberSignupResponse response = memberService.signupMember(request.toCommand());
        return CommonResponse.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "회원 JiraId 조회", description = "회원의 Jira Id를 조회하는 API입니다.")
    @GetMapping("/jiraId")
    public CommonResponse<MemberJiraIdResponse> getMemberJiraId() {
        log.info("[PlayerController] 회원 JiraId 조회");
        MemberJiraIdResponse response = memberService.getJiraId();
        return CommonResponse.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "회원의 프로젝트 ID 조회", description = "회원이 참여 중인 모든 프로젝트의 ID를 조회합니다.")
    @GetMapping("/projects")
    public CommonResponse<MemberProjectIdsResponse> getMemberProjects() {
        log.info("[MemberController] 회원 프로젝트 조회");
        Long memberId = SecurityUtil.getLoginMemberId().orElseThrow(NotAuthenticatedException::new);
        List<String> projectIds = memberService.getProjectKeysForMember(memberId);
        return CommonResponse.ok(new MemberProjectIdsResponse(projectIds));
    }

    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "회원 탈퇴", description = "회원 정보를 삭제하는 API입니다.")
    @PatchMapping
    public CommonResponse<?> deleteMember() {
        log.info("[PlayerController] 회원 탈퇴");
        String message = memberService.deleteMember();
        return CommonResponse.ok(message, null);
    }

}
