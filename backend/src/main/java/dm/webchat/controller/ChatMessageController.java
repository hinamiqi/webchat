package dm.webchat.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import dm.webchat.models.dto.ChatMessageDto;

@Controller
public class ChatMessageController {
    @MessageMapping("/message")
    @SendTo("/chat/new-message")
    public ChatMessageDto publishMessage(ChatMessageDto message) throws Exception {
      Thread.sleep(1000); // simulated delay
      return message;
    }
}
