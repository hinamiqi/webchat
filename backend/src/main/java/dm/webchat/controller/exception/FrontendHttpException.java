package dm.webchat.controller.exception;

import org.springframework.http.HttpStatus;

import dm.webchat.constants.HttpExceptionCodes;

public class FrontendHttpException extends CustomHttpException {
    public FrontendHttpException(HttpExceptionCodes code, String msg) {
        super(code, msg, HttpStatus.BAD_REQUEST);
    }
}
