import { component$, Slot } from '@builder.io/qwik';
import Sidebar from './Sidebar';
import '../admin/admin-styles.css';

export default component$(() => {
  return (
    <div class="admin-container">
      <Sidebar />
      
      <div class="content">
        <Slot />
      </div>
    </div>
  );
}); 