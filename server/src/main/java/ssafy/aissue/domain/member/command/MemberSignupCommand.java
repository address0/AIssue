package ssafy.aissue.domain.member.command;


public record MemberSignupCommand(
        String email,
        String password,
        String jiraKey,
        String name
) {

}
