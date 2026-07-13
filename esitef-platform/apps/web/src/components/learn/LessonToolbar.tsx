"use client";

type Panel = "notes" | "discussions" | null;

type Props = {
  activePanel: Panel;
  onPanelChange: (panel: Panel) => void;
};

export function LessonToolbar({ activePanel, onPanelChange }: Props) {
  return (
    <div className="learn-toolbar" role="toolbar" aria-label="Herramientas de lección">
      <button
        type="button"
        className={activePanel === "notes" ? "is-active" : undefined}
        onClick={() =>
          onPanelChange(activePanel === "notes" ? null : "notes")
        }
      >
        Notas
      </button>
      <button
        type="button"
        className={activePanel === "discussions" ? "is-active" : undefined}
        onClick={() =>
          onPanelChange(activePanel === "discussions" ? null : "discussions")
        }
      >
        Discusión
      </button>
    </div>
  );
}
