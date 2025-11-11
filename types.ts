
export type ActiveTab = 'chat' | 'analyzer' | 'story';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
