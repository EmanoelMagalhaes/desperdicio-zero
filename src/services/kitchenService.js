export function recipeSuggestions(items) {
  const names = items.map((item) => item.name.toLowerCase());
  const hasAny = (...terms) => terms.some((term) => names.some((name) => name.includes(term)));

  const suggestions = [];

  if (hasAny('tomate', 'alface', 'queijo')) {
    suggestions.push({
      title: 'Combo de saladas ou prato leve',
      description: 'Aproveite tomate, alface e queijo para gerar saida rapida dos itens frescos.',
      priority: 'Alta',
    });
  }

  if (hasAny('pao')) {
    suggestions.push({
      title: 'Combo promocional de padaria',
      description: 'Use os paes do dia em combos ou acompanhamentos para evitar perda imediata.',
      priority: 'Alta',
    });
  }

  if (hasAny('frango', 'arroz', 'queijo')) {
    suggestions.push({
      title: 'Escondidinho ou arroz cremoso',
      description: 'Reaproveitamento util para itens que ja estao na operacao.',
      priority: 'Media',
    });
  }

  if (hasAny('leite', 'chocolate')) {
    suggestions.push({
      title: 'Bebidas e sobremesas especiais',
      description: 'Use leite e chocolate para aumentar venda de bebidas sazonais e sobremesas.',
      priority: 'Media',
    });
  }

  if (!suggestions.length) {
    suggestions.push(
      {
        title: 'Montar prato do dia com itens criticos',
        description: 'Priorize ingredientes com menor prazo de validade e gere uma oferta especifica.',
        priority: 'Alta',
      },
      {
        title: 'Criar promocao relampago',
        description: 'Use itens com estoque alto em combos ou kits para aumentar giro.',
        priority: 'Media',
      }
    );
  }

  return suggestions;
}

export function challengeTips() {
  return [
    'Organize sua despensa por prioridade de validade, nao apenas por categoria.',
    'Crie um prato do dia usando pelo menos 2 itens que vencem em ate 48 horas.',
    'Revise a lista de compras antes de cada reposicao para evitar compras duplicadas.',
    'Defina uma meta semanal de reducao de perdas e acompanhe o resultado no painel.',
  ];
}