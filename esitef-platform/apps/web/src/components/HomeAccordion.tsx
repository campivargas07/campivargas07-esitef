"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OFRECEMOS_ITEMS } from "@/lib/navigation";

export function HomeAccordion() {
  const [active, setActive] = useState(0);
  const router = useRouter();

  return (
    <section className="ofrecemos-section" aria-label="Qué ofrecemos">
      <div className="ofrecemos-inner">
        <h2 className="ofrecemos-titulo">Ofrecemos</h2>

        <div className="accordion-container">
          {OFRECEMOS_ITEMS.map((item, i) => (
            <div
              key={item.num}
              className={`accordion-item${active === i ? " active" : ""}`}
              tabIndex={0}
              role="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
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
