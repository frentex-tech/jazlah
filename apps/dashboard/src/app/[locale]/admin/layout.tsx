import { setRequestLocale } from 'next-intl/server';
import { Shell } from '@/components/shell/shell';
import { getStaffName } from '@/lib/staff';

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return (
    <Shell panel="admin" userName={await getStaffName('admin')}>
      {children}
    </Shell>
  );
}
