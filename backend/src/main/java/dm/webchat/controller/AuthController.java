package dm.webchat.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dm.webchat.helper.SecurityUtils;
import dm.webchat.jwt.JwtUtils;
import dm.webchat.models.ChangePasswordRequest;
import dm.webchat.models.JwtResponse;
import dm.webchat.models.LoginRequest;
import dm.webchat.models.User;
import dm.webchat.repositories.UserRepository;
import dm.webchat.service.UserDetailsImpl;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) throws Exception {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
            .map(r -> r.getAuthority())
            .collect(Collectors.toList());

        return ResponseEntity.ok(
            JwtResponse.builder()
            .token(jwt)
            .uuid(userDetails.getUuid())
            .username(userDetails.getUsername())
            .roles(roles)
            .build()
        );
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        String currentUserLogin = SecurityUtils.getCurrentUserLogin();
        //TODO: may be we need another way to check if old password is okay
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(currentUserLogin, request.getOldPassword())
        );

        User user = userRepository.findByUsername(currentUserLogin).get();

        user.setPassword(encoder.encode(request.getNewPassword()));

        userRepository.save(user);

        return ResponseEntity.ok(true);
    }
}
