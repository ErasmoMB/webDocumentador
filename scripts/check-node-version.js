/* eslint-disable no-console */

const REQUIRED_MAJOR = 22;

function getMajor(version) {
  const major = Number(String(version).split(".")[0]);
  return Number.isFinite(major) ? major : null;
}

const currentVersion = process.versions?.node;
const currentMajor = getMajor(currentVersion);

if (currentMajor !== REQUIRED_MAJOR) {
  const message = [
    "[node] Versión de Node no recomendada para este repo.",
    `  - Detectado: ${currentVersion ?? "desconocido"}`,
    `  - Requerido: ${REQUIRED_MAJOR}.x (LTS)`,
    "  - Motivo: CI/Render corren Node 22; evita diferencias local vs producción.",
    "  - Fix (Windows): nvm-windows -> nvm install 22; nvm use 22",
    "  - Fix (Volta): volta install node@22",
    "",
    "Para convertir este aviso en error, ejecutá con STRICT_NODE=1.",
  ].join("\n");

  const strict = process.env.STRICT_NODE === "1";
  const isCI = process.env.CI === "true" || process.env.CI === "1";

  if (strict || isCI) {
    console.error(message);
    process.exit(1);
  } else {
    console.warn(message);
  }
}
