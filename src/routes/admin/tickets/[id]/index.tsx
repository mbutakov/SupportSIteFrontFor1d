import { component$, useSignal, useVisibleTask$, $, noSerialize } from '@builder.io/qwik';
import { useLocation, type DocumentHead } from '@builder.io/qwik-city';
import StatusForm from '../../../../components/admin/ticket/StatusForm';
import AssignForm from '../../../../components/admin/ticket/AssignForm';
import PriorityForm from '../../../../components/admin/ticket/PriorityForm';

// Стили для спиннера загрузки
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--color-primary);
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }
  
  .loading-spinner-small {
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 2px solid var(--color-primary);
    width: 16px;
    height: 16px;
    animation: spin 0.8s linear infinite;
  }
  
  .button-text {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    padding: 4px 8px;
    cursor: pointer;
    border-radius: var(--border-radius);
    transition: all 0.2s;
  }
  
  .button-text:hover {
    color: var(--color-text);
    background-color: var(--color-background-tertiary);
  }
  
  .file-upload-preview {
    position: relative;
    display: inline-block;
    margin-bottom: 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }
  
  .file-upload-preview:hover {
    transform: scale(1.02);
  }
  
  .file-upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
  }
`;

// Интерфейсы для работы с API
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

interface ApiPhoto {
  id: number;
  ticket_id: number;
  sender_type: string;
  sender_id: number;
  file_path: string;
  file_id: string;
  message_id?: number;
  created_at: string;
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

// Функция для обратного преобразования статуса в формат API
const mapStatusToApi = (status: string): string => {
  switch (status) {
    case 'open':
      return 'открыт';
    case 'in-progress':
      return 'в работе';
    case 'resolved':
      return 'решён';
    case 'closed':
      return 'закрыт';
    default:
      return 'открыт';
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

// Функция для корректного формирования URL изображений через API
const getImageUrl = (imagePath: string): string => {
  // Проверка наличия пути
  if (!imagePath) return '';
  
  console.log('Обработка пути изображения:', imagePath);
  
  
  // Если путь начинается с /api, то оставляем его без изменений
  if (imagePath.startsWith('/api')) {
    return imagePath;
  }
  
  // Обработка файлов в формате UUID для нашей системы
  if (imagePath.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/) || 
      imagePath.includes('file_')) {
    return `/api/tickets/photos/${imagePath}`;
  }
  
  // Если в пути есть /uploads, обрабатываем как локальный файл на сервере
  if (imagePath.includes('/uploads/')) {
    // Получаем полный путь, добавляя при необходимости префикс /api
    const fullPath = imagePath.startsWith('/') ? `/api${imagePath}` : `/api/${imagePath}`;
    return `/api/` + fullPath;
  }
  
  // Если путь содержит tickets/ID/photos или аналогичный формат
  if (imagePath.match(/tickets\/\d+\/photos/) || imagePath.match(/tickets\/\d+\/[a-f0-9-]+\.(jpg|png|jpeg)/)) {
    return `/api/${imagePath}`;
  }
  
  // Обработка числовых идентификаторов фотографий
  if (/^\d+$/.test(imagePath)) {
    return `/api/tickets/photos/${imagePath}`;
  }
  
  // Пути без явных префиксов обрабатываем как uploads
  if (imagePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return `/api/uploads/${imagePath}`;
  }
  
  // Для всех остальных случаев форматируем как обычный путь к загрузкам
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `/api/uploads/${cleanPath}`;
};

const PhotoComponent = component$<{photoUrl: string; photoId: number | string}>(({photoUrl, photoId}) => {
  const imageLoaded = useSignal(true);
  const imageError = useSignal(false);
  
  return (
    <div style="margin-top: 12px; position: relative;">
      {imageError.value ? (
        <div style="padding: 12px; border: 1px solid var(--color-border); border-radius: var(--border-radius); background-color: var(--color-background-tertiary); text-align: center; color: var(--color-text-secondary);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 8px;">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div>Не удалось загрузить изображение</div>
          <a 
            href={photoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style="display: inline-block; margin-top: 8px; font-size: 14px; color: var(--color-primary);"
          >
            Открыть в новой вкладке
          </a>
        </div>
      ) : (
        <>
          {!imageLoaded.value && (
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; background-color: var(--color-background-tertiary); border-radius: var(--border-radius); border: 1px solid var(--color-border);">
              <div class="loading-spinner" style="width: 24px; height: 24px;"></div>
            </div>
          )}
          <a href={photoUrl} target="_blank" rel="noopener noreferrer">
            <img 
              src={photoUrl} 
              alt={`Прикрепленное фото #${photoId}`} 
              style="max-width: 300px; max-height: 200px; border-radius: var(--border-radius); border: 1px solid var(--color-border);"
              onLoad$={() => { imageLoaded.value = true; }}
              onError$={() => { 
                imageLoaded.value = true;
                imageError.value = true; 
              }}
            />
          </a>
        </>
      )}
    </div>
  );
});

