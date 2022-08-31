package dm.webchat.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import dm.webchat.controller.exception.BadRequestHttpException;
import dm.webchat.controller.exception.NotFoundException;
import dm.webchat.helper.SecurityUtils;
import dm.webchat.jwt.JwtUtils;
import dm.webchat.models.User;
import dm.webchat.repositories.UserRepository;

@Service
public class UserAuthService {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private UserRepository userRepository;

    public UsernamePasswordAuthenticationToken getAuthentication(String jwt) {
        String username = jwtUtils.getUserNameFromJwtToken(jwt);
        if (username == null || username == "") {
            throw new BadRequestHttpException("No valid username found in JWT");
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            userDetails.getAuthorities()
        );

        authentication.eraseCredentials();

        return authentication;
    }

    public User getCurrentUser() throws NotFoundException {
        String currentUserLogin = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new NotFoundException("No current user authorization"));

        User currentUser = userRepository.findByUsername(currentUserLogin)
            .orElseThrow(() ->
                new NotFoundException(
                    String.format("No user with login (%s) found. It is pretty strange, actually, you should investigate this!", currentUserLogin))
            );

        return currentUser;
    }
}
