import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

// Определим интерфейс для тикета
interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  project: string;
  category: string;
  assignedTo: string | null;
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

// Функция для форматирования даты
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  } catch (e) {
    console.error('Ошибка при парсинге даты:', e);
    return '';
  }
};

export default component$(() => {
  // Состояние для данных
  const tickets = useSignal<Ticket[]>([]);
  const allTickets = useSignal<Ticket[]>([]);
  const isLoading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);

  // Состояние для фильтров
  const searchQuery = useSignal('');
  const statusFilter = useSignal('all');
  const sortOrder = useSignal('newest');

  // Функция фильтрации тикетов
  const filterTickets = $(() => {
    let filteredTickets = [...allTickets.value];
    
    // Поиск
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.title.toLowerCase().includes(query) || 
        ticket.id.toLowerCase().includes(query) ||
        ticket.category.toLowerCase().includes(query)
      );
    }
    
    // Фильтр по статусу
    if (statusFilter.value !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter.value);
    }
    
    // Сортировка
    if (sortOrder.value === 'newest') {
      filteredTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder.value === 'oldest') {
      filteredTickets.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOrder.value === 'priority-high') {
      filteredTickets.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      });
    } else if (sortOrder.value === 'priority-low') {
      filteredTickets.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      });
    }
    
    tickets.value = filteredTickets;
  });

  // Загрузка данных с сервера
  useVisibleTask$(async () => {
    try {
      isLoading.value = true;
      
      const response = await fetch('/api/tickets/');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить тикеты');
      }
      
      const data = await response.json();
      
      if (!data || !data.tickets || !Array.isArray(data.tickets)) {
        console.warn('API вернул неправильную структуру данных:', data);
        tickets.value = [];
        return;
      }
      
      // Преобразуем данные из API в формат, который ожидает интерфейс Ticket
      const formattedTickets = data.tickets.map((ticket: any) => ({
        id: String(ticket.id) || 'unknown',
        title: ticket.title || 'Без названия',
        status: mapApiStatus(ticket.status) || 'open',
        priority: determinePriority(ticket.category) || 'medium',
        createdAt: ticket.created_at || new Date().toISOString(),
        project: ticket.category?.split(',')[0] || 'Не указан',
        category: ticket.category || 'Не указана',
        assignedTo: null // В API нет данных о назначенном пользователе
      }));
      
      allTickets.value = formattedTickets;
      tickets.value = [...formattedTickets];
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Произошла ошибка';
      console.error('Ошибка при загрузке тикетов:', err);
    } finally {
      isLoading.value = false;
    }
  });

  // Применяем фильтры при изменении условий
  useVisibleTask$(({ track }) => {
    track(() => searchQuery.value);
    track(() => statusFilter.value);
    track(() => sortOrder.value);
    
    if (allTickets.value.length > 0) {
      filterTickets();
    }
  });

  return (
    <>
      <header class="header">
        <h1 class="header-title">Тикеты</h1>
        <div class="header-actions">
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <input 
              type="text" 
              placeholder="Поиск тикетов..." 
              value={searchQuery.value} 
              onInput$={(_, el) => searchQuery.value = el.value} 
            />
          </div>
          <button class="button button-primary">Создать тикет</button>
        </div>
      </header>
      
      <div class="main-content">
        <div class="filter-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div class="button-group" style="display: flex; gap: 8px;">
            <button 
              class={`button button-secondary ${statusFilter.value === 'all' ? 'button-active' : ''}`} 
              onClick$={() => statusFilter.value = 'all'}
            >
              Все
            </button>
            <button 
              class={`button button-secondary ${statusFilter.value === 'open' ? 'button-active' : ''}`} 
              onClick$={() => statusFilter.value = 'open'}
            >
              Открытые
            </button>
            <button 
              class={`button button-secondary ${statusFilter.value === 'in-progress' ? 'button-active' : ''}`} 
              onClick$={() => statusFilter.value = 'in-progress'}
            >
              В работе
            </button>
            <button 
              class={`button button-secondary ${statusFilter.value === 'resolved' ? 'button-active' : ''}`} 
              onClick$={() => statusFilter.value = 'resolved'}
            >
              Решённые
            </button>
            <button 
              class={`button button-secondary ${statusFilter.value === 'closed' ? 'button-active' : ''}`} 
              onClick$={() => statusFilter.value = 'closed'}
            >
              Закрытые
            </button>
          </div>
          
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="color: var(--color-text-secondary); white-space: nowrap;">Сортировать по:</span>
            <select 
              value={sortOrder.value}
              onChange$={(_, el) => sortOrder.value = el.value}
              style="background-color: var(--color-background-secondary); color: var(--color-text); border: 1px solid var(--color-border); padding: 6px 8px; border-radius: var(--border-radius); font-size: 14px;"
            >
              <option value="newest">Новые сначала</option>
              <option value="oldest">Старые сначала</option>
              <option value="priority-high">Высокий приоритет</option>
              <option value="priority-low">Низкий приоритет</option>
            </select>
          </div>
        </div>
        
        {/* Отображение состояния загрузки */}
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
            Загрузка тикетов...
          </div>
        )}

        {/* Отображение ошибки */}
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

        {/* Отображение списка тикетов */}
        {!isLoading.value && !error.value && (
          <div class="ticket-list">
            {tickets.value.length > 0 ? (
              tickets.value.map((ticket: Ticket) => (
                <a href={`/admin/tickets/${ticket.id}`} key={ticket.id} class="ticket-item" style="text-decoration: none; color: inherit;">
                  <div class={`ticket-priority priority-${ticket.priority}`}></div>
                  <div class="ticket-content">
                    <div class="ticket-title">{ticket.title}</div>
                    <div class="ticket-meta">
                      <span>#{ticket.id}</span>
                      <span>{ticket.project}</span>
                      <span class={`status-badge status-${ticket.status}`}>
                        {ticket.status === 'open' && 'Открыт'}
                        {ticket.status === 'in-progress' && 'В работе'}
                        {ticket.status === 'resolved' && 'Решён'}
                        {ticket.status === 'closed' && 'Закрыт'}
                      </span>
                      <span>Создан: {formatDate(ticket.createdAt)}</span>
                      {ticket.assignedTo && (
                        <div class="avatar">{ticket.assignedTo}</div>
                      )}
                    </div>
                  </div>
                </a>
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
                {searchQuery.value ? 'По вашему запросу ничего не найдено' : 'Нет доступных тикетов'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Тикеты | SupportTicket',
}; 