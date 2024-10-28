package ssafy.aissue.domain.member.command;

public record MemberLoginCommand(
        String email,
        String password
) {

}
