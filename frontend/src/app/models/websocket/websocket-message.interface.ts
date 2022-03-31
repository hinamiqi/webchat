export interface IWebSocketMessage<T> {
  token: string;
  data: T;
}
