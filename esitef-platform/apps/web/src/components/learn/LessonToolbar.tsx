"use client";

type Panel = "overview" | "notes" | "discussions";

type Props = {
  activePanel: Panel;
  onPanelChange: (panel: Panel) => void;
};

const TABS: { id: Panel; label: string }[] = [
  { id: "overview", label: "Resumen" },
  { id: "notes", label: "Notas" },
  { id: "discussions", label: "Comentarios" },
];

export function LessonToolbar({ activePanel, onPanelChange }: Props) {
  return (
    <div className="learn-tabs" role="tablist" aria-label="Secciones de la lección">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activePanel === tab.id}
          className={activePanel === tab.id ? "is-active" : undefined}
          onClick={() => onPanelChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
