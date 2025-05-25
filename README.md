# 🎯 Комплексная система поддержки пользователей

Полнофункциональная система поддержки пользователей, состоящая из четырех взаимосвязанных компонентов:
веб-интерфейса, API-сервера, Telegram-бота и iOS-приложения.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.16%2B-blue?logo=go)
![Swift](https://img.shields.io/badge/Swift-5.9-orange.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue?logo=postgresql)

## 📚 Содержание

- [Обзор системы](#-обзор-системы)
- [Компоненты системы](#-компоненты-системы)
- [Архитектура](#-архитектура)
- [Установка и настройка](#-установка-и-настройка)
- [API Документация](#-api-документация)
- [Скриншоты](#-скриншоты)
- [Разработка](#-разработка)
- [Лицензия](#-лицензия)

## 🌟 Обзор системы

Система поддержки пользователей предоставляет полный набор инструментов для организации службы поддержки:

- 💬 Многоканальное общение (веб, Telegram, iOS)
- 🎫 Система тикетов с категориями и приоритетами
- 👥 Управление пользователями и агентами поддержки
- 📸 Поддержка медиа-вложений (фото, документы)
- 📊 Статистика и аналитика
- 🔔 Уведомления о новых обращениях
- 🌐 Единый API для всех платформ

## 🧩 Компоненты системы

### 1. [SupportSIteFrontFor1d](https://github.com/mbutakov/SupportSIteFrontFor1d)
Веб-интерфейс для агентов поддержки
- **Технологии**: Qwik, TypeScript, Vite
- **Особенности**: 
  - Современный адаптивный интерфейс
  - Чат в стиле мессенджера
  - Управление тикетами и пользователями
  - Загрузка и просмотр вложений

### 2. [SupportAPIFor1d](https://github.com/mbutakov/SupportAPIFor1d)
REST API сервер
- **Технологии**: Go, Gin, PostgreSQL
- **Особенности**:
  - RESTful API
  - Работа с файлами
  - Авторизация и безопасность
  - Масштабируемая архитектура

### 3. [SupportBotFor1d](https://github.com/mbutakov/SupportBotFor1d)
Telegram бот для пользователей
- **Технологии**: Go, Telegram Bot API
- **Особенности**:
  - Регистрация пользователей
  - Создание и управление тикетами
  - Отправка фото и документов
  - Интеграция с основным API

### 4. [1dApp](https://github.com/mbutakov/1dApp)
iOS приложение
- **Технологии**: Swift, SwiftUI, Combine
- **Особенности**:
  - Нативный iOS интерфейс
  - Поддержка iOS 17+
  - Офлайн режим
  - Push-уведомления

## 🏗 Архитектура

```mermaid
graph TD
    %% Пользовательская ветка
    U[Пользователь]:::user --> B[Telegram Бот]:::telegram
    B --> G[Обработчик Telegram-бота]:::botlogic
    G -- Ответ напрямую --> B
    G -- Запрос за данными --> D[API Сервер]:::api
    B -- Прямой запрос --> D

    %% Администраторская ветка
    A1[Администратор]:::admin --> A[Веб-интерфейс]:::frontend
    A1 --> C[iOS Приложение]:::frontend
    A --> D
    C --> D

    %% API взаимодействия
    D --> E[(PostgreSQL)]:::storage
    D --> F[Файловое хранилище]:::storage

    %% Стили
    classDef user fill:#cce5ff,stroke:#3399ff,stroke-width:2px;
    classDef telegram fill:#e6f2ff,stroke:#3399ff;
    classDef botlogic fill:#b3d1ff,stroke:#0066cc,stroke-width:2px;
    classDef admin fill:#d4edda,stroke:#28a745,stroke-width:2px;
    classDef frontend fill:#e2f7e1,stroke:#28a745;
    classDef api fill:#ffe5b4,stroke:#ff9900,stroke-width:2px;
    classDef storage fill:#fff3cd,stroke:#ffcc00;

```

### Взаимодействие компонентов

1. **API Сервер** является центральным звеном системы
2. **Веб-интерфейс**, **Telegram-бот** и **iOS-приложение** работают через API
3. Все данные хранятся в единой **PostgreSQL** базе данных
4. Файлы и медиа хранятся в отдельном хранилище

## 🚀 Установка и настройка

### Предварительные требования

- PostgreSQL 12+
- Go 1.16+
- Node.js 16+
- Xcode 15+ (для iOS)
- Docker (опционально)

### 1. Настройка базы данных

```bash
# Создание базы данных
psql -U postgres
CREATE DATABASE support_system;
\q

# Применение схемы
psql -U postgres -d support_system -f schema.sql
```

### 2. Запуск API сервера

```bash
cd SupportAPIFor1d
go mod download
go run main.go
```

### 3. Запуск веб-интерфейса

```bash
cd SupportSIteFrontFor1d
npm install
npm run dev
```

### 4. Настройка Telegram бота

```bash
cd SupportBotFor1d
cp config.example.json config.json
# Настройте config.json
go run main.go
```

### 5. Сборка iOS приложения

```bash
cd 1dApp
pod install
open 1dApp.xcworkspace
```

## 📡 API Документация

Подробная документация API доступна в формате OpenAPI (Swagger):
- [API Documentation](https://api-docs.example.com)

### Основные эндпоинты

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/tickets` | Список тикетов |
| GET | `/api/tickets/:id` | Информация о тикете |
| POST | `/api/tickets` | Создание тикета |
| GET | `/api/users` | Список пользователей |
| POST | `/api/tickets/:id/messages` | Отправка сообщения |

## 📸 Скриншоты

### Веб-интерфейс
![Admin Dashboard](docs/images/admin-dashboard.png)
*Панель администратора*

### iOS Приложение
<img src="docs/images/ios-app.png" width="300" alt="iOS App"/>

### Telegram Бот
![Telegram Bot](docs/images/telegram-bot.png)

### Панель администратора
![Admin Dashboard](docs/images/admin-dashboard.png)
*Главная страница панели администратора с обзором тикетов и статистикой*

### Просмотр тикета
![Ticket View](docs/images/ticket-view.png)
*Страница просмотра тикета с диалогом в стиле мессенджера*

### Список пользователей
![Users List](docs/images/users-list.png)
*Страница управления пользователями*

## 👨‍💻 Разработка

### Структура репозиториев

```
support-system/
├── SupportSIteFrontFor1d/   # Веб-интерфейс
├── SupportAPIFor1d/         # API сервер
├── SupportBotFor1d/        # Telegram бот
└── 1dApp/                  # iOS приложение
```

### Рекомендации по разработке

1. Используйте единый стиль кода
2. Следуйте семантическому версионированию
3. Пишите тесты для критического функционала
4. Документируйте изменения в CHANGELOG.md

## 🔒 Безопасность

- Все API-запросы защищены токенами
- Валидация входных данных
- Безопасная работа с файлами
- Логирование действий
- Защита от XSS и CSRF

## 📈 Масштабирование

- Горизонтальное масштабирование API
- Кэширование частых запросов
- Оптимизация работы с БД
- Балансировка нагрузки

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл для подробностей.

## 👥 Авторы

- mbutakov - [@mbutakov](https://github.com/mbutakov)

---
Разработано с ❤️ командой mbutakov

## 🔄 История изменений

См. [CHANGELOG.md](CHANGELOG.md) для списка изменений.

---
Разработано с ❤️ командой mbutakov
