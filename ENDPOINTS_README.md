## 📚 Listado de endpoints (módulo `demograficos`)
Todos los endpoints requieren en el body una lista de códigos de CCPP.
POST `/demograficos/datos` — población por sexo (por CCPP)
POST `/demograficos/pet-grupo` — PET por grupo etario (por CCPP)
POST `/demograficos/pea` — PEA por sexo (por CCPP)
POST `/demograficos/pea-ocupada-desocupada` — PEA ocupada/desocupada (por CCPP)
POST `/demograficos/etario` (por CCPP)
POST `/demograficos/condicion-ocupacion` (por CCPP)
POST `/demograficos/materiales-construccion` (por CCPP)
POST `/demograficos/saneamiento` (por CCPP)
POST `/demograficos/alumbrado` (por CCPP)
POST `/demograficos/seguro-salud` (por CCPP)
POST `/demograficos/educacion` (por CCPP)
POST `/demograficos/alfabetizacion` (por CCPP)
POST `/demograficos/idh` (por CCPP)
POST `/demograficos/nbi` (por CCPP)
POST `/demograficos/nbi-v2` (por CCPP)
POST `/demograficos/actividad-economica` (por CCPP)
POST `/demograficos/tipo-vivienda` (por CCPP)

Endpoints "por CPP" (aceptan lista de CCPP):
- POST `/demograficos/condicion-ocupacion-cpp` — body: `{ codigos: string[], mode?: string }`
- POST `/demograficos/materiales-por-cpp`
- POST `/demograficos/abastecimiento-agua-por-cpp`
- POST `/demograficos/saneamiento-por-cpp`
- POST `/demograficos/alumbrado-por-cpp`
- POST `/demograficos/combustibles-cocina-por-cpp`
- POST `/demograficos/seguro-salud-por-cpp`
- POST `/demograficos/religion-por-cpp`  ← **nuevo** (SP: `sp_religion_por_cp`)
- POST `/demograficos/lengua`
- POST `/demograficos/abastecimiento-agua`

---