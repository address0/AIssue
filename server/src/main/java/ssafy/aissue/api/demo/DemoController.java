package ssafy.aissue.api.demo;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import ssafy.aissue.demo.entity.User;
import ssafy.aissue.demo.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;


@RestController
@RequestMapping("/demo")
public class DemoController {

    private final UserService userService;

    public DemoController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getUsers();
    }

    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody User user) {
        userService.saveUser(user);
        // 생성 완료 후 메시지를 클라이언트로 반환
        return ResponseEntity.ok("User has been successfully created.");
    }
}
