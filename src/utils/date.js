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
  if (!dateStr) {
    return { status: 'ok', label: 'Sem validade', tone: 'text-white/70 bg-white/5 border-white/10' };
  }

  const diff = daysUntil(dateStr);

  if (Number.isNaN(diff)) {
    return { status: 'ok', label: 'Sem validade', tone: 'text-white/70 bg-white/5 border-white/10' };
  }

  if (diff < 0) {
    return { status: 'expired', label: 'Vencido', tone: 'text-red-300 bg-red-500/15 border-red-500/20' };
  }

  if (diff <= 2) {
    return { status: 'critical', label: 'Critico', tone: 'text-amber-200 bg-amber-500/15 border-amber-500/20' };
  }

  if (diff <= 5) {
    return { status: 'attention', label: 'Atencao', tone: 'text-yellow-200 bg-yellow-500/15 border-yellow-500/20' };
  }

  return { status: 'ok', label: 'Ok', tone: 'text-emerald-200 bg-emerald-500/15 border-emerald-500/20' };
}
