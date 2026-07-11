"use client";

import { useState } from "react";

type Item = { title: string; content: string };

export function HubAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="accordion-container">
      {items.map((item, i) => (
        <HubFaqItem
          key={item.title}
          title={item.title}
          content={item.content}
          expanded={open === i}
          onToggle={() => setOpen(open === i ? null : i)}
        />
      ))}
    </div>
  );
}

function HubFaqItem({
  title,
  content,
  expanded,
  onToggle,
}: {
  title: string;
  content: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`accordion-item hub-faq__item${expanded ? " active" : ""}`}>
      <button
        type="button"
        className="accordion-header hub-faq__question"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span>{title}</span>
        <span className="accordion-icon" aria-hidden="true">
          +
        </span>
      </button>
      <div className="accordion-content hub-faq__answer">
        <div className="accordion-content-inner">
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
}

export function HubPlanningAccordion({
  title,
  description,
  planning,
}: {
  title: string;
  description?: string;
  planning: Array<{ month: string; items: string[] }>;
}) {
  const [open, setOpen] = useState<number | null>(null);

  if (!planning.length) return null;

  return (
    <section className="hub-planning hub-planning--accordion course-syllabus">
      <div className="syllabus-card">
        <div className="syllabus-bg" aria-hidden="true" />
        <div className="syllabus-inner">
          <div className="syllabus-left">
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <div className="accordion-container">
            {planning.map((module, i) => (
              <HubPlanningItem
                key={module.month}
                module={module}
                expanded={open === i}
                onToggle={() => setOpen(open === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HubPlanningItem({
  module,
  expanded,
  onToggle,
}: {
  module: { month: string; items: string[] };
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`accordion-item${expanded ? " active" : ""}`}>
      <button
        type="button"
        className="accordion-header"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span>{module.month}</span>
        <span className="accordion-icon" aria-hidden="true">
          +
        </span>
      </button>
      <div className="accordion-content">
        <div className="accordion-content-inner">
          <ul className="hub-planning__list">
            {module.items.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
