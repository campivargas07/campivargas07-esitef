"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  prompt: string;
  options: string[];
};

export function QuizForm({
  quizId,
  courseSlug,
  questions,
  passingScore,
}: {
  quizId: string;
  courseSlug: string;
  questions: Question[];
  passingScore: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  async function submit() {
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers }),
    });
    const data = (await res.json()) as { score: number; passed: boolean };
    setResult(data);
    if (data.passed) {
      setTimeout(() => router.push(`/certificados/${courseSlug}`), 1500);
    }
  }

  return (
    <div className="card">
      {questions.map((q, idx) => (
        <fieldset key={q.id} style={{ border: "none", marginBottom: "1.25rem" }}>
          <legend style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            {idx + 1}. {q.prompt}
          </legend>
          {q.options.map((opt, optIdx) => (
            <label key={optIdx} style={{ display: "block", marginBottom: "0.35rem" }}>
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === optIdx}
                onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
              />{" "}
              {opt}
            </label>
          ))}
        </fieldset>
      ))}
      <button className="btn btn-primary" onClick={submit}>
        Enviar quiz
      </button>
      {result && (
        <p style={{ marginTop: "1rem" }}>
          Puntuación: {result.score}% —{" "}
          {result.passed ? `Aprobado (mínimo ${passingScore}%)` : "No aprobado"}
        </p>
      )}
    </div>
  );
}
