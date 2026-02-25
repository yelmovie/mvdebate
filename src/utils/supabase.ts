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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Invalid JSON response');
  }

  if (!response.ok) {
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

  if (!token) {
    throw new Error('인증 세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (response.status === 404) {
      throw new Error(`엔드포인트를 찾을 수 없습니다: ${endpoint}`);
    }
    throw new Error('잘못된 응답 형식');
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}
