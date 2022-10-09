import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ErrorCodes } from '../constants/error-codes.const';
import { ErrorStatuses } from '../constants/error-statuses.const';

@Injectable({providedIn: 'root'})
export class ErrorHandlingService {
  constructor() {}

  getErrorMessage(err: HttpErrorResponse): string {
    switch (err.status) {
      case ErrorStatuses.BAD_CREDITENTIALS:
        return "Wrong logpass";
      default:
        return "Unknown error";
    }
  }

  handleError(err: HttpErrorResponse): Observable<never> {
    if (err.status === ErrorStatuses.BAD_CREDITENTIALS) {
      return throwError("Wrong logpass");
    }

    if (err.error.errorCode === ErrorCodes.USERNAME_ALREADY_TAKEN) {
      return throwError("Username already taken!");
    }

    if (!!err.error.errorMessage) {
      return throwError(err.error.errorMessage);
    }

    return throwError("Unknown error");
  }
}
