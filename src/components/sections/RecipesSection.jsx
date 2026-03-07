import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { recipeSuggestions } from '../../services/kitchenService';

export default function RecipesSection({ items }) {
  const suggestions = recipeSuggestions(items);

  return (
    <div>
      <SectionTitle
        eyebrow="Receitas sugeridas"
        title="Transforme estoque em acao pratica"
        text="As sugestoes usam os itens disponiveis e a urgencia operacional para reduzir perdas."
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
            <div className="mb-4 inline-flex rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-300">
              Prioridade {recipe.priority}
            </div>
            <h3 className="text-2xl font-black">{recipe.title}</h3>
            <p className="mt-4 leading-8 text-white/70">{recipe.description}</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/65">
              Estrategia: priorizar itens criticos, montar oferta do dia e medir saida apos a execucao.
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