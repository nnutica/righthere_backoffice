import type { Timestamp } from "firebase/firestore";

export type DiaryDoc = {
  id: string;
  userId: string;
  createdAt: Timestamp;
  content: string;
  mood: string;
  sentimentScore: number;
  keywords: string;
  suggestion: string;
  emotionalReflection: string;
  imageUrl?: string;
  imageUrls?: string[];
};
