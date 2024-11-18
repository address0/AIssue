package ssafy.aissue.domain.chatting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.chatting.entity.Chatting;
import ssafy.aissue.domain.project.entity.Project;

import java.util.List;
import java.util.Optional;

public interface ChattingRepository extends JpaRepository<Chatting, Long> {
    Optional<Chatting> findByProject(Project project);
    List<Chatting> findByProjectIdOrderByCreatedAtAsc(Long projectId);
}
