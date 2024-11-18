package ssafy.aissue.domain.auth.service;

import ssafy.aissue.api.auth.response.AuthResponse;
import ssafy.aissue.domain.auth.command.LoginCommand;

public interface AuthService {
    AuthResponse login(LoginCommand command);
    void logout();

}
