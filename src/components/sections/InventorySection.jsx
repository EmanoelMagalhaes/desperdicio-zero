import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, Package, Plus, Trash2 } from 'lucide-react';
import MetricCard from '../common/MetricCard';
import SectionTitle from '../common/SectionTitle';
import { addDays, daysUntil, statusFromExpiry } from '../../utils/date';

const defaultForm = {
  name: '',
  category: 'Hortifruti',
  quantity: '',
  expiry: addDays(3),
  notes: '',
};

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message.trim()) return error.message;
  return fallback;
}

export default function InventorySection({ items, onAdd, onDelete, readOnly = false }) {
  const [form, setForm] = useState(defaultForm);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const summary = useMemo(() => {
    const critical = items.filter((item) => daysUntil(item.expiry) <= 2).length;
    const expired = items.filter((item) => daysUntil(item.expiry) < 0).length;
    return { critical, expired };
  }, [items]);

  async function handleSubmit() {
    if (readOnly) return;

    if (!form.name || !form.quantity || !form.expiry) {
      setFeedback({ type: 'error', text: 'Preencha nome, quantidade e validade.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: '', text: '' });
      await onAdd(form);
      setForm({ ...defaultForm, expiry: addDays(3) });
      setFeedback({ type: 'success', text: 'Produto salvo com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorMessage(error, 'Nao foi possivel salvar o produto agora.') });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (readOnly) return;

    try {
      setDeletingId(id);
      setFeedback({ type: '', text: '' });
      await onDelete(id);
      setFeedback({ type: 'success', text: 'Produto removido com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorMessage(error, 'Nao foi possivel remover o produto agora.') });
    } finally {
      setDeletingId('');
    }
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Minha despensa"
        title="Controle seus produtos com historico"
        text="Cadastre itens, acompanhe validade e mantenha a base salva para o proximo acesso."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
              <Plus size={18} />
            </div>
            <div>
              <div className="text-xl font-bold">Cadastrar produto</div>
              <div className="text-sm text-white/55">Dados armazenados no navegador.</div>
            </div>
          </div>

          <div className="space-y-4">
            <input
              disabled={readOnly}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
              placeholder="Nome do produto"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                disabled={readOnly}
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400 disabled:opacity-50"
              >
                <option>Hortifruti</option>
                <option>Laticinios</option>
                <option>Padaria</option>
                <option>Bebidas</option>
                <option>Congelados</option>
                <option>Secos</option>
              </select>
              <input
                disabled={readOnly}
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
                placeholder="Quantidade"
              />
            </div>

            <input
              disabled={readOnly}
              type="date"
              value={form.expiry}
              onChange={(event) => setForm({ ...form, expiry: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400 disabled:opacity-50"
            />

            <textarea
              disabled={readOnly}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
              placeholder="Observacoes ou acao recomendada"
            />

            <button
              disabled={readOnly || submitting}
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Salvar produto'}
            </button>

            {feedback.text ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  feedback.type === 'error'
                    ? 'border border-amber-500/20 bg-amber-500/10 text-amber-100'
                    : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                }`}
              >
                {feedback.text}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Produtos cadastrados" value={String(items.length)} icon={Package} tone="emerald" />
            <MetricCard label="Itens criticos" value={String(summary.critical)} icon={AlertTriangle} tone="amber" />
            <MetricCard label="Itens vencidos" value={String(summary.expired)} icon={CalendarClock} tone="red" />
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5">
              <div className="text-xl font-bold">Produtos cadastrados</div>
              <div className="text-sm text-white/55">Visao operacional da despensa.</div>
            </div>

            <div className="space-y-3">
              {items.length ? (
                items.map((item) => {
                  const status = statusFromExpiry(item.expiry);

                  return (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-lg font-semibold">{item.name}</div>
                          <div className="mt-1 text-sm text-white/60">
                            {item.category} - {item.quantity}
                          </div>
                          <div className="mt-3 text-sm text-white/72">{item.notes || 'Sem observacoes.'}</div>
                        </div>

                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <span className={`rounded-full border px-3 py-1 text-xs ${status.tone}`}>{status.label}</span>
                          <button
                            disabled={readOnly || deletingId === item.id}
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                            {deletingId === item.id ? 'Removendo...' : 'Remover'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-neutral-900 p-5 text-white/55">
                  Nenhum item cadastrado ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
