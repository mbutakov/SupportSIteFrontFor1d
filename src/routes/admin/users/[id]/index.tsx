import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, type DocumentHead } from '@builder.io/qwik-city';

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

interface ApiTicket {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  category: string;
  created_at: string;
  closed_at?: string;
}

interface ApiUserResponse {
  user: ApiUser;
  tickets: ApiTicket[];
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

// Функция для преобразования статуса из API в наш формат
const mapApiStatus = (apiStatus: string): string => {
  switch (apiStatus?.toLowerCase()) {
    case 'открыт':
    case 'ожидает ответа':
      return 'open';
    case 'в обработке':
    case 'в работе':
      return 'in-progress';
    case 'решён':
    case 'решен':
      return 'resolved';
    case 'закрыт':
      return 'closed';
    default:
      return 'open';
  }
};

export default component$(() => {
  const location = useLocation();
  const userId = location.params.id;
  
  // Сигналы для данных и UI
  const user = useSignal<ApiUser | null>(null);
  const tickets = useSignal<ApiTicket[]>([]);
  const isLoading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);
  const isEditMode = useSignal(false);
  const editedUser = useSignal<ApiUser | null>(null);
  
  // Получение данных пользователя
  useVisibleTask$(async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Пользователь не найден');
        } else {
          throw new Error('Не удалось загрузить данные пользователя');
        }
      }
      
      const data: ApiUserResponse = await response.json();
      
      user.value = data.user;
      tickets.value = data.tickets || [];
      
