import { Injectable } from '@angular/core';

// TODO: allow to substarct, add any period
const typeMap = {
  d: 'getDay',
  h: 'getHour',
  ms: 'getMilliseconds',
  min: 'getMinutes',
  m: 'getMonth',
  s: 'getSeconds'
};

@Injectable({providedIn: 'root'})
export class DateHelperService {
  /**
   * Helpful method to get Date before original date
   * @param originalDate -- date, from which we need to substract
   * @param amount -- how many minutes to substract
   * @returns new date
   */
  static getDateMinusMinutes(originalDate: Date, amount: number): Date {
    const newDate = new Date(originalDate);
    newDate.setMinutes(originalDate.getMinutes() - amount);
    return newDate;
  }
}
