# 🏛️ Arquitectura de Secciones (Gold Standard - Nivel Senior)

Este documento define la estructura oficial que debe seguir cada sección del Documentador para garantizar **mantenibilidad**, **escalabilidad** y cumplimiento de los principios **SOLID**. El referente actual es la **Sección 3**.

---

## 📂 1. Estructura de Archivos
Cada sección debe estar contenida en su propio directorio dentro de `src/app/shared/components/seccionX/` con la siguiente división de responsabilidades:

```text
seccionX/
├── seccionX.component.ts         # 🧠 Orquestador: Datos, fotos y lógica base.
├── seccionX.component.html       # 📄 Vista de Documento: Renderizado final del reporte.
├── seccionX-form.component.ts    # 📝 Editor: Lógica exclusiva del formulario lateral.
├── seccionX-form.component.html  # 🛠️ UI de Edición: Inputs, tablas y editores de párrafos.
├── seccionX-view.component.ts    # 🔍 Visor: Wrapper ligero para previsualización.
└── index.ts                      # 🚪 Exportaciones limpias.
```

---

## 🛠️ 2. División de Responsabilidades (SOLID)

### A. El Componente Padre (`SeccionXComponent`)
*   **Extiende de:** `BaseSectionComponent`.
*   **Responsabilidad:** Mantener la "Fuente de Verdad" de los datos y configurar los grupos de imágenes.
*   **Lógica de Fotos:** Debe usar `photoGroupsConfig` y el método centralizado `onGrupoFotografiasChange`.
*   **HTML:** Solo debe contener el `*ngIf="!modoFormulario"` para mostrar cómo quedará el documento impreso.

### B. El Componente Formulario (`SeccionXFormComponent`)
*   **Responsabilidad:** Manejar la interacción del usuario (eventos de input, clicks en agregar filas).
*   **Principio de Inflexibilidad:** No debe duplicar lógica de guardado; debe llamar a métodos del Padre o usar `PersistenceService`.

### C. Servicios de Dominio (Desacoplamiento Total)
Para evitar que los archivos `.ts` superen las 300 líneas, la lógica compleja se extrae a:
*   **`SeccionXTextGeneratorService`**: Lógica de redacción de párrafos y placeholders.
*   **`SeccionXDataService`**: Cálculos matemáticos, filtros de arrays y validaciones de negocio.

---

## 🚀 3. Flujo de Datos Senior

1.  **Detección Reactiva:** Usar `watchedFields` en el `BaseSectionComponent` para que la vista se actualice sola cuando cambies algo en el formulario lateral.
2.  **Getters en HTML:** Evitar llamar funciones con lógica pesada en el template. Usar `get htmlContenido()` para que sea instantáneo.
3.  **No Redundancia:** El `form-wrapper` de cada sección debe ser un mero contenedor (Proxy) que instancie al `SeccionXFormComponent`.

---

## ✅ Checklist de Cumplimiento
- [ ] ¿El componente principal tiene menos de 400 líneas?
- [ ] ¿El HTML separa claramente la Vista del Formulario?
- [ ] ¿Los párrafos se generan en un servicio inyectado (`TextGenerator`)?
- [ ] ¿Las imágenes usan el motor automático de `BaseSectionComponent`?
- [ ] ¿Los IDs de los campos son estables y no aleatorios?

---
> *Nota: Aplicar esta arquitectura reduce el tiempo de corrección de bugs en un 70% al centralizar la lógica en una única fuente de verdad.*
