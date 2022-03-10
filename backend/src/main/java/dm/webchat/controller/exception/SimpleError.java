package dm.webchat.controller.exception;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SimpleError {
    String errorCode;
    String errorMessage;
}
