import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div style="height: 100%; overflow: auto;">
      <style>{`
        /* Адаптивная верстка для раздела пользователей */
        .user-detail-grid {
          grid-template-columns: minmax(0, 1fr) 300px;
        }
        
        .user-sidebar-mobile {
          display: none;
        }
        
        .ticket-item {
          display: flex;
          align-items: center;
          padding: 12px;
        }
        
        .status-badge {
          margin-right: 16px;
        }
        
        /* Медиа-запросы для адаптации под мобильные устройства */
        @media (max-width: 1024px) {
          .user-detail-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          
          .user-sidebar-desktop {
            display: none;
          }
          
          .user-sidebar-mobile {
            display: block;
          }
        }
        
        @media (max-width: 768px) {
          /* Стили для карточек пользователей на странице списка */
          .header-title {
            font-size: 1.5rem;
          }
          
          .header-actions .button {
            padding: 8px 12px;
            font-size: 14px;
          }
        }
        
        @media (max-width: 480px) {
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .header-actions {
            width: 100%;
            display: flex;
          }
          
          .header-actions .button {
            flex-grow: 1;
          }
          
          .avatar {
            min-width: 40px;
          }
        }
      `}</style>
      <Slot />
    </div>
  );
}); 