import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { recipeSuggestions } from '../../services/kitchenService';

function levelLabel(level) {
  if (level === 'complete') return 'Receita completa';
  if (level === 'almost') return 'Quase completa';
  return 'Sugestao';
}

function profileLabel(profile) {
  if (profile === 'family') return 'Familia';
  if (profile === 'restaurant') return 'Restaurante';
  return 'Para todos';
}

export default function RecipesSection({ items, profile }) {
  const suggestions = recipeSuggestions(items, { profile, limit: 5 });

  return (
    <div>
      <SectionTitle
        eyebrow="Receitas inteligentes"
        title="Use o estoque para criar opcoes certeiras"
        text="Sugestoes baseadas nos itens disponiveis, prioridade por validade e combinacoes mais provaveis."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {suggestions.map((recipe, index) => (
          <motion.div
            key={recipe.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-300">
                {levelLabel(recipe.level)}
              </div>
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                {profileLabel(recipe.profile)}
              </div>
              <div className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                Prioridade {recipe.priority}
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-black">{recipe.title}</h3>
            <p className="mt-3 leading-8 text-white/70">{recipe.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span className="rounded-full border border-white/10 bg-neutral-900 px-3 py-1">{recipe.matchLabel}</span>
              {recipe.reasonLabel ? (
                <span className="rounded-full border border-white/10 bg-neutral-900 px-3 py-1">
                  {recipe.reasonLabel}
                </span>
              ) : null}
            </div>

            <div className="mt-5 text-sm text-white/65">
              Ingredientes principais:{' '}
              <span className="text-white/85">
                {(recipe.ingredientsRequired || []).map((item) => item.name).join(', ') || 'Sem dados'}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/65">
              Dica: priorize itens criticos e use combinacoes com maior match para reduzir perdas.
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-[30px] border border-white/10 bg-gradient-to-r from-emerald-500/15 via-white/[0.03] to-amber-500/10 p-6">
        <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Visao futura</div>
        <h2 className="mt-2 text-2xl font-black">Proxima evolucao do modulo</h2>
        <p className="mt-4 max-w-4xl leading-8 text-white/72">
          Integrar custo, margem e aceitacao para sugerir pratos, combos e promocoes dinamicas automaticamente.
        </p>
      </div>
    </div>
  );
}
