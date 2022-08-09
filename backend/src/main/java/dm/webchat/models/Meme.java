package dm.webchat.models;

import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "memes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Meme {
    @Id
    private UUID uuid;

    @Column
    private String name;

    @OneToOne
    @JoinColumn(name = "image_id")
    private ImageModel image;
}
