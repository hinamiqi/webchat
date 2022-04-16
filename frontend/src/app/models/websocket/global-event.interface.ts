export enum GlobalEventWebSocketType {
  USER_STATUS = 'USER_STATUS',
  MESSAGE_DELETED = 'MESSAGE_DELETED'
}

export interface IGlobalEvent {
  type: GlobalEventWebSocketType;
  data: any;
}
