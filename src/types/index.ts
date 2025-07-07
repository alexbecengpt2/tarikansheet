export interface SheetsConfig {
  spreadsheetId: string;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
  range: string;
  sheetName: string;
  columns: string;
}

export interface GoogleAuthConfig {
  clientId: string;
  isSignedIn: boolean;
  userEmail?: string;
  accessToken?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  originalText: string;
  parsedData: string[][];
  success: boolean;
  error?: string;
  sheetName?: string;
}

export interface SheetInfo {
  name: string;
  id: number;
  columns: string[];
}

export interface ExtensionMessage {
  type: 'SELECTED_TEXT';
  text: string;
  url: string;
}