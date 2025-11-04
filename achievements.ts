export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_transaction', name: 'Primeiros Passos', description: 'Registar a sua primeira transação.', icon: '👟', xp: 50 },
    { id: 'ten_transactions', name: 'Pequeno Historiador', description: 'Registar 10 transações.', icon: '📜', xp: 100 },
    { id: 'first_budget', name: 'O Orçamentista', description: 'Criar o seu primeiro orçamento por categoria.', icon: '🎯', xp: 75 },
    { id: 'first_recurring', name: 'Planeador de Futuro', description: 'Criar o seu primeiro movimento recorrente.', icon: '🗓️', xp: 75 },
    { id: 'first_plan', name: 'Estratega', description: 'Fazer o seu primeiro planeamento de orçamento.', icon: '📋', xp: 100 },
    { id: 'centurion', name: 'Centurião Financeiro', description: 'Registar 100 transações.', icon: '💯', xp: 300 },
    { id: 'weekend_saver', name: 'Mão Fechada', description: 'Passar um fim de semana sem despesas de lazer ou restaurantes.', icon: '🤐', xp: 150 },
    { id: 'budget_master', name: 'Mês de Sucesso', description: 'Terminar um mês sem exceder nenhum orçamento.', icon: '🏅', xp: 250 },
];
