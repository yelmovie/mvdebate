/**
 * 메시지 라벨 분류 유틸리티
 */

import type { DebateLabel } from '../types/domain';

/**
 * 메시지 텍스트를 분석하여 라벨을 분류합니다.
 * 실제로는 AI가 분류하지만, 기본적인 키워드 기반 분류도 제공합니다.
 */
export function classifyMessage(text: string, context?: string): DebateLabel {
  const lowerText = text.toLowerCase();

  // 주장 키워드
  const claimKeywords = ['생각해', '믿어', '옳아', '맞아', '해야', '되어야', '필요해'];
  if (claimKeywords.some((keyword) => lowerText.includes(keyword))) {
    return 'claim';
  }

  // 근거 키워드
  const reasonKeywords = ['왜냐하면', '이유는', '때문에', '그래서', '그러므로'];
  if (reasonKeywords.some((keyword) => lowerText.includes(keyword))) {
    return 'reason';
  }

  // 자료 키워드
  const evidenceKeywords = ['예를 들어', '예시로', '경험상', '사실', '통계', '조사'];
  if (evidenceKeywords.some((keyword) => lowerText.includes(keyword))) {
    return 'evidence';
  }

  // 반론 키워드
  const counterKeywords = ['하지만', '그러나', '반대로', '다른 의견', '반대'];
  if (counterKeywords.some((keyword) => lowerText.includes(keyword))) {
    return 'counterargument';
  }

  // 재반박 키워드
  const rebuttalKeywords = ['그럼에도', '그래도', '하지만', '그렇지만', '답변'];
  if (rebuttalKeywords.some((keyword) => lowerText.includes(keyword))) {
    return 'rebuttal';
  }

  // 컨텍스트 기반 분류
  if (context) {
    if (context.includes('주장')) return 'claim';
    if (context.includes('근거')) return 'reason';
    if (context.includes('자료')) return 'evidence';
    if (context.includes('반론')) return 'counterargument';
    if (context.includes('재반박')) return 'rebuttal';
  }

  return 'other';
}

/**
 * 라벨에 따른 한글 이름 반환
 */
export function getLabelName(label: DebateLabel): string {
  const labelNames: Record<DebateLabel, string> = {
    claim: '주장',
    reason: '근거',
    evidence: '자료',
    counterargument: '반론',
    rebuttal: '재반박',
    other: '기타',
  };
  return labelNames[label];
}

/**
 * 라벨에 따른 색상 반환
 */
export function getLabelColor(label: DebateLabel): string {
  const labelColors: Record<DebateLabel, string> = {
    claim: '#3B82F6', // 파란색
    reason: '#10B981', // 초록색
    evidence: '#F59E0B', // 주황색
    counterargument: '#EF4444', // 빨간색
    rebuttal: '#8B5CF6', // 보라색
    other: '#6B7280', // 회색
  };
  return labelColors[label];
}

