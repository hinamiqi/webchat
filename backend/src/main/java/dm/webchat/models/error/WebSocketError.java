package dm.webchat.models.error;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WebSocketError {
    private WebSocketErrorCodeEnum code;
    private String message;
}
