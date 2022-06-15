export interface IChatMessageConfig {
  editable?: boolean;
  canSendPrivate?: boolean;
}

export class ChatMessageConfig implements IChatMessageConfig {
  editable: boolean;

  canSendPrivate: boolean;

  constructor(config?: IChatMessageConfig) {
    this.editable = config?.editable || true;
    this.canSendPrivate = config?.canSendPrivate || true;
  }
}
