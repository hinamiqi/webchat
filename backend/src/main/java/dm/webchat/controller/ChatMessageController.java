package dm.webchat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import dm.webchat.jwt.JwtUtils;
import dm.webchat.models.User;
import dm.webchat.models.websocket.WebSocketMessage;
import dm.webchat.repositories.UserRepository;
import dm.webchat.controller.exception.BadRequestHttpException;
import dm.webchat.controller.exception.NotFoundException;

@Controller
public class ChatMessageController {
    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserRepository userRepository;

    @MessageMapping("/message")
    @SendTo("/chat/new-message")
    public WebSocketMessage publishMessage(WebSocketMessage message) throws Exception {
      String username = jwtUtils.getUserNameFromJwtToken(message.getToken());
      User user = userRepository.findByUsername(username).orElseThrow(() ->
        new NotFoundException(String.format("No user with login (%s) found", username))
      );
      if (!user.getUuid().equals(message.getData().getAuthor().getUuid())) {
        throw new BadRequestHttpException("Message author is not the user, who sent the message. Message rejected.");
      }
      Thread.sleep(1000); // simulated delay
      return message;
    }
}
