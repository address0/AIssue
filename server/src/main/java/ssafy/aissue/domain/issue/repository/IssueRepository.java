package ssafy.aissue.domain.issue.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.issue.common.BaseIssueEntity;

public interface IssueRepository extends JpaRepository<BaseIssueEntity, Long> {

}