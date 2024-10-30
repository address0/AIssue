package ssafy.aissue.api.auth.request;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import ssafy.aissue.domain.auth.command.LoginCommand;

public record LoginRequest(
        @Email(message = "유저ID는 이메일 형식이어야 합니다.")
        @Schema(description = "로그인할 사용자의 이메일", example = "example@domain.com")
        String email,
        @Schema(description = "로그인할 사용자의 비밀번호", example = "password123")
        String password
) {
    public LoginCommand toCommand() {
        return new LoginCommand(email, password);
    }
}
