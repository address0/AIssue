package ssafy.aissue.domain.project.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Project extends BaseProjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true)
    private String jiraProjectKey;

    private String projectImage;

    @Column
    private String title;
    private String description;

    private String techStack;

    private String feSkill;

    private String beSkill;

    private String infraSkill;

    private LocalDate startAt;

    @Setter
    private LocalDate endAt;

    private Boolean isCompleted = false;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectMember> members;

    // jiraProjectKey만 받는 생성자 추가
    public Project(String jiraProjectKey) {
        this.jiraProjectKey = jiraProjectKey;
        this.members = new ArrayList<>();
    }

    public void updateProjectInfo(String title, String description, String techStack, String feSkill, String beSkill, String infraSkill, LocalDate startAt, LocalDate endAt, String projectImage) {
        this.title = title;
        this.description = description;
        this.techStack = techStack;
        this.feSkill = feSkill;
        this.beSkill = beSkill;
        this.infraSkill = infraSkill;
        this.startAt = startAt;
        this.endAt = endAt;
        this.projectImage = projectImage;
        this.isCompleted = true;
    }

}
