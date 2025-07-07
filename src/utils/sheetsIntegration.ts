import { SheetsConfig, SheetInfo } from '../types';

// OAuth2 configuration
const OAUTH_CONFIG = {
  clientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // You'll need to replace this
  redirectUri: window.location.origin,
  scope: 'https://www.googleapis.com/auth/spreadsheets',
  responseType: 'token'
};

// Store access token
let accessToken: string | null = null;

// Check if we have a valid access token
export const hasValidToken = (): boolean => {
  const token = localStorage.getItem('google_access_token');
  const expiry = localStorage.getItem('google_token_expiry');
  
  if (!token || !expiry) return false;
  
  const now = Date.now();
  const expiryTime = parseInt(expiry);
  
  if (now >= expiryTime) {
    // Token expired, clear it
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    return false;
  }
  
  accessToken = token;
  return true;
};

// Initiate OAuth2 flow
export const initiateOAuth = (): void => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${OAUTH_CONFIG.clientId}&` +
    `redirect_uri=${encodeURIComponent(OAUTH_CONFIG.redirectUri)}&` +
    `scope=${encodeURIComponent(OAUTH_CONFIG.scope)}&` +
    `response_type=${OAUTH_CONFIG.responseType}&` +
    `access_type=online`;
  
  window.location.href = authUrl;
};

// Handle OAuth2 callback
export const handleOAuthCallback = (): boolean => {
  const hash = window.location.hash;
  if (!hash.includes('access_token=')) return false;
  
  const params = new URLSearchParams(hash.substring(1));
  const token = params.get('access_token');
  const expiresIn = params.get('expires_in');
  
  if (token && expiresIn) {
    const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
    
    localStorage.setItem('google_access_token', token);
    localStorage.setItem('google_token_expiry', expiryTime.toString());
    
    accessToken = token;
    
    // Clear the hash from URL
    window.history.replaceState(null, '', window.location.pathname);
    
    return true;
  }
  
  return false;
};

// Alternative: Use Google Apps Script as proxy
export const sendToGoogleSheetsViaProxy = async (
  data: string[][],
  config: SheetsConfig
): Promise<void> => {
  // This is a workaround using Google Apps Script as a proxy
  // You'll need to create a Google Apps Script with doPost function
  
  const proxyUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
  
  const requestBody = {
    spreadsheetId: config.spreadsheetId,
    range: config.range,
    values: data,
    apiKey: config.apiKey
  };
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Proxy error:', error);
    throw error;
  }
};

export const sendToGoogleSheets = async (
  data: string[][],
  config: SheetsConfig
): Promise<void> => {
  const { spreadsheetId, range } = config;
  
  console.log('Sending to Google Sheets:', {
    spreadsheetId,
    range,
    dataRows: data.length
  });
  
  // Validate inputs
  if (!spreadsheetId || !range) {
    throw new Error('Missing required configuration: spreadsheetId or range');
  }
  
  // Ensure spreadsheetId is just the ID, not a URL
  const cleanSpreadsheetId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  
  // Clean the range to ensure proper formatting
  const cleanRange = encodeURIComponent(range);
  
  // Check if we have OAuth token
  if (!hasValidToken()) {
    throw new Error(`Autentikasi diperlukan untuk mengirim data ke Google Sheets.

SOLUSI ALTERNATIF:
1. Gunakan Google Apps Script sebagai proxy
2. Atau gunakan service account dengan JSON key
3. Atau implementasi OAuth2 flow

Untuk sementara, Anda bisa:
- Copy data dari preview table
- Paste manual ke Google Sheets
- Atau gunakan extension untuk copy-paste otomatis`);
  }
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}/values/${cleanRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  
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
        'Authorization': `Bearer ${accessToken}`,
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
        // Clear invalid token
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_token_expiry');
        accessToken = null;
        
        throw new Error(`Token tidak valid atau expired (401). 

SOLUSI:
1. Refresh halaman dan login ulang ke Google
2. Atau gunakan metode alternatif:
   - Copy data dari tabel preview
   - Paste manual ke Google Sheets

