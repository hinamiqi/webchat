export enum GlobalEventWebSocketType {
  USER_ACTIVITY = 'USER_ACTIVITY',
  MESSAGE_DELETED = 'MESSAGE_DELETED'
}

export interface IGlobalEvent {
  type: GlobalEventWebSocketType;
  data: any;
}
