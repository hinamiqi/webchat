package dm.webchat.controller.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@RestControllerAdvice
public class MainExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleCustomHttpException(CustomHttpException ex) {
        return new ResponseEntity<>(
            SimpleError.builder()
            .errorCode(ex.getCode().name())
            .errorMessage(ex.getMessage())
            .build(),
            ex.getStatus()
        );
    }
}