      // Копируем данные пользователя для режима редактирования
      editedUser.value = { ...data.user };
      
    } catch (err) {
      console.error('Ошибка при загрузке пользователя:', err);
      error.value = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных';
    } finally {
      isLoading.value = false;
    }
  });
  
  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading.value) {
    return (
      <div class="main-content">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh;">
          <div class="loading-spinner" style="width: 48px; height: 48px;"></div>
          <div style="margin-top: 16px; font-size: 16px; color: var(--color-text-secondary);">
            Загрузка данных пользователя...
          </div>
        </div>
      </div>
    );
  }
  
  // Если произошла ошибка, показываем сообщение об ошибке
  if (error.value || !user.value) {
    return (
      <div class="main-content">
        <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); padding: 24px; border: 1px solid var(--color-red); color: var(--color-red); text-align: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 style="margin-top: 0; font-size: 20px;">Пользователь не найден</h2>
          <p style="margin-bottom: 16px;">{error.value || `Пользователь с идентификатором ${userId} не существует.`}</p>
          <a href="/admin/users" class="button button-secondary">Вернуться к списку пользователей</a>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <header class="header">
        <h1 class="header-title">
          {isEditMode.value ? 'Редактирование пользователя' : user.value.full_name || `Пользователь #${user.value.id}`}
        </h1>
        <div class="header-actions">
          {!isEditMode.value ? (
            <button 
              class="button button-primary"
              onClick$={() => isEditMode.value = true}
            >
              Редактировать
            </button>
          ) : (
            <>
              <button 
                class="button button-secondary"
                onClick$={() => {
                  isEditMode.value = false;
                  editedUser.value = { ...user.value! };
                }}
              >
                Отмена
              </button>
              <button 
                class="button button-primary"
                onClick$={() => {
                  // Здесь был бы код сохранения изменений, пока отключено
                  isEditMode.value = false;
                }}
              >
                Сохранить
              </button>
            </>
          )}
        </div>
      </header>
      
      <div class="main-content">
        <div style={{
          display: 'grid', 
          gridTemplateColumns: '3fr 2fr', 
          gap: '24px'
        }} class="user-detail-grid">
          {/* Основная информация */}
          <div>
            <div style={{
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              marginBottom: '24px'
            }}>
              <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 24px;">Информация о пользователе</h2>
              
              <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                <div class="avatar" style="width: 80px; height: 80px; font-size: 28px; background-color: var(--color-primary); flex-shrink: 0;">
                  {getInitials(user.value.full_name)}
                </div>
                
                <div style="flex: 1;">
                  <h3 style="margin: 0 0 8px; font-size: 20px; font-weight: 600;">
                    {user.value.full_name || `Пользователь #${user.value.id}`}
                  </h3>
                  
                  <div style="color: var(--color-text-secondary); font-size: 15px; margin-bottom: 8px;">
                    ID: {user.value.id}
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 16px; font-size: 14px;">
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: user.value.is_registered ? 'rgba(0, 128, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      color: user.value.is_registered ? 'var(--color-green)' : 'var(--color-text-secondary)',
                      fontWeight: 500
                    }}>
                      {user.value.is_registered ? 'Зарегистрирован' : 'Не зарегистрирован'}
                    </div>
                    
                    <div>
                      {formatDate(user.value.registered_at)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
                <div>
                  <div style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 4px;">Телефон</div>
                  <div style="font-size: 15px;">{user.value.phone || 'Не указан'}</div>
                </div>
                
                <div>
                  <div style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 4px;">Дата рождения</div>
                  <div style="font-size: 15px;">{formatDate(user.value.birth_date) || 'Не указана'}</div>
                </div>
                
                {user.value.location_lat !== 0 && user.value.location_lng !== 0 && (
                  <div>
                    <div style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 4px;">Местоположение</div>
                    <div style="font-size: 15px;">
                      <a 
                        href={`https://www.google.com/maps?q=${user.value.location_lat},${user.value.location_lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style="color: var(--color-primary);"
                      >
                        Посмотреть на карте
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Список тикетов пользователя */}
            <div style={{
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}>
              <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 24px;">
                Тикеты пользователя ({tickets.value.length})
              </h2>
              
              {tickets.value.length > 0 ? (
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  {tickets.value.map(ticket => (
                    <div 
                      key={ticket.id}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--border-radius)',
                        backgroundColor: 'var(--color-background-tertiary)',
                        border: '1px solid var(--color-border)',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <div style="font-weight: 500; font-size: 15px;">
                          <a 
                            href={`/admin/tickets/${ticket.id}`}
                            style="color: var(--color-primary); text-decoration: none;"
                          >
                            #{ticket.id}: {ticket.title.length > 50 ? ticket.title.substring(0, 50) + '...' : ticket.title}
                          </a>
                        </div>
                        
                        <div style={{
                          padding: '2px 8px',
                          fontSize: '13px',
                          borderRadius: 'var(--border-radius)',
                          backgroundColor: 
                            mapApiStatus(ticket.status) === 'open' ? 'rgba(255, 0, 0, 0.1)' : 
                            mapApiStatus(ticket.status) === 'in-progress' ? 'rgba(255, 165, 0, 0.1)' : 
                            mapApiStatus(ticket.status) === 'resolved' ? 'rgba(0, 128, 0, 0.1)' : 
                            'rgba(128, 128, 128, 0.1)',
                          color: 
                            mapApiStatus(ticket.status) === 'open' ? 'var(--color-red)' : 
                            mapApiStatus(ticket.status) === 'in-progress' ? 'var(--color-yellow)' : 
                            mapApiStatus(ticket.status) === 'resolved' ? 'var(--color-green)' : 
                            'var(--color-text-secondary)'
                        }}>
                          {ticket.status}
                        </div>
                      </div>
                      
                      <div style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 8px;">
                        {ticket.description.length > 100 ? ticket.description.substring(0, 100) + '...' : ticket.description}
                      </div>
                      
                      <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--color-text-secondary);">
                        <div>Категория: {ticket.category || 'Не указана'}</div>
                        <div>Создан: {formatDate(ticket.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-background-tertiary)',
                  borderRadius: 'var(--border-radius)'
                }}>
                  У пользователя пока нет тикетов
                </div>
              )}
            </div>
          </div>
          
          {/* Блок с действиями */}
          <div>
            <div style={{
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              marginBottom: '24px'
            }}>
              <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 24px;">Действия</h2>
              
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <a 
                  href={`/admin/tickets?user=${user.value.id}`} 
                  class="button button-secondary"
                  style="width: 100%; justify-content: center;"
                >
                  Просмотр всех тикетов
                </a>
                
                <button 
                  class="button button-secondary"
                  style="width: 100%; justify-content: center;"
                >
                  {user.value.is_registered ? 'Деактивировать пользователя' : 'Активировать пользователя'}
                </button>
                
                <button 
                  class="button button-danger"
                  style="width: 100%; justify-content: center; background-color: rgba(255, 0, 0, 0.1); color: var(--color-red); border: 1px solid rgba(255, 0, 0, 0.2);"
                >
                  Удалить пользователя
                </button>
              </div>
            </div>
            
            {/* Местоположение пользователя */}
            {user.value.location_lat !== 0 && user.value.location_lng !== 0 && (
              <div style={{
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--border-radius)',
                padding: '24px',
                border: '1px solid var(--color-border)'
              }}>
                <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 16px;">Местоположение</h2>
                
                <div style={{
                  height: '250px',
                  backgroundColor: 'var(--color-background-tertiary)',
                  borderRadius: 'var(--border-radius)',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'var(--color-text-secondary)'
                }}>
                  <a 
                    href={`https://www.google.com/maps?q=${user.value.location_lat},${user.value.location_lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: 'var(--color-primary)',
                      gap: '8px',
                      textDecoration: 'none'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span style="font-size: 14px;">Открыть в Google Maps</span>
                  </a>
                </div>
                
                <div style="font-size: 14px; color: var(--color-text-secondary);">
                  Координаты: {user.value.location_lat}, {user.value.location_lng}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = ({ params }) => {
  return {
    title: `Пользователь #${params.id} | SupportTicket`,
  };
}; 