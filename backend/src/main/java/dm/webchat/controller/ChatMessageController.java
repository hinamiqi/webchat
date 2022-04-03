package dm.webchat.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import dm.webchat.jwt.JwtUtils;
import dm.webchat.models.websocket.WebSocketMessage;
import dm.webchat.repositories.UserRepository;
import dm.webchat.controller.exception.BadRequestHttpException;

@Controller
public class ChatMessageController {
    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserRepository userRepository;

    @MessageMapping("/message")
    @SendTo("/chat/new-message")
    public WebSocketMessage publishMessage(WebSocketMessage message, SimpMessageHeaderAccessor accessor) throws Exception {
      Principal user = accessor.getUser();
      if (!user.getName().equals(message.getData().getAuthor().getUsername())) {
        throw new BadRequestHttpException("Message author is not the user, who sent the message. Message rejected.");
      }
      Thread.sleep(1000); // simulated delay
      return message;
    }
}
