import React from 'react';

export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-border bg-surface p-4 sm:p-5 ${className}`}>{children}</div>
  );
}

export function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <p
      className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
      style={{ color: color ?? 'var(--color-muted)' }}
    >
      {children}
    </p>
  );
}

export function StatCard({
  label,
  value,
  color = 'var(--color-gold)',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="border border-border bg-surface p-3">
      <p
        className="font-mono text-[9px] tracking-[0.15em] uppercase mb-1"
        style={{ color }}
      >
        {label}
      </p>
      <p className="text-text text-xl font-bold">{value}</p>
    </div>
  );
}
