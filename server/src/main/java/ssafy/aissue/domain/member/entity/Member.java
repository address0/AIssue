package ssafy.aissue.domain.member.entity;

import jakarta.persistence.*;
import lombok.*;
import ssafy.aissue.common.constant.global.S3_IMAGE;
import ssafy.aissue.domain.member.common.BaseMemberEntity;
import ssafy.aissue.domain.member.command.MemberSignupCommand;
import ssafy.aissue.domain.member.common.MemberRole;
import ssafy.aissue.domain.project.entity.ProjectMember;

import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor(access = AccessLevel.PUBLIC)  // public 기본 생성자
@AllArgsConstructor(access = AccessLevel.PROTECTED)  // 모든 필드를 포함한 생성자 (protected)
public class Member extends BaseMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;

    private String jiraKey;

    private String jiraId;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "member")
    private List<ProjectMember> projects;

    @Builder
    public Member(String email, String password,  String jiraKey, String jiraId, String name ) {
        this.email = email;
        this.password = password;
        this.jiraKey = jiraKey;
        this.jiraId = jiraId;
        this.name = name;
        this.role = MemberRole.MEMBER;
        this.isDeleted = false;
        this.projects = new ArrayList<>();
    }

    // 명시적인 생성자 추가 ( null 값 허용)
    public Member(MemberRole role) {
        this.isDeleted = false;
        this.role = role;
        this.projects = new ArrayList<>();
    }

    public static Member createTempMember() {
        return new Member(MemberRole.TEMP);
    }

    public void signupMember(MemberSignupCommand memberSignupCommand, String password) {
        this.email = memberSignupCommand.email();
        this.jiraKey = memberSignupCommand.jiraKey();
        this.password = password;
        this.name = memberSignupCommand.name();
        this.role = MemberRole.MEMBER;
        this.isDeleted = false;
    }

    @Override
    public void prePersist() {
        if (this.role == null){
            this.role = MemberRole.MEMBER;
        }

    }
}
