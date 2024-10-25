package ssafy.aissue.demo.service;

import org.springframework.stereotype.Service;
import ssafy.aissue.demo.entity.User;
import ssafy.aissue.demo.repository.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
}