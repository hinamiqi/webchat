package dm.webchat.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import dm.webchat.jwt.JwtUtils;
import dm.webchat.models.ChatMessage;
import dm.webchat.models.dto.ChatMessageDto;
import dm.webchat.models.error.WebSocketError;
import dm.webchat.models.error.WebSocketErrorCodeEnum;
import dm.webchat.models.websocket.WebSocketMessage;
import dm.webchat.repositories.UserRepository;
import dm.webchat.service.ChatService;
import dm.webchat.service.WebSocketService;
import dm.webchat.controller.exception.BadRequestHttpException;

@Controller
public class WebSocketController {
    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ChatService chatService;

    @Autowired
    WebSocketService websocketService;

    @Value("${app.messageDelayMs}")
    private Integer messageDelay;

    @MessageMapping("/message")
    @SendTo("/chat/new-message")
    public WebSocketMessage publishMessage(WebSocketMessage message, SimpMessageHeaderAccessor accessor) throws Exception {
      Principal user = accessor.getUser();
      if (!user.getName().equals(message.getData().getAuthor().getUsername())) {
        throw new BadRequestHttpException("Message author is not the user, who sent the message. Message rejected.");
      }
      ChatMessage saved = chatService.saveMessage(message.getData(), user);
      Thread.sleep(messageDelay); // delay for testing purpose

      websocketService.sendUserActivityEvent(userRepository.findByUsername(user.getName()).get());

      return WebSocketMessage.builder().data(new ChatMessageDto(saved)).build();
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public WebSocketError handleException(Exception e) {
      return WebSocketError.builder()
          .code(WebSocketErrorCodeEnum.INTERNAL_ERROR)
          .message(e.getMessage())
          .build();
    }
}
