export default function GraciasPage() {
  return (
    <div className="container" style={{ padding: "3rem 0" }}>
      <div className="card">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>¡Gracias por tu compra!</h1>
        <p style={{ marginTop: "1rem", color: "var(--color-text-muted)" }}>
          Tu pago está siendo confirmado. El acceso al curso se activará automáticamente
          cuando recibamos la confirmación del proveedor de pago (webhook).
        </p>
        <a href="/dashboard" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          Ir a mi cuenta
        </a>
      </div>
    </div>
  );
}
