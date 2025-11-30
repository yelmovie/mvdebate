// 간단한 비속어/욕설 필터링 유틸리티
// 실제 서비스에서는 더 정교한 라이브러리나 API를 사용하는 것이 좋습니다.

const BAD_WORDS = [
  "시발", "씨발", "병신", "개새끼", "지랄", "존나", "졸라", "미친",
  "새끼", "닥쳐", "꺼져", "죽어", "쓰레기", "놈", "년",
  "섹스", "성관계", "야동", "자위", "강간", "변태", "콘돔", "페니스", "질",
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
