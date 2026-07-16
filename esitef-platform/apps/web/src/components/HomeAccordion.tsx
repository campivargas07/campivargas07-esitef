"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OFRECEMOS_ITEMS } from "@/lib/navigation";

const MOBILE_MQ = "(max-width: 991px)";

export function HomeAccordion() {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ratiosRef = useRef<Record<number, number>>({});
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const pickActive = () => {
      let bestIdx = 0;
      let bestRatio = 0;
      for (const [idx, ratio] of Object.entries(ratiosRef.current)) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestIdx = Number(idx);
        }
      }
      if (bestRatio > 0) setActive(bestIdx);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isNaN(idx)) continue;
          ratiosRef.current[idx] = entry.intersectionRatio;
        }
        pickActive();
      },
      {
        threshold: Array.from({ length: 11 }, (_, i) => i / 10),
        rootMargin: "-18% 0px -18% 0px",
      }
    );

    for (const el of itemRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <section className="ofrecemos-section" aria-label="Qué ofrecemos">
      <div className="ofrecemos-inner">
        <h2 className="ofrecemos-titulo">Ofrecemos</h2>

        <div className="accordion-container">
          {OFRECEMOS_ITEMS.map((item, i) => (
            <div
              key={item.num}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              data-index={i}
              className={`accordion-item${active === i ? " active" : ""}`}
              tabIndex={0}
              role="button"
              onMouseEnter={() => {
                if (!isMobile) setActive(i);
              }}
              onFocus={() => {
                if (!isMobile) setActive(i);
              }}
              onClick={() => router.push(item.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(item.href);
                }
              }}
            >
              <div className="accordion-content">
                <span className="accordion-number">{item.num}</span>
                <div className="accordion-text">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
              <div className="accordion-image">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 991px) 100vw, 400px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
