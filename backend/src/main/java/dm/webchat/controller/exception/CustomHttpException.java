package dm.webchat.controller.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.http.HttpStatus;

import dm.webchat.constants.HttpExceptionCodes;

@Data
@EqualsAndHashCode(callSuper=false)
@AllArgsConstructor
public class CustomHttpException extends RuntimeException {
    private HttpExceptionCodes code;
    private String message;
    private HttpStatus status;
}
