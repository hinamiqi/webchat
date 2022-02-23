package dm.webchat.jwt;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import dm.webchat.helper.DateHelper;
import dm.webchat.service.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMinutes}")
    private Integer jwtExpirationMinutes;

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        // String encodedString = Base64.getEncoder().encodeToString(jwtSecret.getBytes());

        return Jwts.builder()
            .setSubject(userPrincipal.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(DateHelper.getDateWithDelta(jwtExpirationMinutes))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    // public String getUserNameFromJwtToken(String token) {
    //     return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJwt(token).getBody().getSubject();
    // }

    public String getUserNameFromJwtToken(String authToken) {
        if (authToken == null) return null;
        try {
            final Claims claims = getAllClaimsFromToken(authToken);
            // Jwts.parser().setSigningKey(jwtSecret).parseClaimsJwt(authToken).getBody();
            String username = claims.getSubject();
            logger.info("Username from jwt: " + username);
            return username;
        } catch (SignatureException e) {
            logger.error("Invalid jwt signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid jwt token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return null;
    }

    private Claims getAllClaimsFromToken(String token) throws ExpiredJwtException, SignatureException {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody();
    }
}
