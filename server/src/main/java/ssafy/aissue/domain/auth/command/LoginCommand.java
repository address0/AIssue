package ssafy.aissue.domain.auth.command;

public record LoginCommand(
        String email,
        String password
) {
}
