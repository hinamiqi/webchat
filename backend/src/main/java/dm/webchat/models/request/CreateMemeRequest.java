package dm.webchat.models.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
public class CreateMemeRequest {
    @NonNull
    private MultipartFile file;

    @NonNull
    private String name;
}
