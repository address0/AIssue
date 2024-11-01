package ssafy.aissue.api.member.request;


import io.swagger.v3.oas.annotations.media.Schema;
import ssafy.aissue.domain.member.command.MemberSignupCommand;

public record MemberSignupRequest(
        @Schema(description = "사용자의 jira이메일", example ="example@domain.com")
        String email,
        @Schema(description = "사용자의 비밀번호", example = "password123")
        String password,
        @Schema(description = "사용자의 jira키", example = "ATATT3xFfG~~~~")
        String jiraKey,
        @Schema(description = "사용자의 이름", example = "홍길동")
        String name
) {
    public MemberSignupCommand toCommand() {
        return new MemberSignupCommand(email, password, jiraKey, name);
    }

}
