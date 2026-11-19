import { notFound } from 'next/navigation';

// The vendor application (VND-DSH-1) is open to visitors, so it sits outside the staff shell in (panel). Until it is
// built: the plain localised not-found, not the shell's.
export default function NotBuilt() {
  notFound();
}
