package ssafy.aissue.domain.project.entity;


import jakarta.persistence.*;
import lombok.*;
import org.joda.time.DateTime;

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

    @Column
    private String title;
    private String description;

    private DateTime startAt;

    @Setter
    private DateTime endAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectMember> members;

    // jiraProjectKey만 받는 생성자 추가
    public Project(String jiraProjectKey) {
        this.jiraProjectKey = jiraProjectKey;
        this.members = new ArrayList<>();
    }


}
