import { component$, useSignal, useOnDocument, $, useVisibleTask$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import '../admin/admin-styles.css';

export default component$(() => {
  const location = useLocation();
  const isSidebarOpen = useSignal(false);
  const isSwipeInProgress = useSignal(false);
  
  // Координаты начала и конца свайпа
  const touchStartX = useSignal(0);
  const touchEndX = useSignal(0);
  const swipeProgress = useSignal(0);
  
  // Проверяем размер экрана при монтировании и настраиваем обработчики свайпа
  useVisibleTask$(({ cleanup }) => {
    const isMobile = window.innerWidth <= 576;
    isSidebarOpen.value = !isMobile;
    
    // Определяем функции-обработчики касаний
    const handleTouchStart = (e: TouchEvent) => {
      // Сохраняем начальную позицию касания
      touchStartX.value = e.touches[0].clientX;
      
      // Если касание началось с левого края или меню открыто
      if (touchStartX.value < 60 || isSidebarOpen.value) {
        isSwipeInProgress.value = true;
        
        // Если свайп начался у края, блокируем прокрутку
        if (touchStartX.value < 60 || isSidebarOpen.value) {
          document.body.classList.add('no-scroll');
        }
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipeInProgress.value) return;
      
      // Сохраняем текущую позицию
      touchEndX.value = e.touches[0].clientX;
      
      // Предотвращаем прокрутку страницы при свайпе от края
      if (
        (touchStartX.value < 60 && touchEndX.value > touchStartX.value) || // свайп вправо от левого края
        (isSidebarOpen.value && touchEndX.value < touchStartX.value) // свайп влево при открытом меню
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Обновляем индикатор свайпа
      updateSwipeIndicator();
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwipeInProgress.value) return;
      
      // Скрываем индикатор свайпа
      const indicator = document.querySelector('.swipe-indicator');
      if (indicator) {
        indicator.classList.remove('active');
        (indicator as HTMLElement).style.opacity = '0';
      }
      
      // Определяем свайп вправо (для открытия меню)
      if (!isSidebarOpen.value && touchEndX.value - touchStartX.value > 40) {
        isSidebarOpen.value = true;
        e.preventDefault();
      }
      
      // Определяем свайп влево (для закрытия меню)
      if (isSidebarOpen.value && touchStartX.value - touchEndX.value > 40) {
        isSidebarOpen.value = false;
        e.preventDefault();
      }
      
      // Восстанавливаем прокрутку - важно всегда восстанавливать скролл
      document.body.classList.remove('no-scroll');
      
      // Сбрасываем состояние свайпа
      isSwipeInProgress.value = false;
      swipeProgress.value = 0;
    };
    
    // Вспомогательная функция для обновления индикатора свайпа
    const updateSwipeIndicator = () => {
      // Вычисляем прогресс свайпа
      if (!isSidebarOpen.value) {
        // При открытии (свайп вправо)
        swipeProgress.value = Math.min(1, Math.max(0, (touchEndX.value - touchStartX.value) / 50));
      } else {
        // При закрытии (свайп влево)
        swipeProgress.value = Math.min(1, Math.max(0, (touchStartX.value - touchEndX.value) / 50));
      }
      
      // Обновляем индикатор
      const indicator = document.querySelector('.swipe-indicator');
      if (indicator && swipeProgress.value > 0) {
        indicator.classList.add('active');
        (indicator as HTMLElement).style.opacity = `${swipeProgress.value * 0.6}`;
      }
    };
    
    // Функция для прерывания свайпа, если пользователь отменит его
    const handleTouchCancel = () => {
      if (isSwipeInProgress.value) {
        // Восстанавливаем прокрутку
        document.body.classList.remove('no-scroll');
        
        // Скрываем индикатор свайпа
        const indicator = document.querySelector('.swipe-indicator');
        if (indicator) {
          indicator.classList.remove('active');
          (indicator as HTMLElement).style.opacity = '0';
        }
        
        // Сбрасываем состояние свайпа
        isSwipeInProgress.value = false;
        swipeProgress.value = 0;
      }
    };
    
    // Обработчики событий касания для всего документа
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchCancel);
    
    // Удаляем обработчики при размонтировании компонента
    cleanup(() => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
      document.body.classList.remove('no-scroll');
    });
  });
  
  // Закрывать сайдбар при клике вне его на мобильных устройствах
  useOnDocument('click', $((event: any) => {
    const isMobile = window.innerWidth <= 576;
    if (isMobile && isSidebarOpen.value) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(event.target)) {
        isSidebarOpen.value = false;
      }
    }
  }));
  
  const isActive = (path: string) => {
    return location.url.pathname.startsWith(path);
  };

  return (
    <>
      <div class={`sidebar ${isSidebarOpen.value ? 'open' : ''}`}>
        <div class="sidebar-logo">SupportTicket</div>
        
        <nav class="sidebar-nav">
          <Link
            href="/admin"
            class={`sidebar-nav-item ${isActive('/admin') && !isActive('/admin/settings') ? 'active' : ''}`}
            onClick$={() => {
              if (window.innerWidth <= 576) {
                isSidebarOpen.value = false;
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 4L21 9V20H3V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Обзор</span>
          </Link>
          
          <Link
            href="/admin/tickets"
            class={`sidebar-nav-item ${isActive('/admin/tickets') ? 'active' : ''}`}
            onClick$={() => {
              if (window.innerWidth <= 576) {
                isSidebarOpen.value = false;
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Тикеты</span>
          </Link>
          
          <Link
            href="/admin/users"
            class={`sidebar-nav-item ${isActive('/admin/users') ? 'active' : ''}`}
            onClick$={() => {
              if (window.innerWidth <= 576) {
                isSidebarOpen.value = false;
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M23 21V19C23 16.7909 21.2091 15 19 15H18M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM19 11C21.2091 11 23 9.20914 23 7C23 4.79086 21.2091 3 19 3C16.7909 3 15 4.79086 15 7C15 9.20914 16.7909 11 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Пользователи</span>
          </Link>
          
          <Link
            href="/admin/settings"
            class={`sidebar-nav-item ${isActive('/admin/settings') ? 'active' : ''}`}
            onClick$={() => {
              if (window.innerWidth <= 576) {
                isSidebarOpen.value = false;
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M19.4 15C19.1276 15.6171 19.2829 16.3378 19.8 16.6L19.9 16.7C20.3418 17.0594 20.5964 17.5988 20.5964 18.1667C20.5964 18.7346 20.3418 19.274 19.9 19.6334C19.5582 19.9928 19.0188 20.2473 18.4509 20.2473C17.883 20.2473 17.3436 19.9928 17.0018 19.6334L16.9018 19.5334C16.6396 19.0163 15.9189 18.861 15.3018 19.1334C14.7068 19.3933 14.3534 20.0017 14.3518 20.6667V20.8667C14.3518 22.0672 13.3856 23.0334 12.1851 23.0334C10.9846 23.0334 10.0184 22.0672 10.0184 20.8667V20.7334C10.001 20.0457 9.61814 19.4209 9 19.1667C8.38285 18.8943 7.66218 19.0496 7.4 19.5667L7.3 19.6667C6.95858 20.0261 6.41918 20.2806 5.85127 20.2806C5.28336 20.2806 4.74395 20.0261 4.40254 19.6667C3.96074 19.3073 3.70617 18.7679 3.70617 18.2C3.70617 17.6321 3.96074 17.0927 4.40254 16.7333L4.50254 16.6333C5.01963 16.3711 5.17496 15.6504 4.90254 15.0333C4.64264 14.4383 4.03428 14.085 3.36936 14.0833H3.16936C1.96882 14.0833 1.00262 13.1171 1.00262 11.9166C1.00262 10.7161 1.96882 9.74991 3.16936 9.74991H3.30254C3.99026 9.73251 4.61508 9.34965 4.86936 8.73325C5.14177 8.11611 4.98644 7.39544 4.46936 7.13325L4.36936 7.03325C3.92756 6.67391 3.67299 6.13451 3.67299 5.5666C3.67299 4.99869 3.92756 4.45928 4.36936 4.09994C4.71078 3.74051 5.25018 3.48594 5.81809 3.48594C6.386 3.48594 6.9254 3.74051 7.26682 4.09994L7.36682 4.19994C7.62901 4.71702 8.34968 4.87235 8.96682 4.59994H9.06682C9.66178 4.34004 10.0151 3.73168 10.0168 3.06676V2.86676C10.0168 1.66622 10.983 0.700012 12.1836 0.700012C13.3841 0.700012 14.3503 1.66622 14.3503 2.86676V2.96676C14.352 3.63167 14.7054 4.24003 15.3003 4.49994C15.9175 4.77235 16.6381 4.61702 16.9003 4.09994L17.0003 3.99994C17.3417 3.64051 17.8811 3.38594 18.449 3.38594C19.0169 3.38594 19.5563 3.64051 19.8978 3.99994C20.3396 4.35928 20.5941 4.89869 20.5941 5.4666C20.5941 6.03451 20.3396 6.57391 19.8978 6.93325L19.7978 7.03325C19.2807 7.29544 19.1254 8.01611 19.3978 8.63325V8.73325C19.6577 9.32822 20.266 9.68155 20.931 9.6832H21.1309C22.3315 9.6832 23.2977 10.6494 23.2977 11.85C23.2977 13.0505 22.3315 14.0167 21.1309 14.0167H21.0309C20.3432 14.0341 19.7184 14.417 19.4642 15.0352L19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Настройки</span>
          </Link>
        </nav>
      </div>

      {/* Невидимая область для определения свайпа от края экрана */}
      <div class="swipe-area"></div>
      
      {/* Индикатор свайпа */}
      <div class="swipe-indicator"></div>
    </>
  );
}); 