const formatMessageText = (text: string): string => {
  if (!text) return '';
  
  // Заменяем перенос строки на HTML тег <br>
  return text.replace(/\n/g, '<br>');
};

export default component$(() => {
  const location = useLocation();
  const ticketId = location.params.id;
  
  // Сигналы для данных
  const ticket = useSignal<ApiTicket | null>(null);
  const messages = useSignal<ApiMessage[]>([]);
  const photos = useSignal<ApiPhoto[]>([]);
  const isLoading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);
  const replyText = useSignal<string>('');
  
  // Сигналы для загрузки файлов
  const selectedFile = useSignal<any>(null); // изменяем тип на any для работы с noSerialize
  const fileInputRef = useSignal<HTMLInputElement>();
  const filePreviewUrl = useSignal<string>('');
  const uploadingFile = useSignal<boolean>(false);
  const uploadError = useSignal<string | null>(null);
  const uploadSuccess = useSignal<boolean>(false);
  const fileName = useSignal<string>(''); // Добавляем хранение имени файла
  const fileSize = useSignal<number>(0); // Добавляем хранение размера файла
  const fileType = useSignal<string>(''); // Добавляем хранение типа файла
  
  // UI сигналы
  const showStatusForm = useSignal(false);
  const showAssignForm = useSignal(false);
  const showPriorityForm = useSignal(false);
  const replyTextareaRef = useSignal<HTMLTextAreaElement>();
  const shouldFocusTextarea = useSignal(false);
  const sendingReply = useSignal<boolean>(false);
  
  // Дополнительные UI сигналы
  const messagesEndRef = useSignal<HTMLDivElement>();
  const loadingMessages = useSignal<boolean>(false);
  
  // Функция для прокрутки к последнему сообщению
  const scrollToBottom = $(() => {
    if (messagesEndRef.value) {
      messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  // Загрузка данных тикета
  useVisibleTask$(async () => {
    try {
      isLoading.value = true;
      const response = await fetch(`/api/tickets/${ticketId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Тикет не найден');
        }
        throw new Error('Не удалось загрузить данные тикета');
      }
      
      const data = await response.json();
      
      // Проверяем структуру данных
      if (!data.ticket) {
        console.warn('API вернул неправильную структуру данных:', data);
        throw new Error('Неверный формат данных');
      }
      
      ticket.value = data.ticket;
      messages.value = data.messages || [];
      photos.value = data.photos || [];
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Произошла ошибка';
      console.error('Ошибка при загрузке тикета:', err);
    } finally {
      isLoading.value = false;
    }
  });
  
  // Автоматическая прокрутка при получении новых сообщений
  useVisibleTask$(({ track }) => {
    track(() => messages.value.length);
    
    if (messages.value.length > 0 && !loadingMessages.value) {
      // Даем небольшую задержку для рендеринга сообщений
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  });
  
  // Функция для выбора файла
  const handleFileSelect = $((event: Event) => {
    const input = event.target as HTMLInputElement;
    
    console.log('handleFileSelect вызван', input, input.files);
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      console.log('Выбран файл:', file.name, file.type, file.size);
      
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        uploadError.value = 'Можно загружать только изображения';
        return;
      }
      
      // Проверка размера файла (максимум 5 МБ)
      if (file.size > 5 * 1024 * 1024) {
        uploadError.value = 'Размер файла не должен превышать 5 МБ';
        return;
      }
      
      // Проверка на особенности macOS
      const isMacOS = /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      
      // Дополнительная проверка для файлов из macOS
      if (isMacOS && (!file.name || file.name === "image.jpg" || file.name === "image.png")) {
        console.log('Обнаружен файл с macOS, особая обработка');
        // Для macOS иногда файлы не имеют настоящего имени или имеют общее имя 
        // Попробуем сделать дополнительную проверку
      }
      
      // Используем noSerialize для хранения файла, так как File объект не может быть сериализован в Qwik
      selectedFile.value = noSerialize(file);
      
      // Сохраняем отдельно метаданные файла, которые можно сериализовать
      fileName.value = file.name;
      fileSize.value = file.size;
      fileType.value = file.type;
      
      uploadError.value = null;
      uploadSuccess.value = false;
      
      // Создаем URL для предпросмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader загрузил файл', e.target?.result ? 'успешно' : 'с ошибкой');
        filePreviewUrl.value = (e.target?.result as string) || '';
      };
      reader.onerror = (error) => {
        console.error('Ошибка чтения файла:', error);
        uploadError.value = 'Не удалось прочитать файл';
        
        // Проверяем, на какой платформе произошла ошибка
        if (/Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
          uploadError.value += ' (проблема macOS). Попробуйте использовать кнопку "Выбрать фото (macOS)"';
        }
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Ошибка при чтении файла через FileReader:', err);
        uploadError.value = 'Ошибка при чтении файла. Пожалуйста, попробуйте другой файл или кнопку для macOS';
      }
    } else {
      console.log('Файлы не выбраны или input.files пуст');
    }
  });
  
  // Новый метод для прямого вызова диалога выбора файла
  const openFileDialog = $(() => {
    console.log('Вызываем диалог выбора файла напрямую');
    if (fileInputRef.value) {
      console.log('fileInputRef найден, вызываем click()');
      fileInputRef.value.click();
    } else {
      console.log('fileInputRef не найден');
    }
  });
  
  // Функция для очистки выбранного файла
  const clearSelectedFile = $(() => {
    console.log('Очистка выбранного файла');
    selectedFile.value = null;
    filePreviewUrl.value = '';
    fileName.value = '';
    fileSize.value = 0;
    fileType.value = '';
    
    if (fileInputRef.value) {
      try {
        // Прямое присваивание пустой строки может не сработать в некоторых браузерах на macOS
        // Создаем новый DataTransfer объект для очистки
        const dt = new DataTransfer();
        fileInputRef.value.files = dt.files;
        console.log('Успешно очистили files через DataTransfer');
      } catch (e) {
        console.error('Ошибка при очистке файла через DataTransfer:', e);
        // Запасной вариант, может не работать в некоторых браузерах
        fileInputRef.value.value = '';
        console.log('Попытка очистки через value = ""');
      }
    } else {
      console.log('fileInputRef не найден при очистке');
    }
    uploadError.value = null;
  });
  
  // Загрузка только файла без отправки сообщения
  const uploadFileOnly = $(async () => {
    if (!selectedFile.value || !ticket.value) {
      console.log('Нет выбранного файла или не загружен тикет');
      return;
    }
    
    // Проверка на пустое сообщение
    if (!replyText.value.trim()) {
      uploadError.value = 'Пожалуйста, введите текст сообщения для прикрепления фото';
      return;
    }
    
    try {
      uploadingFile.value = true;
      
      // Дополнительная проверка перед загрузкой
      if (!fileName.value || fileSize.value === 0) {
        throw new Error('Выбран некорректный файл (без имени или с нулевым размером)');
      }
      
      console.log('Начинаем загрузку файла:', fileName.value);
      
      // Создаем сообщение сначала, чтобы к нему привязать фото
      const messageData = {
        sender_type: 'support',
        sender_id: 1,
        message: replyText.value.trim() || 'Прикреплено изображение',
        ticket_id: parseInt(ticketId)
      };
      
      // Отправляем запрос на создание сообщения
      const messageResponse = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (!messageResponse.ok) {
        throw new Error('Не удалось создать сообщение для загрузки фото');
      }
      
      const messageResult = await messageResponse.json();
      const messageId = messageResult.message_id;
      console.log('Создано сообщение с ID:', messageId);
      
      // Теперь загружаем фото и привязываем его к созданному сообщению
      const formData = new FormData();
      formData.append('photo', selectedFile.value);
      formData.append('sender_type', 'support');
      formData.append('sender_id', '1');
      formData.append('message_id', messageId.toString());
      formData.append('ticket_id', ticketId);
      
      // Отправляем запрос на загрузку фото
      const photoResponse = await fetch(`/api/tickets/${ticketId}/photos`, {
        method: 'POST',
        body: formData,
      });
      
      if (!photoResponse.ok) {
        const errorText = await photoResponse.text().catch(() => 'Ошибка при загрузке');
        console.error('Ошибка при загрузке фото:', photoResponse.status, errorText);
        throw new Error('Не удалось загрузить изображение: ' + errorText);
      }
      
      const photoResult = await photoResponse.json();
      const photoId = photoResult.photo_id;
      console.log('Загружено фото с ID:', photoId);
      
      // Обновляем API-связь между сообщением и фото, если API требует этого
      if (photoId && messageId) {
        try {
          const linkResponse = await fetch(`/api/tickets/link-photo`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              photo_id: photoId,
              message_id: messageId,
              ticket_id: ticketId
            }),
          });
          
          if (linkResponse.ok) {
            console.log('Фото успешно привязано к сообщению');
          } else {
            console.warn('Не удалось привязать фото к сообщению, но загрузка прошла успешно');
          }
        } catch (linkErr) {
          console.warn('Ошибка при привязке фото к сообщению:', linkErr);
        }
      }
      
      // Обновляем фотографии и сообщения
      const [messagesResponse, photosResponse] = await Promise.all([
        fetch(`/api/tickets/${ticketId}/messages`),
        fetch(`/api/tickets/${ticketId}`)
      ]);
      
      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        messages.value = data.messages || [];
      }
      
      if (photosResponse.ok) {
        const data = await photosResponse.json();
        photos.value = data.photos || [];
      }
      
      // Показываем успешную загрузку
      uploadSuccess.value = true;
      setTimeout(() => {
        clearSelectedFile();
        uploadSuccess.value = false;
      }, 2000);
      
      // Очищаем поле ввода
      replyText.value = '';
      
    } catch (err) {
      console.error('Ошибка при загрузке файла:', err);
      uploadError.value = err instanceof Error ? err.message : 'Произошла ошибка при загрузке файла';
    } finally {
      uploadingFile.value = false;
    }
  });
  
  // Обновление статуса тикета
  const updateTicketStatus = $(async (status: string) => {
    if (!ticket.value) return;
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: mapStatusToApi(status),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Не удалось обновить статус тикета');
      }
      
      // Обновляем данные тикета в UI
      if (ticket.value) {
        ticket.value = {
          ...ticket.value,
          status: mapStatusToApi(status),
        };
      }
      
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      alert('Ошибка при обновлении статуса');
    } finally {
      showStatusForm.value = false;
    }
  });
  
  // Фокусировка на текстовое поле с анимацией
  useVisibleTask$(({ track }) => {
    track(() => shouldFocusTextarea.value);
    
    if (shouldFocusTextarea.value && replyTextareaRef.value) {
      // Добавляем класс для анимации
      replyTextareaRef.value.classList.add('textarea-focus');
      
      // Скроллим к элементу, чтобы он был в центре видимой области на всех устройствах
      const textareaRect = replyTextareaRef.value.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Вычисляем положение для центрирования
      const scrollY = window.scrollY + textareaRect.top - (windowHeight / 2) + (textareaRect.height / 2);
      
      // Плавно скроллим к нужной позиции
      window.scrollTo({
        top: scrollY,
        behavior: 'smooth'
      });
      
      // Фокусируем поле
      replyTextareaRef.value.focus();
      
      // Убираем класс анимации через некоторое время
      setTimeout(() => {
        if (replyTextareaRef.value) {
          replyTextareaRef.value.classList.remove('textarea-focus');
        }
        shouldFocusTextarea.value = false;
      }, 1500);
    }
  });
  
  // Обработка нажатия клавиши Enter для отправки сообщения
  const handleKeyPress = $((event: KeyboardEvent) => {
    // Проверяем, что нажата клавиша Enter без Shift (чтобы можно было делать перенос строки с Shift+Enter)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Предотвращаем добавление новой строки
      sendReply();
    }
  });
  
  // Отправка сообщения
  const sendReply = $(async () => {
    if ((!replyText.value.trim() && !selectedFile.value) || !ticket.value) return;
    
    // Проверка на пустое сообщение
    if (!replyText.value.trim()) {
      uploadError.value = 'Пожалуйста, введите текст сообщения для прикрепления фото';
      return;
    }
    
    try {
      sendingReply.value = true;
      loadingMessages.value = true;
      
      // Создаем сообщение сначала, чтобы получить message_id для привязки фото
      let messageId = null;
      
      // Отправляем текстовое сообщение и получаем его ID
      const messageData = {
        sender_type: 'support',
        sender_id: 1, // ID поддержки
        message: replyText.value.trim() || 'Прикреплено изображение',
        ticket_id: parseInt(ticketId)
      };
      
      const messageResponse = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (!messageResponse.ok) {
        throw new Error('Не удалось отправить сообщение');
      }
      
      const messageResult = await messageResponse.json();
      messageId = messageResult.message_id;
      console.log('Создано сообщение с ID:', messageId);
      
      // Если есть файл, загружаем его и привязываем к message_id
      let photoId = null;
      if (selectedFile.value && messageId) {
        // Создаем FormData для загрузки файла
        const formData = new FormData();
        formData.append('photo', selectedFile.value);
        formData.append('sender_type', 'support');
        formData.append('sender_id', '1'); // ID поддержки
        formData.append('ticket_id', ticketId);
        formData.append('message_id', messageId.toString());
        
        console.log('Отправка файла на сервер...');
        
        const photoResponse = await fetch(`/api/tickets/${ticketId}/photos`, {
          method: 'POST',
          body: formData,
        });
        
        if (!photoResponse.ok) {
          const errorText = await photoResponse.text().catch(() => 'Ошибка при загрузке');
          console.error('Ошибка при загрузке фото:', photoResponse.status, errorText);
          throw new Error('Не удалось загрузить изображение: ' + errorText);
        }
        
        const photoResult = await photoResponse.json();
        photoId = photoResult.photo_id;
        console.log('Загружено фото с ID:', photoId);
        
        // Дополнительно связываем фото с сообщением через API
        if (photoId && messageId) {
          try {
            const linkResponse = await fetch(`/api/tickets/link-photo`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                photo_id: photoId,
                message_id: messageId,
                ticket_id: ticketId
              }),
            });
            
            if (linkResponse.ok) {
              console.log('Фото успешно привязано к сообщению');
            }
          } catch (linkErr) {
            console.warn('Ошибка при привязке фото к сообщению:', linkErr);
          }
        }
        
        // Показываем успешную загрузку на короткое время
        uploadSuccess.value = true;
        setTimeout(() => {
          uploadSuccess.value = false;
        }, 2000);
      }
      
      // Обновляем сообщения и фотографии
      const [messagesResponse, photosResponse] = await Promise.all([
        fetch(`/api/tickets/${ticketId}/messages`),
        fetch(`/api/tickets/${ticketId}`)
      ]);
      
      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        messages.value = data.messages || [];
      }
      
      if (photosResponse.ok) {
        const data = await photosResponse.json();
        photos.value = data.photos || [];
      }
      
      // Очищаем поле ввода и сбрасываем файл
      replyText.value = '';
      clearSelectedFile();
      
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
      alert('Ошибка при отправке сообщения: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'));
    } finally {
      sendingReply.value = false;
      loadingMessages.value = false;
    }
  });
  
  // Отображение загрузки
  if (isLoading.value) {
    return (
      <div class="main-content">
        <div class="loading">Загрузка данных тикета...</div>
      </div>
    );
  }
  
  // Отображение ошибки
  if (error.value || !ticket.value) {
    return (
      <div class="main-content">
        <h2>Тикет не найден</h2>
        <p>Тикет с идентификатором {ticketId} не существует или произошла ошибка: {error.value}</p>
      </div>
    );
  }
  
  // Вычисляем данные для интерфейса
  const ticketStatus = mapApiStatus(ticket.value.status);
  const ticketPriority = determinePriority(ticket.value.category);
  const formattedCreatedAt = formatDate(ticket.value.created_at);
  
  return (
    <>
      <style dangerouslySetInnerHTML={spinnerStyles}></style>
      
      <header class="header">
        <h1 class="header-title">
          #{ticket.value.id}: {ticket.value.title}
        </h1>
        <div class="header-actions">
          <button class="button button-secondary" onClick$={() => showAssignForm.value = true}>Назначить</button>
          <button class="button button-secondary" onClick$={() => showStatusForm.value = true}>Статус</button>
          <button class="button button-secondary" onClick$={() => showPriorityForm.value = true}>Приоритет</button>
          <button 
            class="button button-primary" 
            onClick$={() => shouldFocusTextarea.value = true}
          >
            Ответить
          </button>
        </div>
      </header>
      
      <div class="main-content scroll-to">
        {showStatusForm.value && (
          <StatusForm 
            onCancel$={() => showStatusForm.value = false} 
            onSave$={updateTicketStatus} 
          />
        )}
        
        {showAssignForm.value && (
          <AssignForm 
            onCancel$={() => showAssignForm.value = false} 
            onSave$={(userId) => {
              console.log('Назначение на пользователя с id', userId);
              showAssignForm.value = false;
              // В будущем: реализация назначения пользователя
            }} 
          />
        )}
        
        {showPriorityForm.value && (
          <PriorityForm 
            onCancel$={() => showPriorityForm.value = false} 
            onSave$={(priority) => {
              console.log('Изменение приоритета на', priority);
              showPriorityForm.value = false;
              // В будущем: реализация изменения приоритета
            }} 
          />
        )}
        
        <div class="detail-view-columns" style="display: flex; gap: 24px;">
          {/* Левая колонка - основная информация */}
          <div style="flex: 1; min-width: 0;">
            <div style="background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border); margin-bottom: 24px;">
              <div style="font-size: 15px; margin-bottom: 16px;">
                {ticket.value.description}
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-text-secondary);">
                <div class="avatar">ПЛ</div>
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Пользователь #{ticket.value.user_id} создал(а) тикет • {formattedCreatedAt}</div>
              </div>
            </div>
            
            {/* Комментарии */}
            <div style="margin-bottom: 24px; position: relative;">
              <h2 style="font-size: 18px; margin-bottom: 16px;">Сообщения ({messages.value.length})</h2>
              
              {loadingMessages.value && (
                <div style="position: absolute; top: 0; right: 0; background-color: var(--color-primary); color: white; padding: 4px 8px; border-radius: var(--border-radius); font-size: 13px; display: flex; align-items: center; gap: 6px; z-index: 10;">
                  <div class="loading-spinner-small" style="width: 12px; height: 12px; border-color: rgba(255, 255, 255, 0.3); border-top-color: white;"></div>
                  Обновление...
                </div>
              )}
              
              {messages.value.map(message => (
                <div key={message.id} style="background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border); margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div class="avatar">{message.sender_type === 'user' ? 'П' : 'С'}{message.sender_id.toString()[0]}</div>
                    <div style="min-width: 0;">
                      <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {message.sender_type === 'user' ? `Пользователь #${message.sender_id}` : `Поддержка #${message.sender_id}`}
                      </div>
                      <div style="font-size: 13px; color: var(--color-text-secondary);">
                        {new Date(message.created_at).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div style="font-size: 15px;">
                    <div dangerouslySetInnerHTML={formatMessageText(message.message)}></div>
                  </div>
                  
                  {/* Показываем прикрепленные фотографии */}
                  {photos.value
                    .filter(photo => photo.message_id === message.id)
                    .map(photo => (
                      <PhotoComponent
                        key={photo.id}
                        photoUrl={getImageUrl(photo.file_path || photo.file_id)}
                        photoId={photo.id}
                      />
                    ))
                  }
                </div>
              ))}
              
              {messages.value.length === 0 && (
                <div style="background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border); text-align: center; color: var(--color-text-secondary);">
                  Нет сообщений для этого тикета
                </div>
              )}
              
              {/* Невидимый элемент для прокрутки к последнему сообщению */}
              <div ref={messagesEndRef}></div>
            </div>
            
            {/* Форма ответа */}
            <div style="background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border);">
              <h3 style="font-size: 16px; margin-top: 0; margin-bottom: 16px;">Ответить на тикет</h3>
              <textarea 
                ref={replyTextareaRef}
                bind:value={replyText}
                placeholder="Введите ваш ответ..." 
                style="width: 100%; height: 120px; background-color: var(--color-background-tertiary); border: 1px solid var(--color-border); border-radius: var(--border-radius); padding: 12px; color: var(--color-text); font-family: inherit; resize: vertical; margin-bottom: 16px;"
                onKeyPress$={handleKeyPress}
              ></textarea>
              
              {/* Интерфейс загрузки файлов */}
              <div style="margin-bottom: 16px;">
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    onChange$={handleFileSelect}
                    style="display: none;" 
                    id="file-upload"
                  />
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <label 
                      for="file-upload" 
                      class="button button-secondary"
                      style="margin: 0; cursor: pointer; display: flex; align-items: center; gap: 6px;"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Прикрепить фото
                    </label>
                    
                    {filePreviewUrl.value && (
                      <>
                        <button 
                          onClick$={clearSelectedFile}
                          class="button-text"
                          title="Удалить файл"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        
                        <button 
                          onClick$={uploadFileOnly}
                          class="button button-secondary"
                          title="Загрузить только файл"
                          disabled={uploadingFile.value}
                          style="display: flex; align-items: center; gap: 4px;"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 17L10 11L13 14L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          Загрузить фото
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div style="display: flex; justify-content: flex-start;">
                    <button 
                      class="button-text"
                      onClick$={openFileDialog}
                      title="Альтернативный выбор файла для macOS"
                      style="font-size: 12px; padding: 4px 8px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px;"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 21C4.45 21 3.979 20.804 3.587 20.412C3.195 20.02 2.999 19.549 3 19V5C3 4.45 3.196 3.979 3.588 3.587C3.98 3.195 4.451 2.999 5 3H13.95L21 10.05V19C21 19.55 20.804 20.021 20.412 20.413C20.02 20.805 19.549 21.001 19 21H5ZM13 4V11H20L13 4Z" fill="currentColor"/>
                      </svg>
                      Альтернативный выбор (macOS)
                    </button>
                  </div>
                </div>
                
                {uploadError.value && (
                  <div style="color: var(--color-red); font-size: 14px; margin-bottom: 12px; padding: 8px 12px; background-color: rgba(255, 0, 0, 0.05); border-radius: var(--border-radius); border: 1px solid rgba(255, 0, 0, 0.1);">
                    <span style="display: flex; align-items: center; gap: 8px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {uploadError.value}
                    </span>
                    {uploadError.value.includes('macOS') && (
                      <div style="margin-top: 8px; font-size: 13px;">
                        Совет: Используйте кнопку "Альтернативный выбор (macOS)" вместо стандартного элемента выбора файла.
                      </div>
                    )}
                  </div>
                )}
                
                {uploadSuccess.value && (
                  <div style="color: var(--color-green); font-size: 14px; margin-bottom: 12px; padding: 8px 12px; background-color: rgba(0, 128, 0, 0.05); border-radius: var(--border-radius); border: 1px solid rgba(0, 128, 0, 0.1);">
                    <span style="display: flex; align-items: center; gap: 8px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 10L10.5 15.5L8 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Фото успешно загружено
                    </span>
                  </div>
                )}
                
                {filePreviewUrl.value && (
                  <div class="file-upload-preview">
                    <img 
                      src={filePreviewUrl.value} 
                      alt="Предпросмотр" 
                      style="max-width: 200px; max-height: 150px; display: block;"
                    />
                    
                    {uploadingFile.value && (
                      <div class="file-upload-overlay">
                        <div class="loading-spinner" style="width: 24px; height: 24px; border-color: rgba(255, 255, 255, 0.3); border-top-color: white;"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 13px; color: var(--color-text-secondary);">
                  {selectedFile.value && (
                    <span style="display: flex; align-items: center; gap: 4px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                      </svg>
                      {fileName.value} ({Math.round(fileSize.value / 1024)} КБ)
                    </span>
                  )}
                </div>
                <button 
                  class="button button-primary" 
                  onClick$={sendReply}
                  disabled={sendingReply.value || (!replyText.value.trim() && !selectedFile.value)}
                >
                  {sendingReply.value ? 'Отправка...' : 'Отправить ответ'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Правая колонка - свойства тикета */}
          <div class="detail-view-sidebar" style="width: 280px;">
            <div style="background-color: var(--color-background-secondary); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border);">
              <h3 style="font-size: 16px; margin-top: 0; margin-bottom: 16px;">Информация о тикете</h3>
              
              <div style="margin-bottom: 16px;">
                <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Статус</div>
                <div class={`status-badge status-${ticketStatus}`} style="font-size: 14px;">
                  {ticketStatus === 'open' && 'Открыт'}
                  {ticketStatus === 'in-progress' && 'В работе'}
                  {ticketStatus === 'resolved' && 'Решён'}
                  {ticketStatus === 'closed' && 'Закрыт'}
                </div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Приоритет</div>
                <div style="font-size: 14px;">
                  {ticketPriority === 'high' && <span style="color: var(--color-red);">Высокий</span>}
                  {ticketPriority === 'medium' && <span style="color: var(--color-yellow);">Средний</span>}
                  {ticketPriority === 'low' && <span style="color: var(--color-blue);">Низкий</span>}
                </div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Категория</div>
                <div style="font-size: 14px;">{ticket.value.category || 'Не указана'}</div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Создан</div>
                <div style="font-size: 14px;">{formattedCreatedAt}</div>
              </div>
              
              {ticket.value.closed_at && (
                <div style="margin-bottom: 16px;">
                  <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Закрыт</div>
                  <div style="font-size: 14px;">{formatDate(ticket.value.closed_at)}</div>
                </div>
              )}
              
              <div style="margin-bottom: 16px;">
                <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Пользователь</div>
                <div style="font-size: 14px; display: flex; align-items: center; gap: 8px;">
                  <div class="avatar">П{ticket.value.user_id.toString()[0]}</div>
                  <a href={`/admin/users/${ticket.value.user_id}`} style="text-decoration: none; color: var(--color-primary);">
                    Пользователь #{ticket.value.user_id}
                  </a>
                </div>
              </div>
              
              {/* Фотографии, не привязанные к сообщениям */}
              {photos.value.filter(photo => !photo.message_id).length > 0 && (
                <div>
                  <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px;">Прикрепленные файлы</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                    {photos.value
                      .filter(photo => !photo.message_id)
                      .map(photo => (
                        <PhotoComponent
                          key={photo.id}
                          photoUrl={getImageUrl(photo.file_path || photo.file_id)}
                          photoId={photo.id}
                        />
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = ({ params }) => {
  return {
    title: `Тикет #${params.id} | SupportTicket`,
  };
}; 