package ssafy.aissue.domain.chatting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.chatting.entity.ChatSummary;
import java.util.List;

public interface ChatSummaryRepository extends JpaRepository<ChatSummary, Long> {
    List<ChatSummary> findAllByProjectKeyOrderByDateAsc(String projectKey);
}
