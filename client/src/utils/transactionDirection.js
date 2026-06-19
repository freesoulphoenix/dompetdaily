export function resolveMoneyDirection(value = {}) {
  if (value.transaction_type === 'expense') {
    return 'out';
  }

  if (value.transaction_type === 'income') {
    return 'in';
  }

  if (value.money_direction === 'in' || value.money_direction === 'out') {
    return value.money_direction;
  }

  const amount = Number(value.amount || 0);

  if (amount < 0) {
    return 'out';
  }

  if (amount > 0) {
    return 'in';
  }

  return null;
}