Error detail: ${errorData.error?.message || 'Unauthorized'}`);
      } else if (response.status === 403) {
        throw new Error(`Akses ditolak (403). SOLUSI:
1. Buka spreadsheet di Google Sheets
2. Klik tombol "Share" (Bagikan)
3. Ubah "General access" menjadi "Anyone with the link"
4. Set permission ke "Editor"
5. Pastikan Google Sheets API sudah diaktifkan

Error detail: ${errorData.error?.message || 'Forbidden'}`);
      } else if (response.status === 404) {
        throw new Error(`Spreadsheet tidak ditemukan (404). SOLUSI:
1. Periksa Spreadsheet ID: ${cleanSpreadsheetId}
2. Pastikan spreadsheet masih ada dan tidak dihapus
3. Periksa nama sheet: "${config.sheetName}"
4. Pastikan sheet dengan nama tersebut ada di spreadsheet

Error detail: ${errorData.error?.message || 'Not Found'}`);
      } else if (response.status === 400) {
        throw new Error(`Request tidak valid (400). SOLUSI:
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
    apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'not provided'
  });
  
  // Validate inputs
  if (!spreadsheetId) {
    return { success: false, message: 'Spreadsheet ID harus diisi' };
  }
  
  // Ensure spreadsheetId is just the ID, not a URL
  const cleanSpreadsheetId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  
  // For read operations, we can still use API key
  const url = apiKey 
    ? `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}?key=${apiKey}`
    : `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}`;
  
  console.log('Test URL:', url);
  
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  
  // Add authorization header if we have OAuth token
  if (hasValidToken()) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  try {
    const response = await fetch(url, { headers });
    
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
      
      const authStatus = hasValidToken() ? '✅ OAuth authenticated' : '⚠️ Read-only (API Key)';
      
      return { 
        success: true, 
        message: `✅ Koneksi berhasil! 
Spreadsheet: "${data.properties?.title || 'Unknown'}"
Sheets tersedia: ${sheetNames.join(', ')}
${targetSheet ? `Target sheet "${targetSheet}" ✓` : ''}
Auth status: ${authStatus}
Spreadsheet ID: ${cleanSpreadsheetId}

${!hasValidToken() ? '\n⚠️ CATATAN: Untuk mengirim data, diperlukan OAuth authentication atau metode alternatif.' : ''}` 
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
          message: `❌ Akses tidak valid (401)

SOLUSI untuk READ access:
1. Pastikan API Key valid: ${apiKey ? apiKey.substring(0, 10) + '...' : 'tidak ada'}
2. Buka Google Cloud Console
3. Aktifkan Google Sheets API
4. Buat API Key baru jika perlu

SOLUSI untuk WRITE access:
1. Implementasi OAuth2 authentication
2. Atau gunakan Google Apps Script sebagai proxy
3. Atau copy-paste manual dari preview table` 
        };
      } else if (response.status === 403) {
        return { 
          success: false, 
          message: `❌ Akses ditolak (403)
SOLUSI:
1. Buka spreadsheet di Google Sheets
2. Klik "Share" → "General access" → "Anyone with the link"
3. Set permission ke "Viewer" (untuk read) atau "Editor" (untuk write)
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
  
  const url = apiKey 
    ? `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}?key=${apiKey}`
    : `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  
  if (hasValidToken()) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  try {
    const response = await fetch(url, { headers });
    
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

// Export data as CSV for manual copy-paste
export const exportAsCSV = (data: string[][]): string => {
  return data.map(row => 
    row.map(cell => 
      // Escape cells that contain commas, quotes, or newlines
      cell.includes(',') || cell.includes('"') || cell.includes('\n') 
        ? `"${cell.replace(/"/g, '""')}"` 
        : cell
    ).join(',')
  ).join('\n');
};

// Copy data to clipboard
export const copyToClipboard = async (data: string[][]): Promise<void> => {
  const csvData = exportAsCSV(data);
  try {
    await navigator.clipboard.writeText(csvData);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = csvData;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};