import { AdminContactoPanel } from "@/components/admin/AdminContactoPanel";

export default async function AdminContactoPage() {
  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Contacto</h1>
          <p>Mensajes recibidos desde el formulario de contacto.</p>
        </div>
      </header>

      <AdminContactoPanel />
    </>
  );
}
