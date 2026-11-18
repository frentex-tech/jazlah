// Figma DS «Page header» (16:1252): breadcrumb + H1 on the start side, actions on the end side.
export function PageHeader({ breadcrumb, title, actions }: { breadcrumb: string; title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between gap-s16">
      <div className="flex flex-col gap-s4">
        <p className="text-body-m text-ink-2">{breadcrumb}</p>
        <h1 className="text-h1 text-ink">{title}</h1>
      </div>
      {actions ? <div className="flex items-start gap-s12">{actions}</div> : null}
    </div>
  );
}
