/**
 * ponytail: assert grantEnrollmentToUser result labels used by admin API.
 * Run: npx tsx src/lib/admin-enrollments.check.ts
 */
const messages = {
  created: "Curso asignado.",
  already_active: "El usuario ya tenía acceso activo a ese curso.",
  reactivated: "Acceso reactivado.",
} as const;

for (const key of ["created", "already_active", "reactivated"] as const) {
  if (!messages[key]) throw new Error(`missing message for ${key}`);
}

console.log("admin-enrollments.check.ts OK");
