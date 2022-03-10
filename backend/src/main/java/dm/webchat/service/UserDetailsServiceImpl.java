package dm.webchat.service;

import javax.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import dm.webchat.constants.HttpExceptionCodes;
import dm.webchat.controller.exception.CustomHttpException;
import dm.webchat.models.User;
import dm.webchat.repositories.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    @Override
    public UserDetails loadUserByUsername(String username) throws CustomHttpException {
        User user = userRepository.findByUsername(username).orElseThrow(() ->
            new CustomHttpException(HttpExceptionCodes.BAD_CREDENTIALS, "No such user exists!", HttpStatus.UNAUTHORIZED)
        );

        return UserDetailsImpl.build(user);
    }
}
