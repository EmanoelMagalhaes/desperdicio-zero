import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import SectionTitle from '../common/SectionTitle';

const defaultForm = {
  name: '',
  amount: '',
  priority: 'Media',
};

export default function ShoppingSection({ list, onAdd, onToggle, onDelete, readOnly = false }) {
  const [form, setForm] = useState(defaultForm);

  function handleSubmit() {
    if (!form.name || !form.amount || readOnly) return;
    onAdd({ ...form, checked: false });
    setForm(defaultForm);
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Lista de compras"
        title="Planeje reposicao sem perder o controle"
        text="Evite compras duplicadas, acompanhe prioridades e mantenha historico de execucao."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-xl font-bold">Adicionar item</div>
          <div className="mt-4 space-y-4">
            <input
              disabled={readOnly}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
              placeholder="Produto"
            />
            <input
              disabled={readOnly}
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
              placeholder="Quantidade necessaria"
            />
            <select
              disabled={readOnly}
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400 disabled:opacity-50"
            >
              <option>Alta</option>
              <option>Media</option>
              <option>Baixa</option>
            </select>
            <button
              disabled={readOnly}
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Adicionar a lista
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xl font-bold">Itens de compra</div>
              <div className="text-sm text-white/55">Acompanhe o que ja foi resolvido.</div>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              {list.filter((item) => item.checked).length} concluidos
            </div>
          </div>

          <div className="space-y-3">
            {list.length ? (
              list.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <button
                      disabled={readOnly}
                      onClick={() => onToggle(item.id)}
                      className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                        item.checked ? 'border-emerald-400 bg-emerald-500 text-neutral-950' : 'border-white/20'
                      } disabled:opacity-50`}
                    >
                      {item.checked ? <CheckCircle2 size={14} /> : null}
                    </button>

                    <div>
                      <div className={`font-semibold ${item.checked ? 'text-white/45 line-through' : ''}`}>
                        {item.name}
                      </div>
                      <div className="text-sm text-white/55">{item.amount}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        item.priority === 'Alta'
                          ? 'bg-red-500/15 text-red-200'
                          : item.priority === 'Media'
                            ? 'bg-amber-500/15 text-amber-200'
                            : 'bg-sky-500/15 text-sky-200'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <button
                      disabled={readOnly}
                      onClick={() => onDelete(item.id)}
                      className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.05] disabled:opacity-40"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-neutral-900 p-5 text-white/55">
                Nenhum item na lista de compras.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}