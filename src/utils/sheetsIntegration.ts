import { SheetsConfig, SheetInfo } from '../types';

export const sendToGoogleSheets = async (
  data: string[][],
  config: SheetsConfig
): Promise<void> => {
  const { spreadsheetId, apiKey, range } = config;
  
  console.log('Sending to Google Sheets:', {
    spreadsheetId,
    apiKey: apiKey.substring(0, 10) + '...',
    range,
    dataRows: data.length
  });
  
  // Validate inputs
  if (!spreadsheetId || !apiKey || !range) {
    throw new Error('Missing required configuration: spreadsheetId, apiKey, or range');
  }
  
  // Ensure spreadsheetId is just the ID, not a URL
  const cleanSpreadsheetId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  
  // Clean the range to ensure proper formatting
  const cleanRange = encodeURIComponent(range);
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}/values/${cleanRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${apiKey}`;
  
  console.log('Request URL:', url);
  
  const requestBody = {
    values: data,
    majorDimension: "ROWS"
  };
  
  console.log('Request body:', requestBody);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: { message: responseText } };
      }
      
      console.error('API Error:', errorData);
      
      // Handle specific error cases with more detailed messages
      if (response.status === 401) {
        throw new Error(`API Key tidak valid (401). Solusi:
1. Pastikan API Key dimulai dengan "AIza"
2. Buka Google Cloud Console dan aktifkan Google Sheets API
3. Buat API Key baru jika perlu
4. Pastikan tidak ada spasi di awal/akhir API Key

Error detail: ${errorData.error?.message || 'Unauthorized'}`);
      } else if (response.status === 403) {
        throw new Error(`Akses ditolak (403). Solusi:
1. Buka spreadsheet di Google Sheets
2. Klik tombol "Share" (Bagikan)
3. Ubah "General access" menjadi "Anyone with the link"
4. Set permission ke "Editor"
5. Pastikan Google Sheets API sudah diaktifkan di Google Cloud Console

Error detail: ${errorData.error?.message || 'Forbidden'}`);
      } else if (response.status === 404) {
        throw new Error(`Spreadsheet tidak ditemukan (404). Solusi:
1. Periksa Spreadsheet ID: ${cleanSpreadsheetId}
2. Pastikan spreadsheet masih ada dan tidak dihapus
3. Periksa nama sheet: "${config.sheetName}"
4. Pastikan sheet dengan nama tersebut ada di spreadsheet

Error detail: ${errorData.error?.message || 'Not Found'}`);
      } else if (response.status === 400) {
        throw new Error(`Request tidak valid (400). Solusi:
1. Periksa format range: "${range}"
2. Pastikan nama sheet benar
3. Periksa format data yang dikirim

Error detail: ${errorData.error?.message || 'Bad Request'}`);
      } else {
        throw new Error(`HTTP Error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }
    }
    
    const result = JSON.parse(responseText);
    console.log('Success result:', result);
    return result;
  } catch (error) {
    console.error('Fetch error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke Google Sheets API. Periksa koneksi internet Anda');
    }
    throw error;
  }
};

export const testSheetsConnection = async (config: SheetsConfig): Promise<{ success: boolean; message: string }> => {
  const { spreadsheetId, apiKey } = config;
  
  console.log('Testing connection:', {
    spreadsheetId,
    apiKey: apiKey.substring(0, 10) + '...'
  });
  
  // Validate inputs
  if (!spreadsheetId || !apiKey) {
    return { success: false, message: 'Spreadsheet ID dan API Key harus diisi' };
  }
  
  if (!apiKey.startsWith('AIza')) {
    return { success: false, message: 'API Key harus dimulai dengan "AIza". Periksa kembali API Key Anda.' };
  }
  
  // Ensure spreadsheetId is just the ID, not a URL
  const cleanSpreadsheetId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}?key=${apiKey}`;
  console.log('Test URL:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Test response status:', response.status);
    
    const responseText = await response.text();
    console.log('Test response text:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('Spreadsheet data:', data);
      
      // Check if the specified sheet exists
      const sheets = data.sheets || [];
      const sheetNames = sheets.map((sheet: any) => sheet.properties.title);
      const targetSheet = config.sheetName;
      
      if (targetSheet && !sheetNames.includes(targetSheet)) {
        return { 
          success: false, 
          message: `Sheet "${targetSheet}" tidak ditemukan. Sheet yang tersedia: ${sheetNames.join(', ')}` 
        };
      }
      
      return { 
        success: true, 
        message: `✅ Koneksi berhasil! 
