import { AdminNewsletterPanel } from "@/components/admin/AdminNewsletterPanel";

export default async function AdminNewsletterPage() {
  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Newsletter</h1>
          <p>Suscriptores activos del newsletter.</p>
        </div>
      </header>

      <AdminNewsletterPanel />
    </>
  );
}
