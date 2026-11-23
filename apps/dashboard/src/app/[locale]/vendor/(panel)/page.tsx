import { redirect } from '@/i18n/navigation';

// The vendor panel opens on its orders (ORD-DSH-1); the live board of 135:39184 (VOP-DSH-1) extends that page in Sprint 4.
export default async function VendorHome({ params }: { params: Promise<{ locale: string }> }) {
  redirect({ href: '/vendor/orders', locale: (await params).locale });
}
