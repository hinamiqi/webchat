package dm.webchat.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import dm.webchat.models.User;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private List<User> mockUsers;

    public UserDetailsServiceImpl() {
        this.mockUsers = new ArrayList();
        this.mockUsers.add(
            User.builder()
            .username("admin")
            .password("123456")
            .roles(Arrays.asList("ADMIN"))
            .build()
        );
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.mockUsers.stream()
            .filter(u -> u.getUsername().equals(username))
            .findFirst()
            .orElseThrow(() -> new UsernameNotFoundException("No user with username: " + username));

        // User user = User.builder()
        //         .username("admin")
        //         .password("123456")
        //         .roles(Arrays.asList("ADMIN"))
        //         .build();
        return UserDetailsImpl.build(user);
    }
}
