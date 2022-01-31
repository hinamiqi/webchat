package dm.webchat.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {
    private String token;

    @Builder.Default
    private String type = "Bearer";

    private Long id;

    private String username;

    private String email;

    private List<String> roles;
}
