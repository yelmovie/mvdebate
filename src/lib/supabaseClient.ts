/**
 * Supabase 클라이언트 싱글턴
 * 프로젝트 전체에서 이 파일 하나만 import해서 사용한다.
 *
 * 환경변수 (필수):
 *   VITE_SUPABASE_URL      = https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY = eyJ...
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabaseClient] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.\n' +
    '.env 파일을 확인하세요.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
