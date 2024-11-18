package ssafy.aissue.api.auth;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.api.auth.request.*;
import ssafy.aissue.api.auth.response.AuthResponse;
import ssafy.aissue.common.util.SecurityUtil;
import ssafy.aissue.domain.auth.service.AuthService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Tag(name = "Auth", description = "인증/인가 API")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인", description = "유저 정보를 이용하여 login type으로 로그인 합니다.")
    @PostMapping(value ="/login")
    public CommonResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("[AuthController] 로그인 >>>> 이메일: {}", request.email());
        AuthResponse loginResponse = authService.login(request.toCommand());
        return CommonResponse.ok(loginResponse);
    }

    @Operation(summary = "로그아웃", description = "엑세스 토큰을 이용하여 login type으로 로그인 합니다.")
    @PostMapping("/logout")
    public CommonResponse<?> logout() {
        log.info("[AuthController] 로그아웃");
        authService.logout();
        return CommonResponse.noContent();
    }

    @Operation(summary = "서버상태확인하기", description = "인증 서버가 정상적으로 동작하는지 확인합니다.")
    @GetMapping("/ping")
    public CommonResponse<?> ping() {
        log.info("[AuthController] 인증 확인 >>>> 로그인 멤버 ID : {}", SecurityUtil.getLoginMemberId());
        return CommonResponse.ok("pong", null);
    }

}
