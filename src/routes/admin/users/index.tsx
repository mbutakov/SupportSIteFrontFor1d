import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

// Интерфейсы для работы с API
interface ApiUser {
  id: number;
  full_name: string;
  phone: string;
  location_lat: number;
  location_lng: number;
  birth_date: string;
  is_registered: boolean;
  registered_at: string;
}

interface ApiUsersResponse {
  users: ApiUser[];
  limit: number;
  page: number;
  total: number;
}

// Адаптация данных пользователя для отображения в интерфейсе
interface DisplayUser {
  id: string;
  name: string;
  shortName: string;
  phone: string;
  status: string;
  lastOnline: string;
  registeredDate: string;
  ticketsCount?: number;
  telegram?: {
    id?: string;
    username?: string;
    connected?: boolean;
  } | null;
}

// Функция для получения инициалов из полного имени
const getInitials = (fullName: string): string => {
  if (!fullName) return 'ПЛ';
  
  const parts = fullName.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

// Функция форматирования даты
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  } catch (e) {
    console.error('Ошибка при форматировании даты:', e);
    return '';
  }
};

export default component$(() => {
  // Сигналы для данных и UI
  const users = useSignal<DisplayUser[]>([]);
  const allUsers = useSignal<DisplayUser[]>([]);
  const isLoading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);
  const searchQuery = useSignal('');
  const statusFilter = useSignal('all');

  // Функция фильтрации пользователей
  const filterUsers = $(() => {
    let filteredUsers = [...allUsers.value];
    
    // Фильтр по поиску
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.phone.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      );
    }
    
    // Фильтр по статусу
    if (statusFilter.value !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter.value);
    }
    
    users.value = filteredUsers;
  });
  
  // Загрузка пользователей с сервера
  useVisibleTask$(async () => {
    try {
      isLoading.value = true;
      
      const response = await fetch('/api/users/');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные пользователей');
      }
      
      const data: ApiUsersResponse = await response.json();
      
      // Преобразуем данные API в формат для отображения
      const displayUsers: DisplayUser[] = data.users.map(user => ({
        id: user.id.toString(),
        name: user.full_name || `Пользователь #${user.id}`,
        shortName: getInitials(user.full_name),
        phone: user.phone || 'Не указан',
        status: user.is_registered ? 'active' : 'inactive',
        lastOnline: user.is_registered ? 'Зарегистрирован' : 'Не активен',
        registeredDate: formatDate(user.registered_at),
        // Информация о Telegram будет добавлена позже при необходимости
        telegram: null,
      }));
      
      allUsers.value = displayUsers;
      users.value = [...displayUsers];
      
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      error.value = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных';
    } finally {
      isLoading.value = false;
    }
  });

  // Применяем фильтры при изменении условий
  useVisibleTask$(({ track }) => {
    track(() => searchQuery.value);
    track(() => statusFilter.value);
    
    if (allUsers.value.length > 0) {
      filterUsers();
    }
  });

  return (
    <>
      <header class="header">
        <h1 class="header-title">Пользователи</h1>
        <div class="header-actions">
          <button class="button button-primary">Добавить пользователя</button>
        </div>
      </header>
      
      <div class="main-content" style="overflow-y: auto;">
        {/* Секция фильтров */}
        <div style={{
          background: 'var(--color-background-secondary)',
          borderRadius: 'var(--border-radius)',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--color-text-secondary)'
              }}>Поиск</label>
              <input 
                type="text" 
                value={searchQuery.value}
                onInput$={(_, el) => searchQuery.value = el.value}
                placeholder="Имя, Телефон, ID..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-background-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--color-text)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--color-text-secondary)'
              }}>Статус</label>
              <select
                value={statusFilter.value}
                onChange$={(_, el) => statusFilter.value = el.value}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-background-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--color-text)',
                  fontSize: '14px'
                }}
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
            </div>
          </div>
        </div>

        {/* Индикация загрузки */}
        {isLoading.value && (
          <div style={{
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: 'var(--border-radius)',
            padding: '32px 16px',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <div style="display: flex; justify-content: center; margin-bottom: 16px;">
              <div class="loading-spinner"></div>
            </div>
            Загрузка данных пользователей...
          </div>
        )}

        {/* Ошибка загрузки */}
        {!isLoading.value && error.value && (
          <div style={{
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: 'var(--border-radius)',
            padding: '32px 16px',
            border: '1px solid var(--color-red)',
            textAlign: 'center',
            color: 'var(--color-red)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 style="margin: 0 0 8px; font-size: 16px; color: var(--color-red);">Ошибка загрузки</h3>
            <p style="margin: 0;">{error.value}</p>
            <button 
              class="button button-primary" 
              style="margin-top: 16px;"
              onClick$={() => location.reload()}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Список пользователей */}
        {!isLoading.value && !error.value && (
          <div style="display: flex; flex-direction: column; gap: 16px;">
            {users.value.length > 0 ? (
              users.value.map(user => (
                <div 
                  key={user.id} 
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    borderRadius: 'var(--border-radius)',
                    padding: '16px',
                    border: '1px solid var(--color-border)',
                    transition: 'border-color var(--transition-speed)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div style="display: flex; gap: 16px; align-items: center;">
                      <div class="avatar" style="width: 48px; height: 48px; font-size: 18px; background-color: var(--color-primary); flex-shrink: 0;">
                        {user.shortName}
                      </div>
                      
                      <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 6px;">
                          <h3 style="margin: 0; font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            {user.name}
                          </h3>
                          
                          <div style="font-size: 13px; color: var(--color-text-secondary); white-space: nowrap;">
                            {user.status === 'active' ? (
                              <span style="color: var(--color-green);">● Активен</span>
                            ) : (
                              <span style="color: var(--color-text-secondary);">● Неактивен</span>
                            )}
                            {user.lastOnline && (
                              <span style="margin-left: 8px;">{user.lastOnline}</span>
                            )}
                          </div>
                        </div>
                        
                        <div style="color: var(--color-text-secondary); font-size: 14px; margin-bottom: 12px; overflow: hidden; text-overflow: ellipsis;">
                          ID: {user.id} | Телефон: {user.phone}
                        </div>
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px;">
                          <div>
                            <span style="color: var(--color-text-secondary);">Зарегистрирован:</span> {user.registeredDate}
                          </div>
                          {user.ticketsCount !== undefined && (
                            <div>
                              <span style="color: var(--color-text-secondary);">Тикеты:</span> {user.ticketsCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <a href={`/admin/users/${user.id}`} class="button button-secondary" style="flex-grow: 1; text-align: center; min-width: 120px;">
                        Просмотреть
                      </a>
                      <button class="button button-secondary" style="flex-grow: 1; min-width: 120px;">
                        {user.status === 'active' ? 'Деактивировать' : 'Активировать'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--border-radius)',
                padding: '32px 16px',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
                color: 'var(--color-text-secondary)'
              }}>
                По вашему запросу ничего не найдено
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Пользователи | SupportTicket',
}; 