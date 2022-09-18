package dm.webchat.models.dto;

import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonProperty;

import dm.webchat.models.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import static dm.webchat.helper.EmptinessHelper.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto implements Serializable {
    @JsonProperty("author")
    private UserDto author;
    private UserDto receiver;
    private ZonedDateTime date;
    private String text;
    private String oldText;
    private Long id;
    private List<RepliedMessageDto> repliedMessages;
    private String memeName;

    public ChatMessageDto(ChatMessage chatMessage) {
        this.author = new UserDto(chatMessage.getAuthor());
        this.receiver = isNotEmpty(chatMessage.getReceiver())
            ? new UserDto(chatMessage.getReceiver())
            : null;
        this.date = chatMessage.getDate();
        this.text = chatMessage.getText();
        this.oldText = chatMessage.getOldText();
        this.id = chatMessage.getId();
        if (chatMessage.getRepliedMessages() != null) {
            this.repliedMessages = chatMessage.getRepliedMessages().stream()
                .map(RepliedMessageDto::new)
                .collect(Collectors.toList());
        }
        if (chatMessage.getMeme() != null) {
            this.memeName = chatMessage.getMeme().getName();
        }
    }
}
