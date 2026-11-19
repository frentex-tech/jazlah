import { notFound } from 'next/navigation';

// Any other address: the localised not-found page instead of Next's English default.
export default function Unknown() {
  notFound();
}
