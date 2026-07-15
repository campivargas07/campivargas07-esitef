import { cookies } from "next/headers";
import { auth } from "@/auth";
import { SiteNavbar } from "./SiteNavbar";
import {
  ONLINE_CURRENCY_COOKIE,
  normalizeOnlineCurrency,
} from "@/lib/online-currency";

export async function SiteHeader() {
  const session = await auth();
  const cookieStore = await cookies();
  const currency = normalizeOnlineCurrency(
    cookieStore.get(ONLINE_CURRENCY_COOKIE)?.value
  );
  return <SiteNavbar user={session?.user} currency={currency} />;
}
