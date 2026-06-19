import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/format.js';
import { getTransactionAccountName } from '../utils/balance.js';

function getDisplayAmount(transaction) {
  if (getTransactionType(transaction) === 'expense') {
    return -Math.abs(transaction.amount);
  }

  return Number(transaction.amount);
}

function getTransactionType(transaction) {
  return transaction.transaction_type || transaction.type;
}

function getTransactionTitle(transaction) {
  return transaction.description || transaction.title || transaction.categories?.name || 'Transaction';
}

function getTransactionSubtitle(transaction) {
  const category = transaction.categories?.name || transaction.category || getTransactionType(transaction);
  const account = getTransactionAccountName(transaction);
  return `${category} - ${account}`;
}

function formatDisplayDate(date) {
  if (!date) {
    return '';
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function TransactionList({
  activeDeleteId,
  onDelete,
  onEdit,
  onRevealDelete,
  revealDeleteMode = false,
  transactions
}) {
  const [internalActiveDeleteId, setInternalActiveDeleteId] = useState('');
  const currentActiveDeleteId = activeDeleteId ?? internalActiveDeleteId;

  useEffect(() => {
    if (!revealDeleteMode || activeDeleteId !== undefined || !internalActiveDeleteId) {
      return undefined;
    }

    function collapseRevealedRow(event) {
      const target = event.target instanceof Element ? event.target : null;

      if (!target) {
        return;
      }

      if (
        target.closest('.apple-edit-minus')
        || target.closest('.apple-edit-delete-reveal')
        || target.closest('.apple-edit-control')
      ) {
        return;
      }

      setInternalActiveDeleteId('');
    }

    document.addEventListener('pointerdown', collapseRevealedRow);
    return () => document.removeEventListener('pointerdown', collapseRevealedRow);
  }, [activeDeleteId, internalActiveDeleteId, revealDeleteMode]);

  function handleRevealDelete(transaction) {
    if (onRevealDelete) {
      onRevealDelete(transaction);
      return;
    }

    setInternalActiveDeleteId((currentId) => (
      currentId === transaction.id ? '' : transaction.id
    ));
  }

  function handleDelete(transaction) {
    if (activeDeleteId === undefined) {
      setInternalActiveDeleteId('');
    }

    onDelete?.(transaction);
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => {
        const row = (
          <article className="transaction-row">
            <span className={`transaction-icon ${getTransactionType(transaction)}`}>
              {getTransactionType(transaction) === 'income' ? '+' : getTransactionType(transaction) === 'transfer' ? '>' : '-'}
            </span>
            <div className="transaction-main">
              <strong>{getTransactionTitle(transaction)}</strong>
              <span>{getTransactionSubtitle(transaction)}</span>
              {transaction.project_tags?.name && <span>{transaction.project_tags.name}</span>}
            </div>
            <div className="transaction-meta">
              <strong className={getDisplayAmount(transaction) < 0 ? 'amount-negative' : 'amount-positive'}>
                {getDisplayAmount(transaction) > 0 && getTransactionType(transaction) !== 'transfer' ? '+' : ''}{formatCurrency(getDisplayAmount(transaction))}
              </strong>
              <span>{formatDisplayDate(transaction.transaction_date) || transaction.date}</span>
              {(onDelete || onEdit) && !revealDeleteMode && (
                <span className="transaction-actions">
                  {onEdit && <button className="text-button" onClick={() => onEdit(transaction)}>Edit</button>}
                  {onDelete && <button className="text-button danger" onClick={() => onDelete(transaction)}>Delete</button>}
                </span>
              )}
              {onEdit && revealDeleteMode && (
                <span className="transaction-actions">
                  <button className="text-button apple-edit-control dashboard-row-control" onClick={() => onEdit(transaction)}>Edit</button>
                </span>
              )}
            </div>
          </article>
        );

        if (!revealDeleteMode) {
          return (
            <div key={transaction.id}>
              {row}
            </div>
          );
        }

        return (
          <div className={`apple-edit-row ${currentActiveDeleteId === transaction.id ? 'reveal-delete' : ''}`} key={transaction.id}>
            <button
              aria-label={`Delete ${getTransactionTitle(transaction)}`}
              className="apple-edit-delete-reveal dashboard-row-delete"
              onClick={() => handleDelete(transaction)}
              type="button"
            >
              Delete
            </button>
            <div className="apple-edit-row-slide">
              <button
                aria-label={currentActiveDeleteId === transaction.id ? `Hide delete for ${getTransactionTitle(transaction)}` : `Show delete for ${getTransactionTitle(transaction)}`}
                className="apple-edit-minus dashboard-row-minus"
                onClick={() => handleRevealDelete(transaction)}
                type="button"
              >
                <span aria-hidden="true">-</span>
              </button>
              {row}
            </div>
          </div>
        );
      })}
    </div>
  );
}
