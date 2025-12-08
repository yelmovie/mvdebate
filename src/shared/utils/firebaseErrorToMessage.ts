import { FirebaseError } from "firebase/app";

export function firebaseErrorToMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/invalid-email':
        return '이메일 형식이 올바르지 않습니다.';
      case 'auth/weak-password':
        return '비밀번호는 6자 이상이어야 합니다.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return '이메일 또는 비밀번호가 올바르지 않습니다.';
      case 'auth/too-many-requests':
        return '로그인/회원가입 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.';
      case 'auth/network-request-failed':
        return '네트워크 연결을 확인해 주세요.';
      default:
        return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
}
