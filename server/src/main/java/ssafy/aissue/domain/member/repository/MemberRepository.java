package ssafy.aissue.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ssafy.aissue.domain.member.entity.Member;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);
    Optional<Member> findById(Long id);
    Optional<Member> findByJiraKey(String jiraKey);


    @Query("""
        SELECT p
        FROM Member p
        WHERE p.email = :email AND p.isDeleted = false
    """)
    Optional<Member> findNotDeletedPlayerByEmail(@Param("email") String email);


}
