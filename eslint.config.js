import js from '@eslint/js';
import qwik from 'eslint-plugin-qwik';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // Применяем базовые рекомендуемые правила для JS
  js.configs.recommended,
  
  // Настройки для TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      typescript,
      '@typescript-eslint': typescript
    },
    rules: {
      ...typescript.configs.recommended.rules,
      // Отключаем проверку неиспользуемых переменных
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  
  // Настройки для Qwik
  {
    plugins: { qwik },
    rules: {
      'qwik/no-use-visible-task': 'off', // Отключаем предупреждение о useVisibleTask
      'qwik/jsx-img': 'warn',
      'qwik/jsx-key': 'warn',
      'qwik/no-react-props': 'warn',
      'qwik/use-method-usage': 'warn'
    }
  },
  
  // Глобальные настройки
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        // Добавляем глобальные типы браузерных API
        TouchEvent: 'readonly',
        HTMLElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        addEventListener: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
        EventListenerOptions: 'readonly',
        // Другие глобальные объекты
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly'
      }
    },
    ignores: ['**/node_modules/**', '**/dist/**', '**/.vscode/**', '**/build/**'],
    rules: {
      'no-unused-vars': 'off',      // Отключаем проверку неиспользуемых переменных
      'no-console': 'off',          // Отключаем предупреждения о консольных вызовах  
      'prefer-const': 'warn',
      'no-undef': 'warn'            // Снижаем уровень ошибки для необъявленных переменных
    }
  }
]; 