package ssafy.aissue.domain.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class ProjectFunction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // 프로젝트 설정 메소드
    public void setProject(Project project) {
        this.project = project;
        if (!project.getFunctions().contains(this)) {
            project.getFunctions().add(this);
        }
    }

    public static ProjectFunction create(String title, String description, Project project) {
        ProjectFunction function = new ProjectFunction();
        function.setTitle(title);
        function.setDescription(description);
        function.setProject(project);
        return function;
    }
}
