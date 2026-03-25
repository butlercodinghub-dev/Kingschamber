export interface WisdomUnit {
  id: string;
  text: string;
  authors: string[];
  primary_author: string; // "Brother [Name]" or "Council of Kings"
  source_preview: string;
  embedding: number[];
  theme: string;
  created_at: string;
}

export interface WisdomStore {
  generated_at: string;
  total_units: number;
  units: WisdomUnit[];
}

export interface ParsedMessage {
  date: string;
  name: string;
  text: string;
}

export interface SearchResult {
  unit: WisdomUnit;
  score: number;
}

export interface WisdomResponse {
  quote: string;
  author: string;
  theme: string;
  sources?: { text: string; author: string }[];
}

export interface SavedQuote {
  id: string;
  quote: string;
  author: string;
  theme: string;
  saved_at: string;
}
