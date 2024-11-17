package ssafy.aissue.domain.project.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.project.entity.Project;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {


    // jiraProjectKey로 프로젝트를 조회하는 메서드 추가
    Optional<Project> findByJiraProjectKey(String jiraProjectKey);

}