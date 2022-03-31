package dm.webchat.controller.exception;

import org.springframework.http.HttpStatus;

import dm.webchat.constants.HttpExceptionCodes;

public class BadRequestHttpException extends CustomHttpException {
    public BadRequestHttpException(String msg) {
        super(HttpExceptionCodes.BAD_REQUEST, msg, HttpStatus.BAD_REQUEST);
    }
}
