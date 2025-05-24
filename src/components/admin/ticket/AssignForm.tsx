import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$<{onCancel$: () => void, onSave$: (userId: string) => void}>(({ onCancel$, onSave$ }) => {
  const selectedUser = useSignal('');
  
  // Заглушечные данные пользователей с дополнительной информацией
  const users = [
    { 
      id: '1', 
      name: 'Антон Кузнецов', 
      shortName: 'АК', 
      ticketsCount: 5, 
      lastOnline: 'Сейчас', 
      department: 'Техподдержка',
      rating: 4.8
    },
    { 
      id: '2', 
      name: 'Мария Сидорова', 
      shortName: 'МС', 
      ticketsCount: 3, 
      lastOnline: '10 минут назад', 
      department: 'Разработка',
      rating: 4.7
    },
    { 
      id: '3', 
      name: 'Алексей Петров', 
      shortName: 'АП', 
      ticketsCount: 8, 
      lastOnline: '1 час назад', 
      department: 'Техподдержка',
      rating: 4.5
    },
    { 
      id: '4', 
      name: 'Елена Иванова', 
      shortName: 'ЕИ', 
      ticketsCount: 1, 
      lastOnline: 'Вчера', 
      department: 'Разработка',
      rating: 4.9
    },
  ];

  const handleAssign = $(async (ticketId: string, userId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigned_to: userId
        })
      });
      
      if (!response.ok) {
        throw new Error('Не удалось назначить тикет');
      }
      
      // Проверяем и обрабатываем текст ответа
      const text = await response.text();
      if (!text) return null;
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Ошибка при парсинге JSON:', text.substring(0, 100) + '...');
        return null;
      }
    } catch (err) {
      console.error('Ошибка при назначении тикета:', err);
      throw err;
    }
  });

  return (
    <div style="background-color: var(--color-background-secondary); padding: 20px; border-radius: var(--border-radius); border: 1px solid var(--color-border); margin-bottom: 20px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Назначить тикет</h2>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 12px; font-weight: 500;">Выберите сотрудника</label>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          {users.map(user => (
            <div key={user.id} 
              style={{
                padding: '12px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-border)',
                backgroundColor: selectedUser.value === user.id 
                  ? 'var(--color-background-tertiary)' 
                  : 'var(--color-background-secondary)',
                cursor: 'pointer'
              }}
              onClick$={() => selectedUser.value = user.id}
            >
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="avatar" style="width: 36px; height: 36px; font-size: 14px;">{user.shortName}</div>
                <div style="flex-grow: 1; min-width: 0;">
                  <div style="font-weight: 500; margin-bottom: 4px;">{user.name}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13px; color: var(--color-text-secondary);">
                    <div>
                      <span style="color: var(--color-text);">{user.ticketsCount}</span> тикетов в работе
                    </div>
                    <div>
                      Онлайн: {user.lastOnline}
                    </div>
                    <div>
                      Отдел: {user.department}
                    </div>
                    <div>
                      Рейтинг: {user.rating}
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-text-secondary)',
                  backgroundColor: selectedUser.value === user.id 
                    ? 'var(--color-primary)' 
                    : 'transparent',
                  flexShrink: 0
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
          onClick$={() => onSave$(selectedUser.value)} 
          class="button button-primary"
          disabled={!selectedUser.value}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}); 