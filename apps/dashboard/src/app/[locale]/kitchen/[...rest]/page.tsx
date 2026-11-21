import { notFound } from 'next/navigation';

// Addresses in the panel without a page (nav items built by later tasks): the panel's not-found, inside the shell.
export default function Unknown() {
  notFound();
}
