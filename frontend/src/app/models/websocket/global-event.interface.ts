export enum GlobalEventWebSocketType {
  USER_ACTIVITY = 'USER_ACTIVITY',
  MESSAGE_DELETED = 'MESSAGE_DELETED',
  MESSAGE_EDITED = 'MESSAGE_EDITED'
}

export interface IGlobalEvent {
  type: GlobalEventWebSocketType;
  data: any;
}
