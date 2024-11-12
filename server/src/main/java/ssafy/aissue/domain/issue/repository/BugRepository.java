package ssafy.aissue.domain.issue.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.issue.entity.Bug;

import java.util.Optional;

public interface BugRepository extends JpaRepository<Bug, Long> {
    Optional<Bug> findByJiraId(Long jiraId);
}