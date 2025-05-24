import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

// Определим интерфейс для тикета
interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  project: string;
  assignedTo: string | null;
}

// Функция для преобразования статуса из API в наш формат
const mapApiStatus = (apiStatus: string): string => {
  switch (apiStatus?.toLowerCase()) {
    case 'ожидает ответа':
      return 'open';
    case 'в обработке':
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
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Ошибка при парсинге даты:', e);
    return '';
  }
};

export default component$(() => {
  const tickets = useSignal<Ticket[]>([]);
  const isLoading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);

  // useVisibleTask$ заменяет useEffect из React
  useVisibleTask$(async () => {
    try {
      isLoading.value = true;
      const response = await fetch('/api/tickets/');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить тикеты');
      }
      
      // Проверяем тип контента
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API вернул неверный формат данных');
      }
      
      // Проверяем и обрабатываем текст ответа
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Ошибка при парсинге JSON:', text.substring(0, 100) + '...');
        throw new Error('Ошибка парсинга ответа');
      }
      
      // Проверяем, есть ли в данных массив tickets
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
        createdAt: formatDate(ticket.created_at) || new Date().toISOString().split('T')[0],
        project: ticket.category || 'Не указан',
        assignedTo: null // В API нет данных о назначенном пользователе
      }));
      
      tickets.value = formattedTickets;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Произошла ошибка';
      console.error('Ошибка при загрузке тикетов:', err);
    } finally {
      isLoading.value = false;
    }
  });

  // Отображение состояния загрузки
  return (
    <>
      {isLoading.value && <div class="loading">Загрузка тикетов...</div>}

      {error.value && <div class="error">Ошибка: {error.value}</div>}

      {(!isLoading.value && !error.value) && (
        <div class="ticket-list">
          {tickets.value.length > 0 ? (
            tickets.value.map((ticket: Ticket) => (
              <a href={`/admin/tickets/${ticket.id}`} key={ticket.id} class="ticket-item" style="text-decoration: none; color: inherit;">
                <div class={`ticket-priority priority-${ticket.priority}`}></div>
                <div class="ticket-content">
                  <div class="ticket-title">{ticket.title}</div>
                  <div class="ticket-meta">
                    <span>{ticket.id}</span>
                    <span>{ticket.project}</span>
                    <span class={`status-badge status-${ticket.status}`}>
                      {ticket.status === 'open' && 'Открыт'}
                      {ticket.status === 'in-progress' && 'В работе'}
                      {ticket.status === 'resolved' && 'Решён'}
                      {ticket.status === 'closed' && 'Закрыт'}
                    </span>
                    <span>Создан: {ticket.createdAt}</span>
                    {ticket.assignedTo && (
                      <div class="avatar">{ticket.assignedTo}</div>
                    )}
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div class="no-tickets">Нет доступных тикетов</div>
          )}
        </div>
      )}
    </>
  );
}); 