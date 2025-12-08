export const TRIAL_END_DATE_STR = process.env.NEXT_PUBLIC_TRIAL_END_DATE || "2025-12-31T23:59:59+09:00";

export function isTrialActive(): boolean {
  const now = new Date();
  const endDate = new Date(TRIAL_END_DATE_STR);
  return now < endDate;
}

export function getTrialDaysLeft(): number {
  if (!isTrialActive()) return 0;
  const now = new Date();
  const endDate = new Date(TRIAL_END_DATE_STR);
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
