import { DashboardLayoutChrome } from "@/components/dashboard/DashboardLayoutChrome";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutChrome>{children}</DashboardLayoutChrome>;
}
