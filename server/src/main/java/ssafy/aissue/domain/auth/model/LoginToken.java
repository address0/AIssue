package ssafy.aissue.domain.auth.model;

public record LoginToken(
        String accessToken,
        String refreshToken
) {
}
