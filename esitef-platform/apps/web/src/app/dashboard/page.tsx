import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { A11Y_COOKIE } from "@/lib/accessibility";
import {
  getStudentDashboard,
  parseDashboardTab,
} from "@/lib/dashboard";
import "@/styles/dashboard.css";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/ingresar");

  const params = await searchParams;
  const activeTab = parseDashboardTab(params.tab);
  const data = await getStudentDashboard(session.user.id);
  const a11yCookie = (await cookies()).get(A11Y_COOKIE)?.value ?? null;

  return (
    <DashboardView
      user={session.user}
      data={data}
      activeTab={activeTab}
      a11yCookie={a11yCookie}
    />
  );
}
