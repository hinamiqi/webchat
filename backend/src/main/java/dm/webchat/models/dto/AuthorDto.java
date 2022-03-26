package dm.webchat.models.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import dm.webchat.models.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthorDto {
    @JsonProperty("username")
    private String username;
    @JsonProperty("uuid")
    private UUID uuid;

    public AuthorDto(User user) {
        this.username = user.getUsername();
        this.uuid = user.getUuid();
    }
}
