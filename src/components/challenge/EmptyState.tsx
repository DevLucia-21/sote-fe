import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="mb-6">{icon}</div>}
      <h3 className="mb-2" style={{ color: '#4A3228' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm" style={{ color: '#4A3228', opacity: 0.6 }}>
          {description}
        </p>
      )}
    </div>
  );
}
