package dm.webchat.models;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class User {
    private Long id;

    private String username;

    private String password;

    private List<String> roles;
}