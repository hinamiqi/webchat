package dm.webchat.helper;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import dm.webchat.controller.exception.ReallyBadInternalException;

public final class SecurityUtils {
    public static String getCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication auth = securityContext.getAuthentication();
        if (auth.getPrincipal() instanceof UserDetails) {
            UserDetails springSecurityUser = (UserDetails) auth.getPrincipal();
            return springSecurityUser.getUsername();
        }
        throw new ReallyBadInternalException("Can't retrieve authentication from security context.");
    }
}
