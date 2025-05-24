import { component$, useSignal } from '@builder.io/qwik';

export default component$<{onCancel$: () => void, onSave$: (status: string) => void}>(({ onCancel$, onSave$ }) => {
  const selectedStatus = useSignal('');
  
  // Заглушечные данные статусов
  const statuses = [
    { id: 'open', name: 'Открыт' },
    { id: 'in-progress', name: 'В работе' },
    { id: 'resolved', name: 'Решён' },
    { id: 'closed', name: 'Закрыт' },
  ];

  return (
    <div style="background-color: var(--color-background-secondary); padding: 20px; border-radius: var(--border-radius); border: 1px solid var(--color-border); margin-bottom: 20px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Изменить статус</h2>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Выберите новый статус</label>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          {statuses.map(status => (
            <div key={status.id} 
              style={{
                padding: '10px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-border)',
                backgroundColor: selectedStatus.value === status.id 
                  ? 'var(--color-background-tertiary)' 
                  : 'var(--color-background-secondary)',
                cursor: 'pointer'
              }}
              onClick$={() => selectedStatus.value = status.id}
            >
              <div style="display: flex; align-items: center; gap: 10px;">
                <div 
                  class={`status-badge status-${status.id}`}
                  style="margin: 0;"
                >
                  {status.name}
                </div>
                <div style="flex-grow: 1;"></div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-text-secondary)',
                  backgroundColor: selectedStatus.value === status.id 
                    ? 'var(--color-primary)' 
                    : 'transparent'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button 
          onClick$={onCancel$} 
          class="button button-secondary"
        >
          Отмена
        </button>
        <button 
          onClick$={() => onSave$(selectedStatus.value)} 
          class="button button-primary"
          disabled={!selectedStatus.value}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}); 