package ssafy.aissue.domain.issue.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.issue.entity.SubTask;

import java.util.Optional;

public interface SubTaskRepository extends JpaRepository<SubTask, Long> {
    Optional<SubTask> findByJiraId(Long jiraId);
}