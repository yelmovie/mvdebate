/**
 * Shared Constants
 * One Source of Truth for magic numbers and strings.
 */

export const DEBATE_CONFIG = {
  MAX_TURNS: 20,
  MAX_INPUT_CHARS: 100,
  WARNING_TURNS: 18, // Warn user when approaching max turns
};

export const DEBATE_PHASES = {
  NORMAL: "normal",
  CLOSING_WARNING: "closing-warning",
  CLOSING_FINAL: "closing-final",
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "네트워크 오류: 서버에 연결할 수 없습니다.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
  API_KEY_MISSING: "API Key is missing.",
  EMPTY_RESPONSE: "AI returned an empty response.",
  INVALID_INPUT: "입력값이 올바르지 않습니다.",
  SESSION_NOT_FOUND: "토론 세션을 찾을 수 없습니다.",
};

export const UI_TEXT = {
  END_DEBATE_MOBILE: "토론이 종료되었습니다. 아래 평가·보고서 영역에서 결과를 확인하고 PDF로 저장할 수 있습니다.",
  END_DEBATE_DESKTOP: "토론이 종료되었습니다. 오른쪽 패널에서 평가를 확인하고 PDF로 저장할 수 있습니다.",
  INPUT_PLACEHOLDER: "AI에게 말하고 싶은 내용을 적어 보세요. (Enter: 전송, Shift+Enter: 줄바꿈)",
  SEND_BUTTON: "보내기",
  END_BUTTON: "종료",
  RESTART_BUTTON: "다시",
};
