export const passwordResetErrors: Record<string, string> = {
  "auth/user-not-found": "해당 이메일로 가입된 계정을 찾을 수 없어요. 이메일을 다시 확인해 주세요.",
  "auth/invalid-email": "이메일 형식이 올바르지 않아요. 다시 입력해 주세요.",
  "auth/missing-email": "이메일을 입력해 주세요.",
  "auth/too-many-requests": "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.",
  "auth/network-request-failed": "네트워크 연결에 문제가 있어요. 인터넷 상태를 확인해 주세요.",
  "auth/internal-error": "알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
  default: "문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
};
