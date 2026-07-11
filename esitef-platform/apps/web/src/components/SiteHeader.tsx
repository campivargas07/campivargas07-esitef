import { auth } from "@/auth";
import { SiteNavbar } from "./SiteNavbar";

export async function SiteHeader() {
  const session = await auth();
  return <SiteNavbar user={session?.user} />;
}
