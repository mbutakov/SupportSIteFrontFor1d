import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$(() => {
  const searchQuery = useSignal('');
  
  const handleSearch = $(async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/tickets/?search=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Ошибка поиска');
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
      return data && data.tickets && Array.isArray(data.tickets) ? data.tickets : [];
    } catch (err) {
      console.error('Ошибка при поиске:', err);
      return [];
    }
  });

  return (
    <div class="search-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <input 
        type="text" 
        placeholder="Поиск тикетов..." 
        value={searchQuery.value} 
        onInput$={(ev, el) => {
          searchQuery.value = el.value;
        }} 
      />
    </div>
  );
}); 