"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CurrencyFlag } from "@/components/CurrencyFlag";
import {
  ONLINE_CURRENCY_OPTIONS,
  type OnlineCurrency,
  getCurrencyOption,
  normalizeOnlineCurrency,
} from "@/lib/online-currency";

type Props = {
  initialCurrency: OnlineCurrency;
};

export function CurrencySelector({ initialCurrency }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<OnlineCurrency>(
    normalizeOnlineCurrency(initialCurrency)
  );
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = getCurrencyOption(currency);

  useEffect(() => {
    setCurrency(normalizeOnlineCurrency(initialCurrency));
  }, [initialCurrency]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function selectCurrency(next: OnlineCurrency) {
    if (next === currency) {
      setOpen(false);
      return;
    }
    setCurrency(next);
    setOpen(false);
    const res = await fetch("/api/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ currency: next }),
    });
    if (!res.ok) return;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="currency-selector" ref={rootRef}>
      <button
        type="button"
        className={`currency-selector__trigger${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Moneda: ${current.code}`}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        <CurrencyFlag
          currency={currency}
          className="currency-selector__flag"
          size={18}
        />
        <span className="currency-selector__code">{current.code}</span>
        <span className="currency-selector__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          id={listId}
          className="currency-selector__menu"
          role="listbox"
          aria-label="Seleccionar moneda"
        >
          {ONLINE_CURRENCY_OPTIONS.map((option) => {
            const selected = option.code === currency;
            return (
              <li key={option.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`currency-selector__option${
                    selected ? " is-selected" : ""
                  }`}
                  aria-label={option.code}
                  onClick={() => selectCurrency(option.code)}
                >
                  <CurrencyFlag
                    currency={option.code}
                    className="currency-selector__flag"
                    size={20}
                  />
                  <span className="currency-selector__option-code">
                    {option.code}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
