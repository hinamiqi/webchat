package dm.webchat.controller.exception;

import org.springframework.http.HttpStatus;

import dm.webchat.constants.HttpExceptionCodes;

public class NotFoundException extends CustomHttpException {
    public NotFoundException(String msg) {
        super(HttpExceptionCodes.BAD_REQUEST, msg, HttpStatus.BAD_REQUEST);
    }
}