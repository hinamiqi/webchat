package dm.webchat.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import dm.webchat.models.Meme;

public interface MemeRepository extends JpaRepository<Meme, UUID> {
    Optional<Meme> findByName(String name);
    List<Meme> findAll();
}