Spreadsheet: "${data.properties?.title || 'Unknown'}"
Sheets tersedia: ${sheetNames.join(', ')}
${targetSheet ? `Target sheet "${targetSheet}" ✓` : ''}
Spreadsheet ID: ${cleanSpreadsheetId}` 
      };
    } else {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: { message: responseText } };
      }
      
      console.error('Test error:', errorData);
      
      if (response.status === 401) {
        return { 
          success: false, 
          message: `❌ API Key tidak valid (401)
Solusi:
1. Pastikan API Key dimulai dengan "AIza"
2. Buka Google Cloud Console
3. Aktifkan Google Sheets API
4. Buat API Key baru jika perlu

Current API Key: ${apiKey.substring(0, 10)}...` 
        };
      } else if (response.status === 403) {
        return { 
          success: false, 
          message: `❌ Akses ditolak (403)
Solusi:
1. Buka spreadsheet di Google Sheets
2. Klik "Share" → "General access" → "Anyone with the link"
3. Set permission ke "Editor"
4. Pastikan Google Sheets API aktif di Google Cloud Console

Spreadsheet ID: ${cleanSpreadsheetId}` 
        };
      } else if (response.status === 404) {
        return { 
          success: false, 
          message: `❌ Spreadsheet tidak ditemukan (404)
Periksa Spreadsheet ID: ${cleanSpreadsheetId}
Pastikan spreadsheet masih ada dan dapat diakses

Original input: ${spreadsheetId}` 
        };
      } else {
        return { 
          success: false, 
          message: `❌ Error ${response.status}: ${errorData.error?.message || response.statusText}
Spreadsheet ID: ${cleanSpreadsheetId}` 
        };
      }
    }
  } catch (error) {
    console.error('Test connection error:', error);
    return { 
      success: false, 
      message: `❌ Tidak dapat terhubung ke Google Sheets API
Error: ${error instanceof Error ? error.message : 'Unknown error'}
Periksa koneksi internet Anda
Spreadsheet ID: ${cleanSpreadsheetId}` 
    };
  }
};

export const getSheetsList = async (config: SheetsConfig): Promise<SheetInfo[]> => {
  const { spreadsheetId, apiKey } = config;
  
  // Ensure spreadsheetId is just the ID, not a URL
  const cleanSpreadsheetId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheets: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.sheets?.map((sheet: any) => ({
      name: sheet.properties.title,
      id: sheet.properties.sheetId,
      columns: ['A', 'B', 'C', 'D', 'E', 'F'] // Default columns, could be dynamic
    })) || [];
  } catch (error) {
    console.error('Error fetching sheets list:', error);
    return [];
  }
};

// Helper function to validate spreadsheet URL and extract ID
export const extractSpreadsheetId = (input: string): string | null => {
  console.log('extractSpreadsheetId: Input received:', input);

  // If it's already just an ID (no slashes or dots, and looks like an ID)
  // A Google Sheet ID is typically 44 characters long and contains alphanumeric characters, hyphens, and underscores.
  if (!input.includes('/') && !input.includes('.') && input.length >= 20 && input.match(/^[a-zA-Z0-9_-]+$/)) {
    console.log('extractSpreadsheetId: Input appears to be a clean ID:', input);
    return input;
  }
  
  // Extract from various Google Sheets URL formats
  const patterns = [
    // Matches common Google Sheets URLs like /spreadsheets/d/ID/edit or /spreadsheets/d/ID
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)(?:[\/?#]|$)/,
    // Matches URLs with /u/0/ (user specific)
    /\/spreadsheets\/u\/\d+\/d\/([a-zA-Z0-9_-]+)(?:[\/?#]|$)/,
    /id=([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      console.log(`extractSpreadsheetId: Matched pattern "${pattern.source}", extracted ID:`, match[1]);
      return match[1];
    }
  }
  
  console.log('extractSpreadsheetId: No ID extracted from input:', input);
  return null;
};

// Helper function to validate API key format
export const validateApiKey = (apiKey: string): boolean => {
  return apiKey.startsWith('AIza') && apiKey.length > 20;
};