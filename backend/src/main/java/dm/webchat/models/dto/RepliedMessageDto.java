package dm.webchat.models.dto;

import dm.webchat.constants.NumericConstants;
import dm.webchat.constants.StringConstants;
import dm.webchat.models.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepliedMessageDto {
    private Long id;
    private String preview;

    public RepliedMessageDto(ChatMessage message) {
        this.id = message.getId();
        String text =  message.getText();
        if (text.length() < NumericConstants.REPLIED_MESSAGE_PREVIEW_LENGTH) {
            this.preview = message.getText();
        } else {
            this.preview = message.getText().substring(0, NumericConstants.REPLIED_MESSAGE_PREVIEW_LENGTH) + StringConstants.ELLIPSIS;
        }
    }
}
