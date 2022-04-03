package dm.webchat.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import dm.webchat.controller.exception.BadRequestHttpException;
import dm.webchat.jwt.JwtUtils;

@Service
public class UserAuthService {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

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
}
