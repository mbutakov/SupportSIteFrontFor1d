import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import NavHeader from "~/components/NavHeader";

export default component$(() => {
  return (
    <>
      <NavHeader />
      
      <div style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '24px', fontSize: 'clamp(24px, 5vw, 32px)' }}>Система поддержки SupportTicket</h1>
        <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: '#666', marginBottom: '32px', padding: '0 12px' }}>
          Добро пожаловать в систему поддержки. Для управления тикетами перейдите в админ-панель.
        </p>
        
        <a 
          href="/admin" 
          style={{ 
            display: 'inline-block',
            backgroundColor: '#5E6AD2',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Перейти в админ-панель
        </a>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "SupportTicket - Система поддержки",
  meta: [
    {
      name: "description",
      content: "Система управления тикетами технической поддержки",
    },
  ],
};
