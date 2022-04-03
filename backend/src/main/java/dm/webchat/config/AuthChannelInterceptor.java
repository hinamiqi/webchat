package dm.webchat.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Service;

import dm.webchat.service.UserAuthService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthChannelInterceptor implements ChannelInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(AuthChannelInterceptor.class);

    private final UserAuthService service;

    @Autowired
    public AuthChannelInterceptor(UserAuthService service){
        this.service = service;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        final StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        assert accessor != null;
        if(accessor.getCommand() == StompCommand.CONNECT){
            logger.info("Stomp CONNECT");
            final String token = accessor.getFirstNativeHeader("token");
            accessor.setUser(service.getAuthentication(token));
        }

        return message;
    }
}
