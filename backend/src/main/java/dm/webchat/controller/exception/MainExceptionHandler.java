package dm.webchat.controller.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@RestControllerAdvice
public class MainExceptionHandler {
    @ExceptionHandler(CustomHttpException.class)
    public ResponseEntity<SimpleError> handleCustomHttpException(CustomHttpException ex) {
        SimpleError error = SimpleError.builder()
            .errorCode(ex.getCode().name())
            .errorMessage(ex.getMessage())
            .build();
        return new ResponseEntity<>(
            error,
            ex.getStatus()
        );
    }
}
