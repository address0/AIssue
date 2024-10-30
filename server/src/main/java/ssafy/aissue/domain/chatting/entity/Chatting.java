package ssafy.aissue.domain.chatting.entity;

import jakarta.persistence.*;
import lombok.*;
import org.joda.time.DateTime;
import org.springframework.data.annotation.CreatedDate;
import ssafy.aissue.domain.project.entity.Project;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Chatting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "chatting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    LocalDateTime createdAt;
}

