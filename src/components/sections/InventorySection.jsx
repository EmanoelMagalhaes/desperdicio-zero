import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, Package, Plus, Trash2 } from 'lucide-react';
import MetricCard from '../common/MetricCard';
import SectionTitle from '../common/SectionTitle';
import { addDays, daysUntil, statusFromExpiry } from '../../utils/date';

const defaultForm = {
  name: '',
  category: 'Hortifruti',
  quantity: '',
  unit: 'un',
  expiryDate: addDays(3),
  notes: '',
};

const defaultCategories = ['Hortifruti', 'Laticinios', 'Padaria', 'Bebidas', 'Congelados', 'Secos', 'Outros'];
const unitOptions = ['un', 'kg', 'g', 'l', 'ml', 'pacote', 'caixa'];

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message.trim()) return error.message;
  return fallback;
}

export default function InventorySection({ items, onAdd, onDelete, readOnly = false, limitReached = false }) {
  const [form, setForm] = useState(defaultForm);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const normalizedItems = useMemo(
    () =>
      (items || []).map((item) => {
        const expiryDate = item.expiryDate || item.expiry || '';
        const status = statusFromExpiry(expiryDate);
        return { ...item, expiryDate, status };
      }),
    [items]
  );

  const categories = useMemo(() => {
    const fromItems = Array.from(new Set(normalizedItems.map((item) => item.category).filter(Boolean)));
    const merged = [...defaultCategories];
    fromItems.forEach((cat) => {
      if (!merged.includes(cat)) merged.push(cat);
    });
    return merged;
  }, [normalizedItems]);

  const summary = useMemo(() => {
    const attention = normalizedItems.filter((item) => item.status.status === 'attention').length;
    const critical = normalizedItems.filter((item) => item.status.status === 'critical').length;
    const expired = normalizedItems.filter((item) => item.status.status === 'expired').length;
    return { attention, critical, expired };
  }, [normalizedItems]);

  const filteredItems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return normalizedItems
      .filter((item) => {
        if (!searchText) return true;
        return item.name?.toLowerCase().includes(searchText);
      })
      .filter((item) => (categoryFilter === 'all' ? true : item.category === categoryFilter))
      .filter((item) => (statusFilter === 'all' ? true : item.status.status === statusFilter))
      .sort((a, b) => {
        const aDiff = daysUntil(a.expiryDate || '');
        const bDiff = daysUntil(b.expiryDate || '');
        return aDiff - bDiff;
      });
  }, [normalizedItems, search, categoryFilter, statusFilter]);

  function formatDate(value) {
    if (!value) return 'Sem validade';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('pt-BR');
  }

  async function handleSubmit() {
    if (readOnly) return;

    if (limitReached) {
      setFeedback({ type: 'error', text: 'Limite do plano gratuito atingido. Atualize para continuar.' });
      return;
    }

    if (!form.name || !form.quantity || !form.unit || !form.expiryDate) {
      setFeedback({ type: 'error', text: 'Preencha nome, quantidade, unidade e validade.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: '', text: '' });
      const payload = {
        ...form,
        expiry: form.expiryDate,
        expiryDate: form.expiryDate,
      };
      await onAdd(payload);
      setForm({ ...defaultForm, expiryDate: addDays(3) });
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
        title="Despensa inteligente com prioridades"
        text="Cadastre itens, acompanhe validade e priorize o que precisa sair primeiro."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
              <Plus size={18} />
            </div>
            <div>
              <div className="text-xl font-bold">Cadastrar produto</div>
              <div className="text-sm text-white/55">Controle simples com prioridade por validade.</div>
            </div>
          </div>

          <div className="space-y-4">
            <input
              disabled={readOnly || limitReached}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
              placeholder="Nome do produto"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                disabled={readOnly || limitReached}
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400 disabled:opacity-50"
              >
                {defaultCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <input
                disabled={readOnly || limitReached}
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
                placeholder="Quantidade"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <select
                disabled={readOnly || limitReached}
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400 disabled:opacity-50"
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              <input
                disabled={readOnly || limitReached}
                type="date"
                value={form.expiryDate}
                onChange={(event) => setForm({ ...form, expiryDate: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400 disabled:opacity-50"
              />
            </div>

            <textarea
              disabled={readOnly || limitReached}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
              placeholder="Observacoes ou acao recomendada"
            />

            <button
              disabled={readOnly || submitting || limitReached}
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
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Produtos cadastrados" value={String(items.length)} icon={Package} tone="emerald" />
            <MetricCard label="Em atencao" value={String(summary.attention)} icon={AlertTriangle} tone="amber" />
            <MetricCard label="Criticos" value={String(summary.critical)} icon={AlertTriangle} tone="red" />
            <MetricCard label="Vencidos" value={String(summary.expired)} icon={CalendarClock} tone="red" />
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5">
              <div className="text-xl font-bold">Produtos cadastrados</div>
              <div className="text-sm text-white/55">Ordenados por validade para facilitar a acao.</div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                placeholder="Buscar produto"
              />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              >
                <option value="all">Todos os status</option>
                <option value="ok">Ok</option>
                <option value="attention">Atencao</option>
                <option value="critical">Critico</option>
                <option value="expired">Vencido</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredItems.length ? (
                filteredItems.map((item) => {
                  const status = item.status;
                  const quantityLabel = item.unit ? `${item.quantity} ${item.unit}` : item.quantity;

                  return (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-lg font-semibold">{item.name}</div>
                          <div className="mt-1 text-sm text-white/60">
                            {item.category} - {quantityLabel}
                          </div>
                          <div className="mt-2 text-xs text-white/50">Validade: {formatDate(item.expiryDate)}</div>
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
                  Nenhum item encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
