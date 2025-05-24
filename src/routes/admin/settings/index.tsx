import { component$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <>
      <header class="header">
        <h1 class="header-title">Настройки</h1>
      </header>
      
      <div class="main-content" style="overflow-y: auto;">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 16px;">Настройки системы</h2>
          <p style="color: var(--color-text-secondary); margin-bottom: 24px;">
            Здесь вы можете настроить основные параметры работы системы тикетов.
          </p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
            <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M23 21V19C23 16.7909 21.2091 15 19 15H18M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM19 11C21.2091 11 23 9.20914 23 7C23 4.79086 21.2091 3 19 3C16.7909 3 15 4.79086 15 7C15 9.20914 16.7909 11 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 style="font-size: 16px; font-weight: 500;">Пользователи и доступы</h3>
              </div>
              <p style="color: var(--color-text-secondary); font-size: 14px;">
                Управление пользователями, ролями и уровнями доступа в системе.
              </p>
            </div>

            <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 style="font-size: 16px; font-weight: 500;">Настройка тикетов</h3>
              </div>
              <p style="color: var(--color-text-secondary); font-size: 14px;">
                Настройка статусов, приоритетов и других параметров тикетов.
              </p>
            </div>

            <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 style="font-size: 16px; font-weight: 500;">Уведомления</h3>
              </div>
              <p style="color: var(--color-text-secondary); font-size: 14px;">
                Настройка уведомлений по email, в браузере и другие способы оповещения.
              </p>
            </div>

            <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 style="font-size: 16px; font-weight: 500;">Автоматизация</h3>
              </div>
              <p style="color: var(--color-text-secondary); font-size: 14px;">
                Настройка автоматических действий, таких как назначение тикетов и эскалация.
              </p>
            </div>

            <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 style="font-size: 16px; font-weight: 500;">Интеграции</h3>
              </div>
              <p style="color: var(--color-text-secondary); font-size: 14px;">
                Подключение внешних сервисов и API для расширения функциональности.
              </p>
            </div>

            <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16L8.58579 11.4142C9.36684 10.6332 10.6332 10.6332 11.4142 11.4142L16.5858 16.5858C17.3668 17.3668 18.6332 17.3668 19.4142 16.5858L20 16M14 8.5C14 9.32843 13.3284 10 12.5 10C11.6716 10 11 9.32843 11 8.5C11 7.67157 11.6716 7 12.5 7C13.3284 7 14 7.67157 14 8.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 style="font-size: 16px; font-weight: 500;">Внешний вид</h3>
              </div>
              <p style="color: var(--color-text-secondary); font-size: 14px;">
                Настройка темы оформления, логотипов и брендирования интерфейса.
              </p>
            </div>

            <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 18.364L17.6569 17.6569M6.34315 6.34315L5.63604 5.63604M18.364 5.63609L17.6569 6.3432M6.3432 17.6569L5.63609 18.364M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 style="font-size: 16px; font-weight: 500;">Шаблоны ответов</h3>
              </div>
              <p style="color: var(--color-text-secondary); font-size: 14px;">
                Создание и редактирование шаблонов ответов для быстрой обработки тикетов.
              </p>
            </div>
            
            <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19V13C9 11.8954 8.10457 11 7 11H5C3.89543 11 3 11.8954 3 13V19C3 20.1046 3.89543 21 5 21H7C8.10457 21 9 20.1046 9 19ZM9 19V9C9 7.89543 9.89543 7 11 7H13C14.1046 7 15 7.89543 15 9V19M9 19C9 20.1046 9.89543 21 11 21H13C14.1046 21 15 20.1046 15 19M15 19V5C15 3.89543 15.8954 3 17 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H17C15.8954 21 15 20.1046 15 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 style="font-size: 16px; font-weight: 500;">Аналитика</h3>
              </div>
              <p style="color: var(--color-text-secondary); font-size: 14px;">
                Настройка сбора статистики, отчетов и метрик производительности.
              </p>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 40px;">
          <h2 style="font-size: 20px; margin-bottom: 16px;">Общие настройки</h2>
          
          <div style="background-color: var(--color-background-secondary); border-radius: var(--border-radius); border: 1px solid var(--color-border); padding: 24px;">
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; margin-bottom: 8px;">Название системы</h3>
              <input 
                type="text" 
                value="SupportTicket" 
                style="width: 100%; max-width: 400px; padding: 10px; background-color: var(--color-background-tertiary); border: 1px solid var(--color-border); border-radius: var(--border-radius); color: var(--color-text); font-size: 14px;" 
              />
            </div>
            
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; margin-bottom: 8px;">Email для уведомлений</h3>
              <input 
                type="email" 
                value="support@example.com" 
                style="width: 100%; max-width: 400px; padding: 10px; background-color: var(--color-background-tertiary); border: 1px solid var(--color-border); border-radius: var(--border-radius); color: var(--color-text); font-size: 14px;" 
              />
            </div>
            
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; margin-bottom: 8px;">Язык по умолчанию</h3>
              <select 
                style="width: 100%; max-width: 400px; padding: 10px; background-color: var(--color-background-tertiary); border: 1px solid var(--color-border); border-radius: var(--border-radius); color: var(--color-text); font-size: 14px;"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; margin-bottom: 8px;">Часовой пояс</h3>
              <select 
                style="width: 100%; max-width: 400px; padding: 10px; background-color: var(--color-background-tertiary); border: 1px solid var(--color-border); border-radius: var(--border-radius); color: var(--color-text); font-size: 14px;"
              >
                <option value="Europe/Moscow">Москва (GMT+3)</option>
                <option value="Europe/London">Лондон (GMT+0)</option>
                <option value="America/New_York">Нью-Йорк (GMT-5)</option>
              </select>
            </div>
            
            <div>
              <button class="button button-primary">Сохранить настройки</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Настройки | SupportTicket',
}; 