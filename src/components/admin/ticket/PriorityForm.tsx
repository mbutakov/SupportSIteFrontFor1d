import { component$, useSignal } from '@builder.io/qwik';

export default component$<{onCancel$: () => void, onSave$: (priority: string) => void}>(({ onCancel$, onSave$ }) => {
  const selectedPriority = useSignal('');
  
  // Заглушечные данные приоритетов
  const priorities = [
    { id: 'high', name: 'Высокий', color: 'var(--color-red)' },
    { id: 'medium', name: 'Средний', color: 'var(--color-yellow)' },
    { id: 'low', name: 'Низкий', color: 'var(--color-blue)' },
  ];

  return (
    <div style="background-color: var(--color-background-secondary); padding: 20px; border-radius: var(--border-radius); border: 1px solid var(--color-border); margin-bottom: 20px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Изменить приоритет</h2>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Выберите новый приоритет</label>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          {priorities.map(priority => (
            <div key={priority.id} 
              style={{
                padding: '10px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-border)',
                backgroundColor: selectedPriority.value === priority.id 
                  ? 'var(--color-background-tertiary)' 
                  : 'var(--color-background-secondary)',
                cursor: 'pointer'
              }}
              onClick$={() => selectedPriority.value = priority.id}
            >
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style={`
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background-color: ${priority.color};
                `}></div>
                <span style={`color: ${priority.color}; font-weight: 500;`}>
                  {priority.name}
                </span>
                <div style="flex-grow: 1;"></div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-text-secondary)',
                  backgroundColor: selectedPriority.value === priority.id 
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
          onClick$={() => onSave$(selectedPriority.value)} 
          class="button button-primary"
          disabled={!selectedPriority.value}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}); 