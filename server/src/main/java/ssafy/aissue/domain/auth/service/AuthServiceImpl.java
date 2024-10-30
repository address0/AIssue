package ssafy.aissue.domain.auth.service;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.aissue.api.auth.response.AuthResponse;
import ssafy.aissue.common.util.JwtProcessor;
import ssafy.aissue.domain.auth.command.LoginCommand;
import ssafy.aissue.domain.auth.model.LoginToken;
import ssafy.aissue.domain.auth.model.UserInfo;
import ssafy.aissue.domain.member.common.MemberRole;
import ssafy.aissue.domain.member.entity.Member;
import ssafy.aissue.domain.member.repository.MemberRepository;
import ssafy.aissue.common.exception.member.*;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final HttpServletRequest request;
    private final MemberRepository memberRepository;
    private final JwtProcessor jwtProcessor;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginCommand command) {
        log.info("[AuthService] 로그인 >>>>  이메일: {}", command.email());
        LoginToken tokens;
        String email = command.email();
        String password = command.password();
        Member member = findMemberByEmail(email)
                .orElseThrow(EmailNotFoundException::new);

        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new PasswordNotMatchException();
        }

        tokens = generateTokens(member);
        jwtProcessor.saveRefreshToken(tokens);

        return AuthResponse.of(tokens.accessToken(), tokens.refreshToken(), member.getId());
    }

    @Override
    @Transactional
    public void logout() {
        log.info("[AuthService] 로그아웃");
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String accessToken = authorizationHeader.substring(7);
            jwtProcessor.expireToken(accessToken);
        } else {
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }

    }

//    private boolean isNotRegisteredPlayer(UserInfo userInfo) {
//        log.debug("[AuthService] 미가입 선수 확인 >>>> 선수 이메일: {}", userInfo.email());
//        String email = userInfo.email();
//        Member member = findMemberByEmail(email).orElse(null);
//
//        if (member == null){
//            memberRepository.save(Member.createTempMember());
//            return true;
//        }
//        return isTempPlayer(member);
//    }


    private Optional<Member> findMemberByEmail(String email) {
        return memberRepository.findNotDeletedPlayerByEmail(email).map(member -> (Member) member);
    }

    private Boolean isTempPlayer(Member member) {
        return member.getRole() == MemberRole.TEMP;
    }

    private LoginToken generateTokens(Member member) {
        String accessToken = jwtProcessor.generateAccessToken(member);
        String refreshToken = jwtProcessor.generateRefreshToken(member);
        return new LoginToken(accessToken, refreshToken);
    }
}
