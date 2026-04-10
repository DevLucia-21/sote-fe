import api from '../../services/api';

export type ResolvedChallenge = {
  challengeId: number | null;
  content: string | null;
  emotionType: string | null;
  category: string | null;
  recommended: boolean;
  completed?: boolean;
  reward?: any;
};

export function normalizeTodayResponse(data: any): ResolvedChallenge {
  return {
    challengeId: data?.id ?? null,
    content: data?.content ?? null,
    emotionType: data?.emotionType ?? null,
    category: data?.category ?? null,
    recommended: true,
    completed: false,
    reward: null,
  };
}

export function normalizeStatusResponse(data: any): ResolvedChallenge {
  return {
    challengeId: data?.challengeId ?? null,
    content: data?.content ?? null,
    emotionType: data?.emotionType ?? null,
    category: data?.category ?? null,
    recommended: !!data?.recommended,
    completed: !!data?.completed,
    reward: data?.reward ?? null,
  };
}

export function hasResolvedChallenge(challenge: ResolvedChallenge | null | undefined) {
  return Boolean(
    challenge?.challengeId &&
    challenge?.content &&
    challenge?.emotionType &&
    challenge?.category
  );
}

export async function fetchChallengeToday(): Promise<ResolvedChallenge> {
  const res = await api.get('/api/challenge/today');
  const normalized = normalizeTodayResponse(res.data);
  console.log('🎯 [challenge/today]', normalized);
  return normalized;
}

export async function fetchChallengeStatus(): Promise<ResolvedChallenge> {
  const res = await api.get('/api/challenge/status');
  const normalized = normalizeStatusResponse(res.data);
  console.log('📊 [challenge/status]', normalized);
  return normalized;
}

export async function resolveTodayChallengeFlow(): Promise<ResolvedChallenge | null> {
  const todayChallenge = await fetchChallengeToday();
  const statusChallenge = await fetchChallengeStatus();

  if (hasResolvedChallenge(statusChallenge)) {
    return statusChallenge;
  }

  return hasResolvedChallenge(todayChallenge) ? todayChallenge : null;
}

export async function resolveChallengeViewFlow(): Promise<ResolvedChallenge | null> {
  const statusChallenge = await fetchChallengeStatus();

  if (statusChallenge.recommended && hasResolvedChallenge(statusChallenge)) {
    return statusChallenge;
  }

  const todayChallenge = await fetchChallengeToday();
  const refreshedStatus = await fetchChallengeStatus();

  if (hasResolvedChallenge(refreshedStatus)) {
    return refreshedStatus;
  }

  return hasResolvedChallenge(todayChallenge) ? todayChallenge : null;
}
