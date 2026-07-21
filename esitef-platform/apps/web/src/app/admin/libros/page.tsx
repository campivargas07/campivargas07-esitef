import { AdminLibrosPanel } from "@/components/admin/AdminLibrosPanel";

export default async function AdminLibrosPage({
  searchParams,
}: {
  searchParams: Promise<{ libroKey?: string }>;
}) {
  const params = await searchParams;
  const libroKey =
    params.libroKey && params.libroKey !== "all" ? params.libroKey : undefined;

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Libros</h1>
          <p>Sube los PDFs y consulta quién descargó cada libro.</p>
        </div>
      </header>

      <AdminLibrosPanel libroKey={libroKey} />
    </>
  );
}
