export interface Location {
  id: string;
  name: string;
  type: 'room' | 'storage';
  icon: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  locationId: string;
  description: string;
  quantity: number;
  image?: string; // Base64 string
  tags: string[];
  purchaseDate?: string;
  expiryDate?: string;
}

export interface AIDetectedItem {
  name: string;
  category: string;
  description: string;
  tags: string[];
  suggestedStorageType: string;
}

export type ViewMode = 'dashboard' | 'inventory' | 'assistant';