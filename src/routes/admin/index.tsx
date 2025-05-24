import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

// Определяем интерфейсы для данных из API
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

interface ApiMessage {
  id: number;
  ticket_id: number;
  sender_type: string;
  sender_id: number;
  message: string;
  created_at: string;
}

interface TicketWithMessages {
  ticket: ApiTicket;
  messages: ApiMessage[];
  lastMessageTime: Date;
}

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

// Функция для определения приоритета на основе категории
const determinePriority = (category: string): string => {
  if (!category) return 'medium';
  
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('срочно') || lowerCategory.includes('важно')) {
    return 'high';
  } else if (lowerCategory.includes('спросить')) {
    return 'low';
  } else {
    return 'medium';
  }
};

// Функция для получения инициалов из ID пользователя
const getInitialsFromId = (id: number): string => {
  return `П${id.toString().substring(0, 1)}`;
};

// Функция для форматирования относительного времени
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} минут назад`;
  } else if (diffHours < 24) {
    return `${diffHours} часов назад`;
  } else {
    return `${diffDays} дней назад`;
  }
};

export default component$(() => {
  // Сигналы для хранения данных
  const tickets = useSignal<ApiTicket[]>([]);
  const openTickets = useSignal<ApiTicket[]>([]);
  const resolvedTickets = useSignal<ApiTicket[]>([]);
  const highPriorityTickets = useSignal<ApiTicket[]>([]);
  
  const recentUpdates = useSignal<TicketWithMessages[]>([]);
  const isLoading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);

  // Загружаем данные при загрузке страницы
  useVisibleTask$(async () => {
    try {
      isLoading.value = true;
      
      // Загружаем список всех тикетов
      const ticketsResponse = await fetch('/api/tickets/');
      if (!ticketsResponse.ok) {
        throw new Error('Не удалось загрузить данные тикетов');
      }
      
      const ticketsData = await ticketsResponse.json();
      const allTickets: ApiTicket[] = ticketsData.tickets || [];
      tickets.value = allTickets;
      
      // Фильтруем тикеты по статусу
      openTickets.value = allTickets.filter(ticket => 
        ticket.status.toLowerCase() === 'открыт' || 
        ticket.status.toLowerCase() === 'ожидает ответа' ||
        ticket.status.toLowerCase() === 'в работе' ||
        ticket.status.toLowerCase() === 'в обработке'
      );
      
      resolvedTickets.value = allTickets.filter(ticket => 
        ticket.status.toLowerCase() === 'решён' || 
        ticket.status.toLowerCase() === 'решен'
      );
      
      // Фильтруем тикеты по приоритету (категории)
      highPriorityTickets.value = allTickets.filter(ticket => 
        determinePriority(ticket.category) === 'high'
      );
      
      // Для блока "Последние обновления" собираем тикеты с сообщениями
      // Ищем тикеты со статусом "в работе" или "открыт"
      const ticketsForUpdates = allTickets.filter(ticket => 
        ticket.status.toLowerCase() === 'открыт' || 
        ticket.status.toLowerCase() === 'ожидает ответа' ||
        ticket.status.toLowerCase() === 'в работе' ||
        ticket.status.toLowerCase() === 'в обработке'
      );
      
      // Загружаем сообщения для каждого тикета и находим последние сообщения
      const ticketsWithMessages: TicketWithMessages[] = [];
      
      for (const ticket of ticketsForUpdates) {
        try {
          const messagesResponse = await fetch(`/api/tickets/${ticket.id}/messages`);
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            const messages: ApiMessage[] = messagesData.messages || [];
            
            // Если есть сообщения от пользователя без ответа поддержки
            if (messages.length > 0) {
              // Проверяем, что последнее сообщение от пользователя
              const lastMessage = messages[messages.length - 1];
              if (lastMessage.sender_type === 'user') {
                ticketsWithMessages.push({
                  ticket,
                  messages,
                  lastMessageTime: new Date(lastMessage.created_at)
                });
              }
            }
          }
        } catch (err) {
          console.error(`Ошибка при загрузке сообщений для тикета ${ticket.id}:`, err);
        }
      }
      
      // Сортируем тикеты по времени последнего сообщения (от новых к старым)
      ticketsWithMessages.sort((a, b) => 
        b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      );
      
      // Берем первые 5 тикетов для отображения
      recentUpdates.value = ticketsWithMessages.slice(0, 5);
      
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      error.value = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <>
      <header class="header">
        <h1 class="header-title">Обзор панели управления</h1>
        <div class="header-actions">
          <button class="button button-primary">Создать тикет</button>
        </div>
      </header>
      
      <div class="main-content">
        {isLoading.value ? (
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
            Загрузка данных...
          </div>
        ) : error.value ? (
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
        ) : (
          <>
            <div class="stats-grid" style="display: flex; gap: 20px; margin-bottom: 24px;">
              <div style="flex: 1; background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border);">
                <h3 style="margin-top: 0; margin-bottom: 8px;">Всего тикетов</h3>
                <div style="font-size: 24px; font-weight: 600;">{tickets.value.length}</div>
              </div>
              
              <div style="flex: 1; background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border);">
                <h3 style="margin-top: 0; margin-bottom: 8px;">Открытые тикеты</h3>
                <div style="font-size: 24px; font-weight: 600;">{openTickets.value.length}</div>
              </div>
              
              <div style="flex: 1; background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border);">
                <h3 style="margin-top: 0; margin-bottom: 8px;">Решённые тикеты</h3>
                <div style="font-size: 24px; font-weight: 600;">{resolvedTickets.value.length}</div>
              </div>
              
              <div style="flex: 1; background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border);">
                <h3 style="margin-top: 0; margin-bottom: 8px;">Высокий приоритет</h3>
                <div style="font-size: 24px; font-weight: 600;">{highPriorityTickets.value.length}</div>
              </div>
            </div>
            
            <div style="background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border); margin-bottom: 24px;">
              <h2 style="margin-top: 0; margin-bottom: 16px;">Последние обновления</h2>
              {recentUpdates.value.length > 0 ? (
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  {recentUpdates.value.map((update, index) => {
                    const lastMessage = update.messages[update.messages.length - 1];
                    return (
                      <div key={lastMessage.id} style={`display: flex; align-items: center; gap: 8px; ${index < recentUpdates.value.length - 1 ? 'padding-bottom: 12px; border-bottom: 1px solid var(--color-border);' : ''}`}>
                        <div class="avatar">{getInitialsFromId(lastMessage.sender_id)}</div>
                        <div style="min-width: 0;">
                          <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            <a href={`/admin/tickets/${update.ticket.id}`} style="color: var(--color-primary); text-decoration: none;">
                              Новое сообщение в тикете #{update.ticket.id}: {update.ticket.title.length > 40 ? update.ticket.title.substring(0, 40) + '...' : update.ticket.title}
                            </a>
                          </div>
                          <div style="font-size: 13px; color: var(--color-text-secondary); display: flex; justify-content: space-between;">
                            <span>От пользователя #{lastMessage.sender_id}</span>
                            <span>{formatRelativeTime(lastMessage.created_at)}</span>
                          </div>
                          <div style="font-size: 14px; color: var(--color-text); margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
                            {lastMessage.message.length > 70 ? lastMessage.message.substring(0, 70) + '...' : lastMessage.message}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style="text-align: center; color: var(--color-text-secondary); padding: 16px 0;">
                  Нет новых обновлений
                </div>
              )}
              
              <div style="margin-top: 16px; text-align: right;">
                <a href="/admin/tickets" class="button button-secondary">Все тикеты</a>
              </div>
            </div>
            
            <div style="background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border);">
              <h2 style="margin-top: 0; margin-bottom: 16px;">Быстрый доступ</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                <a href="/admin/tickets?statusFilter=open" class="button button-secondary" style="width: 100%; text-align: center;">
                  Открытые тикеты
                </a>
                <a href="/admin/tickets?statusFilter=in-progress" class="button button-secondary" style="width: 100%; text-align: center;">
                  Тикеты в работе
                </a>
                <a href="/admin/tickets?sortOrder=priority-high" class="button button-secondary" style="width: 100%; text-align: center;">
                  Высокий приоритет
                </a>
                <a href="/admin/users" class="button button-secondary" style="width: 100%; text-align: center;">
                  Управление пользователями
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Админ-панель | SupportTicket',
}; 