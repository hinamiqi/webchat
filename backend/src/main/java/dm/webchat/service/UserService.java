package dm.webchat.service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dm.webchat.constants.HttpExceptionCodes;
import dm.webchat.constants.UserRoles;
import dm.webchat.controller.exception.FrontendHttpException;
import dm.webchat.controller.exception.InternalException;
import dm.webchat.controller.exception.NotFoundException;
import dm.webchat.helper.SecurityUtils;
import dm.webchat.jwt.JwtUtils;
import dm.webchat.models.Role;
import dm.webchat.models.User;
import dm.webchat.models.request.ChangePasswordRequest;
import dm.webchat.models.request.JwtResponse;
import dm.webchat.models.request.LoginRequest;
import dm.webchat.repositories.RoleRepository;
import dm.webchat.repositories.UserRepository;

@Service
public class UserService {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    WebSocketService websocketService;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;
    
    public JwtResponse authUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
            .map(r -> r.getAuthority())
            .collect(Collectors.toList());

        User user = userRepository.findByUsername(userDetails.getUsername()).get();

        websocketService.sendUserActivityEvent(user);

        return JwtResponse.builder()
            .token(jwt)
            .uuid(userDetails.getUuid())
            .username(userDetails.getUsername())
            .roles(roles)
            .build();
    }

    public void changeUserPassword(ChangePasswordRequest request) {
        String currentUserLogin = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new NotFoundException("No current user authorization"));
        //TODO: may be we need another way to check if old password is okay
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(currentUserLogin, request.getOldPassword())
        );

        User user = userRepository.findByUsername(currentUserLogin).get();

        user.setPassword(encoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }

    public JwtResponse registerNewUser(LoginRequest loginRequest) {
        userRepository.findByUsername(loginRequest.getUsername()).ifPresent(u -> {
            throw new FrontendHttpException(HttpExceptionCodes.USERNAME_ALREADY_TAKEN, String.format("Username `%s` already taken!", loginRequest.getUsername()));
        });
        createNewUser(loginRequest);
        return authUser(loginRequest);
    }

    @Transactional
    private User createNewUser(LoginRequest loginRequest) {
        Role defaultRole = roleRepository.findByName(UserRoles.USER).orElseThrow(() -> {
            throw new InternalException("No default role found!");
        });
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username(loginRequest.getUsername())
            .password(encoder.encode(loginRequest.getPassword()))
            .roles(Collections.singleton(defaultRole))
            .build();
        userRepository.save(user);
        return user;
    }
}
