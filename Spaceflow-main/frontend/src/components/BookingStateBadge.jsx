import React from 'react';

const STATE_CONFIG = {
  pending: {
    label: 'Pending Authorization',
    styles: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  approved: {
    label: 'Authorized',
    styles: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  },
  checked_in: {
    label: 'Active Session',
    styles: 'bg-primary/10 text-primary border-primary/20 animate-pulse'
  },
  completed: {
    label: 'Utilized',
    styles: 'bg-muted text-muted-foreground border-border/40'
  },
  rejected: {
    label: 'Access Denied',
    styles: 'bg-red-500/10 text-red-500 border-red-500/20'
  },
  cancelled: {
    label: 'Terminated',
    styles: 'bg-muted/50 text-muted-foreground/60 border-border/20'
  },
  no_show: {
    label: 'Breach / No-Show',
    styles: 'bg-destructive/10 text-destructive border-destructive/20'
  },
  no_show_warning: {
    label: 'Warning / Late',
    styles: 'bg-amber-600/10 text-amber-600 border-amber-600/20'
  }
};

export default function BookingStateBadge({ state }) {
  const config = STATE_CONFIG[state] || {
    label: state,
    styles: 'bg-muted text-muted-foreground'
  };

  return (
    <span className={`sf-badge ${config.styles} shadow-inner`}>
      {config.label}
    </span>
  );
}
