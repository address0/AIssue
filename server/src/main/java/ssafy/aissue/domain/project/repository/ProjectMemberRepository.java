package ssafy.aissue.domain.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.member.entity.Member;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.entity.ProjectMember;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    // 특정 회원이 참여 중인 모든 프로젝트 멤버 관계 조회
    List<ProjectMember> findAllByMember(Member member);
    Optional<ProjectMember> findByProjectAndMember(Project project, Member member);
    boolean existsByProjectAndMember(Project project, Member member);

}
