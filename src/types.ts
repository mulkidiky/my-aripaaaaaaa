export interface MemoryPhoto {
  id: string;
  url: string;
  title: string;
  date: string;
  description: string;
}

export interface SecretMessage {
  id: string;
  catIcon: 'sleeping' | 'winking' | 'love_eyes' | 'stretching' | 'happy' | 'snuggling';
  message: string;
  from: string;
  revealed?: boolean;
}

export interface AffectionLetter {
  id: string;
  title: string;
  body: string;
  sender: string;
  recipient: string;
  createdAt: string;
  unlockDate: string | null; // ISO string or date string, null if open immediately
}
