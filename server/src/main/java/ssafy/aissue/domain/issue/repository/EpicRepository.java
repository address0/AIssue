package ssafy.aissue.domain.issue.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.issue.entity.Epic;

import java.util.Optional;

public interface EpicRepository extends JpaRepository<Epic, Long> {
    Optional<Epic> findByJiraId(Long jiraId);
    Optional<Epic> findByJiraKey(String jiraKey);
}