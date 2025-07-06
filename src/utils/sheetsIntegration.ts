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
  
  // Clean the range to ensure proper formatting
  const cleanRange = encodeURIComponent(range);
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${cleanRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${apiKey}`;
  
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
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('API Key tidak valid atau tidak memiliki akses ke spreadsheet ini. Pastikan:\n1. API Key benar\n2. Google Sheets API sudah diaktifkan\n3. Spreadsheet dibagikan ke publik atau ke service account');
      } else if (response.status === 403) {
        throw new Error('Akses ditolak. Pastikan spreadsheet dibagikan dengan akses edit atau API Key memiliki permission yang tepat');
      } else if (response.status === 404) {
        throw new Error('Spreadsheet atau sheet tidak ditemukan. Periksa Spreadsheet ID dan nama sheet');
      } else {
        throw new Error(errorData.error?.message || `HTTP Error ${response.status}: ${response.statusText}`);
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
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;
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
      return { 
        success: true, 
        message: `Koneksi berhasil! Spreadsheet "${data.properties?.title || 'Unknown'}" dapat diakses.` 
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
        return { success: false, message: 'API Key tidak valid atau expired' };
      } else if (response.status === 403) {
        return { success: false, message: 'Akses ditolak - periksa permission spreadsheet' };
      } else if (response.status === 404) {
        return { success: false, message: 'Spreadsheet tidak ditemukan - periksa Spreadsheet ID' };
      } else {
        return { 
          success: false, 
          message: `Error: ${response.status} - ${errorData.error?.message || response.statusText}` 
        };
      }
    }
  } catch (error) {
    console.error('Test connection error:', error);
    return { success: false, message: 'Tidak dapat terhubung ke Google Sheets API' };
  }
};

export const getSheetsList = async (config: SheetsConfig): Promise<SheetInfo[]> => {
  const { spreadsheetId, apiKey } = config;
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;
  
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