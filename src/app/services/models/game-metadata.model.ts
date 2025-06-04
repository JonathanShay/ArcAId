export interface GameMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  route: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedPlaytime: string;
} 