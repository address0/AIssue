package ssafy.aissue.api.auth.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import ssafy.aissue.common.exception.member.AbnormalLoginProgressException;
import ssafy.aissue.domain.auth.model.UserInfo;

public record AuthResponse(
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String accessToken,

        @JsonInclude(JsonInclude.Include.NON_NULL)
        String refreshToken,

        @JsonInclude(JsonInclude.Include.NON_NULL)
        Long memberId,

        Boolean isRegistered,

        @JsonInclude(JsonInclude.Include.NON_NULL)
        String email
) {
    public static AuthResponse of(String accessToken, String refreshToken, Long memberId) {
        if (accessToken == null || refreshToken == null) {
            throw new AbnormalLoginProgressException();
        }
        return new AuthResponse(accessToken, refreshToken,memberId, true, null);
    }

    public static AuthResponse notRegistered(UserInfo userinfo) {
        return new AuthResponse(null, null, null,false, userinfo.email());
    }

}
