package dm.webchat.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import dm.webchat.models.ImageModel;

public interface ImageRepository extends JpaRepository<ImageModel, Long> {
    List<ImageModel> findByName(String name);
    List<ImageModel> findAll();
}
