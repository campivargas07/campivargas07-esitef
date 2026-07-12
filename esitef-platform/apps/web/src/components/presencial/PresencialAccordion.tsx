"use client";

import { useState } from "react";
import type { PresencialProgramModule } from "@/lib/presenciales";

export function PresencialAccordion({
  items,
  closeOthers = true,
  className = "accordion-item",
  headerClassName = "accordion-header",
}: {
  items: PresencialProgramModule[];
  closeOthers?: boolean;
  className?: string;
  headerClassName?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="accordion-container">
      {items.map((module, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={module.title}
            className={`${className}${isOpen ? " active" : ""}`}
          >
            <button
              type="button"
              className={headerClassName}
              aria-expanded={isOpen}
              onClick={() => {
                if (isOpen) {
                  setOpenIndex(null);
                  return;
                }
                setOpenIndex(closeOthers ? index : index);
              }}
            >
              {module.title}
              <span className="accordion-icon">+</span>
            </button>
            <div className="accordion-content">
              <div className="accordion-content-inner">
                {module.items?.length > 0 && (
                  <ul className="presencial-program-list">
                    {module.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TeacherAccordion({
  professors,
}: {
  professors: {
    name: string;
    role?: string;
    image?: string;
    bio?: string[];
  }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="teachers-grid-cascada">
      {professors.map((professor, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={professor.name}
            className={`teacher-card accordion-item${isOpen ? " active" : ""}`}
          >
            {professor.image && (
              <div className="teacher-avatar-corner">
                <img src={professor.image} alt={professor.name} />
              </div>
            )}
            <button
              type="button"
              className="teacher-toggle accordion-header"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="teacher-toggle__info">
                <span className="teacher-name">{professor.name}</span>
                {professor.role && (
                  <span className="teacher-role">{professor.role}</span>
                )}
              </span>
              <span className="accordion-icon" aria-hidden>
                +
              </span>
            </button>
            <div className="teacher-bio accordion-content">
              <div className="accordion-content-inner">
                {professor.bio && professor.bio.length > 0 && (
                  <ul>
                    {professor.bio.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
