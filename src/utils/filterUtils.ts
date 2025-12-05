// 간단한 비속어/욕설 필터링 유틸리티
// 실제 서비스에서는 더 정교한 라이브러리나 API를 사용하는 것이 좋습니다.

const BAD_WORDS = [
  "시발", "씨발", "병신", "개새끼", "지랄", "존나", "졸라", "미친",
  "새끼", "닥쳐", "꺼져", "죽어", "쓰레기",
  "섹스", "성관계", "야동", "강간", "변태", "페니스",
  "바보", "멍청이", "호구", "찐따" // 초등학생 대상이므로 가벼운 비속어도 포함
];

export function containsBadWords(text: string): boolean {
  if (!text) return false;
  return BAD_WORDS.some(word => text.includes(word));
}

export function filterBadWords(text: string): string {
  if (!text) return "";
  let filteredText = text;
  BAD_WORDS.forEach(word => {
    const mask = "*".repeat(word.length);
    filteredText = filteredText.replaceAll(word, mask);
  });
  return filteredText;
}

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
  feedbackForStudent?: string;
  flaggedWords?: string[];
}

export async function checkContentSafety(text: string): Promise<SafetyCheckResult> {
  if (!text || !text.trim()) {
    return { allowed: true };
  }

  try {
    const response = await fetch("/api/safety-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Safety check failed: ${response.status}`);
    }

    const result = await response.json();
    return result as SafetyCheckResult;
  } catch (error) {
    console.error("Safety check error:", error);
    // Fail-open: If check fails, allow the content but log error
    // Or we could fall back to local bad word check
    const hasBadWords = containsBadWords(text);
    if (hasBadWords) {
      return {
        allowed: false,
        feedbackForStudent: "비속어나 부적절한 단어가 포함되어 있을 수 있어요. 바르고 고운 말을 사용해주세요.",
        flaggedWords: []
      };
    }
    
    return { allowed: true };
  }
}
