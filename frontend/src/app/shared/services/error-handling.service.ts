import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ErrorCodes } from '../constants/error-codes.const';

@Injectable({providedIn: 'root'})
export class ErrorHandlingService {
  constructor() {}

  getErrorMessage(err: HttpErrorResponse): string {
    switch (err.status) {
      case ErrorCodes.BAD_CREDITENTIALS:
        return "Wrong logpass";
      default:
        return "Unknown error";
    }
  }

  handleError(err: HttpErrorResponse): Observable<never> {
    switch (err.status) {
      case ErrorCodes.BAD_CREDITENTIALS:
        return throwError("Wrong logpass");
      default:
        return throwError("Unknown error");
    }
  }
}
