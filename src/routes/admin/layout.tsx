import { component$, Slot } from '@builder.io/qwik';
import AdminLayout from '~/components/admin/AdminLayout';

export default component$(() => {
  return (
    <AdminLayout>
      <Slot />
    </AdminLayout>
  );
}); 