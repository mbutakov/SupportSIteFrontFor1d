import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <header style={{
      backgroundColor: '#ffffff',
      padding: '16px 24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ fontWeight: 600, fontSize: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#333' }}>
          SupportTicket
        </Link>
      </div>
      
      <nav>
        <Link 
          href="/admin" 
          style={{ 
            textDecoration: 'none', 
            backgroundColor: '#5E6AD2', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '4px',
            fontWeight: 500,
            display: 'inline-block'
          }}
        >
          Перейти в админ-панель
        </Link>
      </nav>
    </header>
  );
}); 