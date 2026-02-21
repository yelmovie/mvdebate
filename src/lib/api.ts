/**
 * Supabase Edge Function API 헬퍼
 *
 * 환경변수 (필수):
 *   VITE_SUPABASE_URL      = https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY = eyJ...
 *
 * 선택:
 *   VITE_EDGE_FN_NAME      = make-server-xxxx (기본값 사용)
 */
import { supabase } from './supabaseClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const edgeFnName = (import.meta.env.VITE_EDGE_FN_NAME as string) || 'make-server-7273e82a';

export const API_BASE_URL = `${supabaseUrl}/functions/v1/${edgeFnName}`;

/** 인증 불필요 엔드포인트 (anon key만 사용) */
export async function publicApiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      ...options.headers,
    },
  });

  const text = await res.text();
  const data = parseJson(text, endpoint);

  if (!res.ok) {
    throw new Error(data?.error || `publicApiCall failed: ${endpoint} (${res.status})`);
  }
  return data;
}

/** 인증 필요 엔드포인트 (세션 토큰 사용) */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('인증 세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const text = await res.text();
  const data = parseJson(text, endpoint);

  if (!res.ok) {
    if (res.status === 401) throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    throw new Error(data?.error || `apiCall failed: ${endpoint} (${res.status})`);
  }
  return data;
}

function parseJson(text: string, endpoint: string): any {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`응답 파싱 실패 (${endpoint}): ${text.substring(0, 100)}`);
  }
}
