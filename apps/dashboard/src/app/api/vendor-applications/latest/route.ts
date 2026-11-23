import type { NextRequest } from 'next/server';
import { onboardingBackend } from '@/features/vendor-onboarding/backend';
import { withPanelSession } from '@/lib/auth/panel-session';
import { langOf } from '@/lib/route';

export function GET(req: NextRequest) {
  return withPanelSession(req, 'customer', (token) => onboardingBackend().latestApplication(token, langOf(req)));
}
