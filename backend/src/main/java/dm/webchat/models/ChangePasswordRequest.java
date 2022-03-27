package dm.webchat.models;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {
    @NonNull
    private String oldPassword;

    @NonNull
    private String newPassword;
}