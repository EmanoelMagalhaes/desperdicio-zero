import { recipesCatalog } from '../data/recipesCatalog';
import { statusFromExpiry } from '../utils/date';

const PROFILE_ALIASES = {
  client: 'restaurant',
  restaurant: 'restaurant',
  consumer: 'family',
  family: 'family',
};

function normalizeText(value) {
  if (!value) return '';
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function resolveProfile(profile) {
  if (!profile) return 'restaurant';
  return PROFILE_ALIASES[profile] || profile;
}

function matchIngredient(ingredientName, inventoryItems) {
  const target = normalizeText(ingredientName);
  if (!target) return null;

  return inventoryItems.find((item) => {
    const name = item.normalizedName;
    return name.includes(target) || target.includes(name);
  });
}

function recipeScore(recipeMatch) {
  let score = 0;
  if (recipeMatch.criticalIngredient) score += 100;
  if (recipeMatch.level === 'complete') score += 50;
  if (recipeMatch.level === 'almost') score += 25;
  score += Math.round(recipeMatch.matchRatio * 10);
  return score;
}

export function recipeSuggestions(items, options = {}) {
  const profile = resolveProfile(options.profile);
  const limit = typeof options.limit === 'number' ? options.limit : 5;

  const inventoryItems = (items || []).map((item) => {
    const expiryDate = item.expiryDate || item.expiry || '';
    const status = statusFromExpiry(expiryDate);
    return {
      ...item,
      expiryDate,
      status,
      normalizedName: normalizeText(item.name || ''),
    };
  });

  const eligibleRecipes = recipesCatalog.filter(
    (recipe) => recipe.profile === 'both' || recipe.profile === profile
  );

  const suggestions = eligibleRecipes.map((recipe) => {
    const required = recipe.ingredientsRequired || [];
    const totalRequired = required.length || 1;

    const matches = required.map((ingredient) => matchIngredient(ingredient.name, inventoryItems));
    const matchedCount = matches.filter(Boolean).length;
    const matchRatio = matchedCount / totalRequired;
    const missingRequired = required.filter((_, index) => !matches[index]).map((item) => item.name);

    let level = 'partial';
    if (matchedCount === totalRequired) {
      level = 'complete';
    } else if (matchedCount >= Math.max(1, totalRequired - 1) && matchRatio >= 0.6) {
      level = 'almost';
    }

    const criticalMatch = matches.find(
      (item) => item && (item.status.status === 'critical' || item.status.status === 'expired')
    );

    const matchLabel = `Voce tem ${matchedCount}/${totalRequired} ingredientes`;
    const reasonLabel = criticalMatch
      ? `Usa item critico: ${criticalMatch.name}`
      : level === 'complete'
        ? 'Receita completa com o estoque atual'
        : 'Faltam poucos ingredientes';

    const priority = criticalMatch ? 'Alta' : level === 'complete' ? 'Media' : 'Baixa';

    return {
      ...recipe,
      description: recipe.summary,
      matchLabel,
      reasonLabel,
      priority,
      level,
      matchedRequired: matchedCount,
      totalRequired,
      missingRequired,
      matchRatio,
      criticalIngredient: criticalMatch ? criticalMatch.name : '',
      score: 0,
    };
  });

  suggestions.forEach((item) => {
    item.score = recipeScore(item);
  });

  const sorted = suggestions.sort((a, b) => b.score - a.score);
  const preferred = sorted.filter((item) => item.level !== 'partial');
  const finalList = (preferred.length ? preferred : sorted).slice(0, limit);

  if (!finalList.length) {
    return [
      {
        id: 'rec-fallback-1',
        title: 'Criar prato do dia com itens criticos',
        description: 'Priorize ingredientes com menor prazo de validade e gere uma oferta especifica.',
        summary: 'Priorize ingredientes com menor prazo de validade e gere uma oferta especifica.',
        ingredientsRequired: [],
        instructions: [],
        profile: 'both',
        matchLabel: 'Baseado no estoque atual',
        reasonLabel: 'Sugestao geral',
        priority: 'Alta',
        level: 'suggestion',
        matchedRequired: 0,
        totalRequired: 0,
        missingRequired: [],
        matchRatio: 0,
        criticalIngredient: '',
      },
    ];
  }

  return finalList;
}

export function challengeTips() {
  return [
    'Organize sua despensa por prioridade de validade, nao apenas por categoria.',
    'Crie um prato do dia usando pelo menos 2 itens que vencem em ate 48 horas.',
    'Revise a lista de compras antes de cada reposicao para evitar compras duplicadas.',
    'Defina uma meta semanal de reducao de perdas e acompanhe o resultado no painel.',
  ];
}
