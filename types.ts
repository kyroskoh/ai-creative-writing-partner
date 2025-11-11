
export type ActiveTab = 'chat' | 'analyzer' | 'story';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface StoryGenerationResult {
  story: string;
  prompts: string[];
}
