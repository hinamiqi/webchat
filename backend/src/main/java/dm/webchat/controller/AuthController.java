package dm.webchat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dm.webchat.models.request.ChangePasswordRequest;
import dm.webchat.models.request.JwtResponse;
import dm.webchat.models.request.LoginRequest;
import dm.webchat.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    UserService userService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> loginUser(@RequestBody LoginRequest loginRequest) throws Exception {
        JwtResponse response = userService.authUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> registerUser(@RequestBody LoginRequest loginRequest) throws Exception {
        JwtResponse response = userService.registerNewUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        userService.changeUserPassword(request);
        return ResponseEntity.ok(true);
    }
}
