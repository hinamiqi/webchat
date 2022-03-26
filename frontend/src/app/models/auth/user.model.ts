export class User {

  constructor(
    public username: string,
    public uuid: string,
    public token: string,
    public roles: string[]) {
  }
}
