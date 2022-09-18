package dm.webchat.repositories;

import org.springframework.data.domain.Pageable;

import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dm.webchat.models.ChatMessage;
import dm.webchat.models.User;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findAll(Pageable pageable);

    Page<ChatMessage> findAllByReceiver(Pageable pageable, User receiver);

    Page<ChatMessage> findByDateIsGreaterThan(Pageable pageable, ZonedDateTime date);

    List<ChatMessage> findByDateIsGreaterThanEqualOrderByDateDesc(ZonedDateTime date);
}
