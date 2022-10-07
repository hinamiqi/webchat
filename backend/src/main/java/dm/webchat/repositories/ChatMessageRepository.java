package dm.webchat.repositories;

import org.springframework.data.domain.Pageable;

import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import dm.webchat.models.ChatMessage;
import dm.webchat.models.User;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findAll(Pageable pageable);

    Page<ChatMessage> findAllByReceiverAndAuthor(Pageable pageable, User receiver, User author);

    @Query(value = "select c from ChatMessage c where (c.receiver = ?1 and c.author = ?2) or (c.receiver = ?2 and c.author = ?1)")
    Page<ChatMessage> findAllPrivatePage(Pageable pageable, User receiver, User author);

    Page<ChatMessage> findAllByReceiver(Pageable pageable, User receiver);

    List<ChatMessage> findByDateIsGreaterThanEqualOrderByDateDesc(ZonedDateTime date);
}
