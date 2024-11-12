package ssafy.aissue.domain.issue.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.issue.entity.Story;

import java.util.Optional;

public interface StoryRepository extends JpaRepository<Story, Long> {
    Optional<Story> findByJiraId(Long jiraId);
}