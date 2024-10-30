package ssafy.aissue.domain.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ssafy.aissue.api.member.response.MemberJiraIdResponse;
import ssafy.aissue.api.member.response.MemberSignupResponse;
import ssafy.aissue.common.exception.member.*;
import ssafy.aissue.common.exception.project.ProjectUpdateFailedException;
import ssafy.aissue.common.exception.security.*;
import ssafy.aissue.common.exception.token.TokenSaveFailedException;
import ssafy.aissue.common.util.JiraApiUtil;
import ssafy.aissue.common.util.JwtProcessor;
import ssafy.aissue.common.util.SecurityUtil;
import ssafy.aissue.domain.member.command.MemberSignupCommand;
import ssafy.aissue.domain.member.entity.Member;
import ssafy.aissue.domain.member.repository.MemberRepository;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.entity.ProjectMember;
import ssafy.aissue.domain.project.repository.ProjectMemberRepository;
import ssafy.aissue.domain.project.repository.ProjectRepository;
import ssafy.aissue.domain.project.service.ProjectService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProcessor jwtProcessor;
    private final JiraApiUtil jiraApiUtil;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectService projectService;

    @Override
    @Transactional
    public MemberSignupResponse signupMember(MemberSignupCommand signupCommand) {
        Member existingMember = memberRepository.findByEmail(signupCommand.email()).orElse(null);

        if (existingMember != null) {
            handleDuplicateMember(existingMember);
        }

        Member member = Optional.ofNullable(existingMember)
                .orElseGet(() -> createNewMember(signupCommand));

        memberRepository.save(member);
        log.info("[MemberService] 회원 저장 완료: {}", member.getId());

        try {
            updateMemberProjects(member, signupCommand);
        } catch (Exception e) {
            log.error("[MemberService] 프로젝트 정보 업데이트 중 오류 발생: memberId={}, error={}", member.getId(), e.getMessage(), e);
            throw new ProjectUpdateFailedException();
        }

        return generateTokenResponse(member);
    }

    private void handleDuplicateMember(Member existingMember) {
        if (!existingMember.getIsDeleted()) {
            log.warn("[MemberService] 이미 가입된 회원: {}", existingMember.getEmail());
            throw new AlreadyExistingMemberException();
        }
        log.info("[MemberService] 논리 삭제된 회원 복구 및 정보 업데이트: {}", existingMember.getEmail());
        existingMember.restore();
    }

    private Member createNewMember(MemberSignupCommand command) {
        String jiraAccountId = jiraApiUtil.fetchJiraAccountId(command.email(), command.jiraKey());
        log.info("[MemberService] 새로운 회원 생성: email={}, jiraId={}", command.email(), jiraAccountId);

        return Member.builder()
                .email(command.email())
                .password(passwordEncoder.encode(command.password()))
                .jiraKey(command.jiraKey())
                .jiraId(jiraAccountId)
                .name(command.name())
                .build();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateMemberProjects(Member member, MemberSignupCommand signupCommand) {
        List<String> projectKeys = jiraApiUtil.fetchUserProjects(signupCommand.email(), signupCommand.jiraKey());

        for (String projectKey : projectKeys) {
            // Project 엔티티를 생성할 때 ProjectService의 createProject 메서드를 사용
            Project project = projectRepository.findByJiraProjectKey(projectKey)
                    .orElseGet(() -> projectService.createProject(new Project(projectKey))); // createProject 호출

            // 이미 프로젝트와 멤버가 연결되어 있는지 확인
            if (!projectMemberRepository.existsByProjectAndMember(project, member)) {
                // Member와 Project가 저장된 상태에서 ProjectMember를 생성
                ProjectMember projectMember = new ProjectMember(project, member, member.getJiraId());
                project.getMembers().add(projectMember);  // Project 엔티티에 연결
                member.getProjects().add(projectMember);  // Member 엔티티에 연결

                // 최종적으로 ProjectMember 저장
                projectMemberRepository.save(projectMember);
            }
        }
    }


    private Project createNewProject(String projectKey) {
        Project project = new Project(projectKey);
        projectRepository.save(project);
        log.info("[MemberService] 새로운 프로젝트 생성 및 저장 완료: projectKey={}", projectKey);
        return project;
    }

    private void addProjectMemberIfNotExists(Project project, Member projectMember) {
        if (projectMemberRepository.findByProjectAndMember(project, projectMember).isEmpty()) {
            projectMemberRepository.save(new ProjectMember(project, projectMember, projectMember.getJiraId()));
            log.info("[MemberService] 새로운 ProjectMember 추가: projectKey={}, memberId={}", project.getJiraProjectKey(), projectMember.getId());
        }
    }

    private MemberSignupResponse generateTokenResponse(Member member) {
        try {
            String accessToken = jwtProcessor.generateAccessToken(member);
            String refreshToken = jwtProcessor.generateRefreshToken(member);
            jwtProcessor.saveRefreshToken(accessToken, refreshToken);
            return MemberSignupResponse.of(accessToken, refreshToken, member.getId());
        } catch (Exception e) {
            log.error("[MemberService] 토큰 생성/저장 실패: memberId={}, error={}", member.getId(), e.getMessage(), e);
            throw new TokenSaveFailedException();
        }
    }

    @Override
    @Transactional
    public MemberJiraIdResponse getJiraId() {
        Member currentMember = getCurrentLoggedInMember();
        return MemberJiraIdResponse.of(currentMember.getJiraId());
    }

    @Override
    @Transactional
    public String deleteMember() {
        Member currentMember = getCurrentLoggedInMember();
        currentMember.delete();
        memberRepository.save(currentMember);
        return "회원 탈퇴가 완료되었습니다.";
    }

    private Member getCurrentLoggedInMember() {
        Long userId = SecurityUtil.getLoginMemberId().orElseThrow(NotAuthenticatedException::new);
        Member member = memberRepository.findById(userId).orElseThrow(MemberNotFoundException::new);

        if (member.getIsDeleted()) {
            throw new NotAuthenticatedException();
        }
        return member;
    }

    @Override
    public List<String> getProjectKeysForMember(Long memberId) {
        Member member = memberRepository.findById(memberId).orElseThrow(MemberNotFoundException::new);
        return projectMemberRepository.findAllByMember(member).stream()
                .map(projectMember -> projectMember.getProject().getJiraProjectKey())
                .collect(Collectors.toList());
    }
}
