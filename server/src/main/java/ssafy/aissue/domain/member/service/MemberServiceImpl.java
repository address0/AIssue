package ssafy.aissue.domain.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.aissue.api.member.response.MemberJiraIdResponse;
import ssafy.aissue.api.member.response.MemberSignupResponse;
import ssafy.aissue.common.exception.token.TokenSaveFailedException;
import ssafy.aissue.common.util.JiraApiUtil;
import ssafy.aissue.common.util.JwtProcessor;
import ssafy.aissue.common.util.SecurityUtil;
import ssafy.aissue.domain.member.command.MemberSignupCommand;
import ssafy.aissue.domain.member.entity.Member;
import ssafy.aissue.domain.member.repository.MemberRepository;
import ssafy.aissue.common.exception.security.*;
import ssafy.aissue.common.exception.member.*;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProcessor jwtProcessor;
    private final JiraApiUtil jiraApiUtil;

    @Override
    @Transactional
    public MemberSignupResponse signupMember(MemberSignupCommand signupCommand) {
        log.info("[MemberService] 회원가입 >>>> signupCommand: {}", signupCommand);
        // Jira API를 통해 account_id 가져오기
        String jiraAccountId = jiraApiUtil.fetchJiraAccountId(signupCommand.email(), signupCommand.jiraKey());
        log.info("[MemberService] 회원가입 지라 아이디 조회 >>>> jiraAccountId: {}", jiraAccountId);

        // 이미 존재하는 회원 조회
        Member existingMember = memberRepository.findByEmail(signupCommand.email()).orElse(null);
        log.info("[MemberService] 회원가입 >>>> existingMember: {}", existingMember);

        // 회원이 이미 존재하는 경우, jiraId가 null이라면 새로 설정
        if (existingMember != null) {
            if (existingMember.getJiraId() == null) {
                existingMember.setJiraId(jiraAccountId); // null인 경우 jiraId 설정
                log.info("[MemberService] 기존 회원의 jiraId 설정 >>>> jiraAccountId: {}", jiraAccountId);
            }
        } else {
            // 회원이 존재하지 않으면 새로운 회원 생성
            existingMember = createNewMember(signupCommand, jiraAccountId);
        }

        // 비밀번호 설정 및 회원 저장
        String encodedPassword = passwordEncoder.encode(signupCommand.password());
        existingMember.signupMember(signupCommand, encodedPassword);
        memberRepository.save(existingMember);
        log.info("[MemberService] 회원가입 >>>> signupCommand: {}", signupCommand);

        try {
            String accessToken = jwtProcessor.generateAccessToken(existingMember);
            String refreshToken = jwtProcessor.generateRefreshToken(existingMember);
            jwtProcessor.saveRefreshToken(accessToken, refreshToken);
            return MemberSignupResponse.of(accessToken, refreshToken);
        } catch (Exception e) {
            throw new TokenSaveFailedException();
        }
    }

    //   로그인한 사용자의 jiraId 조회
    @Override
    @Transactional
    public MemberJiraIdResponse getJiraId() {
        log.info("[MemberService] 회원 JiraId 조회");
        Member currentMember = getCurrentLoggedInMember();
        return MemberJiraIdResponse.of(currentMember.getJiraId());
    }

    @Override
    @Transactional
    public String deleteMember() {
        log.info("[MemberService] 회원 탈퇴");
        Member currentMember = getCurrentLoggedInMember();
        currentMember.delete();
        memberRepository.save(currentMember);
        return "회원 탈퇴가 완료되었습니다.";
    }

    private Member createNewMember(MemberSignupCommand command, String jiraAccountId) {
        return Member.builder()
                .email(command.email())
                .password(passwordEncoder.encode(command.password()))
                .jiraKey(command.jiraKey())
                .jiraId(jiraAccountId)
                .build();
    }

    private Member getCurrentLoggedInMember() {
        Long userId = SecurityUtil.getLoginMemberId()
                .orElseThrow(NotAuthenticatedException::new);

        Member member = memberRepository.findById(userId)
                .orElseThrow(MemberNotFoundException::new);


        if (member.getIsDeleted()){
            throw new NotAuthenticatedException();
        }
        return member;
    }
}
