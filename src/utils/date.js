export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export function statusFromExpiry(dateStr) {
  const diff = daysUntil(dateStr);

  if (diff < 0) {
    return { label: 'Vencido', tone: 'text-red-300 bg-red-500/15 border-red-500/20' };
  }

  if (diff === 0) {
    return { label: 'Vence hoje', tone: 'text-red-200 bg-red-500/15 border-red-500/20' };
  }

  if (diff <= 2) {
    return {
      label: `Vence em ${diff} dia${diff > 1 ? 's' : ''}`,
      tone: 'text-amber-200 bg-amber-500/15 border-amber-500/20',
    };
  }

  if (diff <= 5) {
    return { label: `Atencao em ${diff} dias`, tone: 'text-yellow-200 bg-yellow-500/15 border-yellow-500/20' };
  }

  return { label: 'Estavel', tone: 'text-emerald-200 bg-emerald-500/15 border-emerald-500/20' };
}