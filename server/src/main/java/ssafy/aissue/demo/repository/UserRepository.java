package ssafy.aissue.demo.repository;

import ssafy.aissue.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
