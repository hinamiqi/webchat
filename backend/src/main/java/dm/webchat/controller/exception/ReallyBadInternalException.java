package dm.webchat.controller.exception;

import org.springframework.http.HttpStatus;

import dm.webchat.constants.HttpExceptionCodes;

public class ReallyBadInternalException extends CustomHttpException {
    public ReallyBadInternalException(String msg) {
        super(HttpExceptionCodes.SOMETHING_GONE_REALLY_WRONG, msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
