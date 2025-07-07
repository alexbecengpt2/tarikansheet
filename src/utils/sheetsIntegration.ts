import { SheetsConfig, SheetInfo } from '../types';

export const sendToGoogleSheets = async (
  data: string[][],
  config: SheetsConfig
): Promise<void> => {
  const { spreadsheetId, apiKey, range } = config;
  
  console.log('Sending to Google Sheets:', {
    spreadsheetId,
    apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'not provided',
    range,
    dataRows: data.length
  });
  
  // Validate inputs
  if (!spreadsheetId || !range) {
    throw new Error('Missing required configuration: spreadsheetId or range');
  }
  
  // Check if API key is provided and valid
  if (!apiKey || !validateApiKey(apiKey)) {
    throw new Error(`API Key diperlukan untuk mengakses Google Sheets. Solusi:

1. Buka Google Cloud Console: https://console.cloud.google.com/
2. Buat atau pilih project
3. Aktifkan Google Sheets API
4. Buat API Key di "Credentials"
5. Copy API Key dan paste di konfigurasi

API Key harus dimulai dengan "AIza" dan memiliki panjang minimal 20 karakter.

Alternatif: Gunakan metode manual copy-paste dari preview table.`);
  }

  // Ensure spreadsheetId is just the ID, not a URL
  const cleanSpreadsheetId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  
  // Clean the range to ensure proper formatting
  const cleanRange = encodeURIComponent(range);
  
  // Always use API key for authentication
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
        throw new Error(`API Key tidak valid atau tidak memiliki akses (401). Solusi:

1. Pastikan API Key dimulai dengan "AIza"
2. Buka Google Cloud Console: https://console.cloud.google.com/
3. Pastikan Google Sheets API sudah diaktifkan
4. Periksa quota dan billing di Google Cloud Console
5. Buat API Key baru jika perlu
6. Pastikan tidak ada spasi di awal/akhir API Key

Current API Key: ${apiKey ? apiKey.substring(0, 15) + '...' : 'not provided'}

Error detail: ${errorData.error?.message || 'Unauthorized'}`);
      } else if (response.status === 403) {
        throw new Error(`Akses ditolak (403). Kemungkinan penyebab:

A. Spreadsheet tidak public:
1. Buka spreadsheet di Google Sheets
2. Klik tombol "Share" (Bagikan)
3. Ubah "General access" menjadi "Anyone with the link"
4. Set permission ke "Editor"

B. API Key restrictions:
5. Buka Google Cloud Console → Credentials
6. Edit API Key dan periksa "API restrictions"
7. Pastikan Google Sheets API diizinkan
8. Periksa "Application restrictions" jika ada

C. Quota exceeded:
9. Periksa quota usage di Google Cloud Console

Error detail: ${errorData.error?.message || 'Forbidden'}`);
      } else if (response.status === 404) {
        throw new Error(`Spreadsheet tidak ditemukan (404). Solusi:

1. Periksa Spreadsheet ID: ${cleanSpreadsheetId}
2. Pastikan spreadsheet masih ada dan tidak dihapus
3. Periksa nama sheet: "${config.sheetName}"
4. Pastikan sheet dengan nama tersebut ada di spreadsheet
5. Pastikan API Key memiliki akses ke spreadsheet ini

Error detail: ${errorData.error?.message || 'Not Found'}`);
      } else if (response.status === 400) {
        throw new Error(`Request tidak valid (400). Solusi:

1. Periksa format range: "${range}"
2. Pastikan nama sheet benar
3. Periksa format data yang dikirim
4. Pastikan tidak ada karakter khusus di nama sheet

Error detail: ${errorData.error?.message || 'Bad Request'}`);
      } else if (response.status === 429) {
        throw new Error(`Terlalu banyak request (429). Solusi:

1. Tunggu beberapa menit sebelum mencoba lagi
2. Periksa quota di Google Cloud Console
3. Upgrade billing account jika perlu
4. Kurangi frekuensi request

Error detail: ${errorData.error?.message || 'Too Many Requests'}`);
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
      throw new Error(`Tidak dapat terhubung ke Google Sheets API. Solusi:

1. Periksa koneksi internet Anda
2. Pastikan tidak ada firewall yang memblokir googleapis.com
3. Coba refresh halaman dan ulangi
4. Periksa status Google Sheets API: https://status.cloud.google.com/`);
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
  
  if (!apiKey) {
    return { 
      success: false, 
      message: `❌ API Key diperlukan untuk mengakses Google Sheets

Langkah-langkah mendapatkan API Key:
1. Buka: https://console.cloud.google.com/
2. Buat atau pilih project
3. Aktifkan Google Sheets API
4. Buka "Credentials" → "Create Credentials" → "API Key"
5. Copy API Key dan paste di sini

API Key harus dimulai dengan "AIza"` 
    };
  }
  
  if (!validateApiKey(apiKey)) {
    return { 
      success: false, 
      message: `❌ Format API Key tidak valid

API Key harus:
- Dimulai dengan "AIza"
- Memiliki panjang minimal 20 karakter
- Tidak mengandung spasi

Current: ${apiKey.substring(0, 10)}... (${apiKey.length} chars)` 
    };
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
          message: `❌ Sheet "${targetSheet}" tidak ditemukan

Sheet yang tersedia: ${sheetNames.join(', ')}

Solusi:
1. Pilih salah satu sheet yang tersedia
2. Atau buat sheet baru dengan nama "${targetSheet}"` 
        };
      }
      
      return { 
        success: true, 
        message: `✅ Koneksi berhasil!

📊 Spreadsheet: "${data.properties?.title || 'Unknown'}"
📋 Sheets tersedia: ${sheetNames.join(', ')}
${targetSheet ? `🎯 Target sheet "${targetSheet}" ✓` : ''}
🔑 API Key: ${apiKey.substring(0, 15)}...
📄 Spreadsheet ID: ${cleanSpreadsheetId}

Siap untuk mengirim data!` 
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

Kemungkinan penyebab:
1. API Key salah atau expired
2. Google Sheets API belum diaktifkan
3. Billing belum diaktifkan di Google Cloud

Solusi:
1. Buka: https://console.cloud.google.com/
2. Pilih project yang benar
3. Aktifkan Google Sheets API
4. Periksa billing status
5. Buat API Key baru jika perlu

Current API Key: ${apiKey.substring(0, 15)}...` 
        };
      } else if (response.status === 403) {
        return { 
          success: false, 
          message: `❌ Akses ditolak (403)

Kemungkinan penyebab:
A. Spreadsheet tidak public:
   1. Buka spreadsheet di Google Sheets
   2. Klik "Share" → "General access" → "Anyone with the link"
   3. Set permission ke "Editor"

B. API Key restrictions:
   4. Buka Google Cloud Console → Credentials
   5. Edit API Key dan periksa restrictions
   6. Pastikan Google Sheets API diizinkan

C. Quota exceeded:
   7. Periksa quota di Google Cloud Console

Spreadsheet ID: ${cleanSpreadsheetId}` 
        };
      } else if (response.status === 404) {
        return { 
          success: false, 
          message: `❌ Spreadsheet tidak ditemukan (404)

Periksa:
1. Spreadsheet ID: ${cleanSpreadsheetId}
2. Pastikan spreadsheet masih ada
3. Pastikan API Key memiliki akses
4. Coba buka spreadsheet manual di browser

Original input: ${spreadsheetId}

Jika spreadsheet ada tapi tidak bisa diakses, pastikan:
- Spreadsheet di-share sebagai "Anyone with the link"
- Permission minimal "Viewer" (recommended: "Editor")` 
        };
      } else if (response.status === 429) {
        return { 
          success: false, 
          message: `❌ Terlalu banyak request (429)

Solusi:
1. Tunggu 1-2 menit sebelum test lagi
2. Periksa quota di Google Cloud Console
3. Upgrade billing jika perlu

Spreadsheet ID: ${cleanSpreadsheetId}` 
        };
      } else {
        return { 
          success: false, 
          message: `❌ Error ${response.status}: ${errorData.error?.message || response.statusText}

Spreadsheet ID: ${cleanSpreadsheetId}
API Key: ${apiKey.substring(0, 15)}...

Coba:
1. Refresh halaman dan ulangi
2. Periksa status Google API: https://status.cloud.google.com/
3. Buat API Key baru jika masalah berlanjut` 
        };
      }
    }
  } catch (error) {
    console.error('Test connection error:', error);
    return { 
      success: false, 
      message: `❌ Tidak dapat terhubung ke Google Sheets API

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Solusi:
1. Periksa koneksi internet
2. Pastikan tidak ada firewall yang memblokir googleapis.com
3. Coba refresh halaman
4. Periksa status Google API: https://status.cloud.google.com/

Spreadsheet ID: ${cleanSpreadsheetId}` 
    };
  }
};

export const getSheetsList = async (config: SheetsConfig): Promise<SheetInfo[]> => {
  const { spreadsheetId, apiKey } = config;
  
  if (!apiKey || !validateApiKey(apiKey)) {
    console.warn('Cannot fetch sheets list without valid API key');
    return [];
  }
  
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
  // If it's already just an ID (no slashes), return it
  if (!input.includes('/')) {
    return input.length > 20 ? input : null;
  }
  
  // Extract from various Google Sheets URL formats
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/spreadsheets\/u\/\d+\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Helper function to validate API key format
export const validateApiKey = (apiKey: string): boolean => {
  return apiKey.startsWith('AIza') && apiKey.length > 20;
};