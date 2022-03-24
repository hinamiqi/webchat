import { ILoginResponse } from './login-response.interface';

export class User {
  username: string;

  token: string;

  roles: string[];

  constructor(user: ILoginResponse) {
    this.username = user.username;
    this.token = user.token;
    this.roles = user.roles;
  }
}
