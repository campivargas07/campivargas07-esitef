import { cookies } from "next/headers";
import {
  normalizeOnlineCurrency,
  ONLINE_CURRENCY_COOKIE,
} from "@/lib/online-currency";
import { getSesionOnlinePrice } from "@/lib/sesiones-online";

export async function getSesionOnlinePriceFromCookies() {
  const cookieStore = await cookies();
  const preferred = normalizeOnlineCurrency(
    cookieStore.get(ONLINE_CURRENCY_COOKIE)?.value,
  );
  return getSesionOnlinePrice(preferred);
}
