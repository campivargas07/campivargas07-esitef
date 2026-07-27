import { AdminMatriculasPanel } from "@/components/admin/AdminMatriculasPanel";
import { listAdminCourseOptions } from "@/lib/admin-enrollments";

export default async function AdminMatriculasPage() {
  const courses = await listAdminCourseOptions();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Matrículas</h1>
          <p>
            Asigna acceso a un curso online a un usuario (compras legacy o
            correcciones).
          </p>
        </div>
      </header>

      <AdminMatriculasPanel courses={courses} />
    </>
  );
}
