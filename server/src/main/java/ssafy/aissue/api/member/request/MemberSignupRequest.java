package ssafy.aissue.api.member.request;


import ssafy.aissue.domain.member.command.MemberSignupCommand;

public record MemberSignupRequest(
        String email,
        String password,
        String jiraKey,
        String name
) {
    public MemberSignupCommand toCommand() {
        return new MemberSignupCommand(email, password, jiraKey, name);
    }

}
