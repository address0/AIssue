package ssafy.aissue.domain.project.entity;

import jakarta.persistence.*;
import lombok.*;
import ssafy.aissue.domain.member.entity.Member;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Entity
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String jiraId;  // Jira에서의 사용자 ID를 추가 저장하여 조회 시 사용

    public ProjectMember(Project project, Member member, String jiraId) {
        this.project = project;
        this.member = member;
        this.jiraId = jiraId;
    }
}
