import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Ensure only one instance exists by checking if one already exists in window
declare global {
  interface Window {
    __supabaseClient?: any;
  }
}

// Create a singleton Supabase client instance
let supabaseInstance: any;

if (typeof window !== 'undefined') {
  if (!window.__supabaseClient) {
    window.__supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  supabaseInstance = window.__supabaseClient;
} else {
  // Server-side fallback (though this shouldn't happen in browser apps)
  supabaseInstance = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );
}

export const supabase = supabaseInstance;

export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7273e82a`;

// Public API call (no auth required)
export async function publicApiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  console.log('Public API Call:', {
    endpoint,
    method: options.method || 'GET'
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  console.log('Public API Response:', {
    endpoint,
    status: response.status,
    ok: response.ok
  });

  // Get response text first
  const text = await response.text();
  
  // Try to parse as JSON
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error('Failed to parse JSON response:', text);
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    console.error('Public API Error:', {
      endpoint,
      status: response.status,
      error: data.error,
      data
    });
    
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  console.log('API Call:', {
    endpoint,
    fullUrl,
    hasSession: !!session.data.session,
    hasToken: !!token,
    method: options.method || 'GET'
  });

  if (!token) {
    console.error('No access token available. Session:', session.data.session);
    throw new Error('인증 세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  console.log('API Response:', {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    url: `${API_BASE_URL}${endpoint}`
  });

  // Get response text first
  const text = await response.text();
  
  console.log('Response details:', {
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get('content-type'),
    textPreview: text.substring(0, 200)
  });
  
  // Try to parse as JSON
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    // If it's a 404, provide better error context
    if (response.status === 404) {
      console.error('Endpoint not found:', {
        endpoint,
        fullUrl,
        status: 404
      });
      throw new Error(`엔드포인트를 찾을 수 없습니다: ${endpoint}`);
    }
    
    console.error('Failed to parse JSON response:', text);
    throw new Error(`잘못된 응답 형식: ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    console.error('API Error:', {
      endpoint,
      status: response.status,
      error: data.error,
      data
    });
    
    if (response.status === 401) {
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    throw new Error(data.error || 'Request failed');
  }

  return data;
}
