package dm.webchat.controller.exception;

import org.springframework.http.HttpStatus;

import dm.webchat.constants.HttpExceptionCodes;

public class InternalException extends CustomHttpException {
    public InternalException(String msg) {
        super(HttpExceptionCodes.INTERNAL_ERROR, msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}