# 🏗️ Arquitectura Completa del Sistema - webDocumentador

**Versión:** 1.0  
**Fecha:** 10 de febrero de 2026

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo Completo del Proyecto](#flujo-completo-del-proyecto)
4. [Sistema de Prefijos](#sistema-de-prefijos)
5. [Sistema de Numeración Global](#sistema-de-numeración-global)
6. [Componentes Clave](#componentes-clave)

---

## 🎯 Visión General

**webDocumentador** es una aplicación web para la documentación de proyectos mineros que permite:

- Cargar datos de centros poblados desde archivos JSON
- Crear grupos dinámicos AISD (Comunidades Campesinas) y AISI (Distritos)
- Documentar cada grupo con secciones específicas
- Generar documentos exportables (PDF/JSON)
- Aislar datos entre grupos usando prefijos
- Numerar imágenes y tablas globalmente

---

## 🏛️ Arquitectura del Sistema

### Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Capa de Presentación (UI)"
        A[Usuario]
        B[Componentes de Sección]
        C[Form-Wrapper]
        D[View-Component]
        E[Form-Component]
    end
    
    subgraph "Capa de Estado (State Layer)"
        F[UIStoreContract]
        G[ProjectState Signal]
        H[Selectors]
        I[Commands]
        J[Reducers]
    end
    
    subgraph "Capa de Servicios (Services)"
        K[ProjectStateFacade]
        L[GroupConfigService]
        M[GlobalNumberingService]
        N[PrefijoHelper]
        O[FormChangeService]
    end
    
    subgraph "Capa de Persistencia (Persistence)"
        P[localStorage]
        Q[PersistenceService]
    end
    
    subgraph "Capa de Exportación (Export)"
        R[ExportService]
        S[PDFRenderer]
        T[JSONExporter]
    end
    
    A --> B
    B --> C
    C --> E
    B --> D
    E --> K
    D --> K
    K --> F
    F --> G
    G --> H
    I --> J
    J --> G
    K --> L
    K --> M
    K --> N
    K --> O
    G --> Q
    Q --> P
    H --> R
    R --> S
    R --> T
    
    style A fill:#e1f5ff
    style G fill:#fff4e1
    style K fill:#e8f5e9
    style P fill:#fce4ec
    style R fill:#f3e5f5
```

### Diagrama de Capas Detallado

```mermaid
graph TB
    subgraph "PRESENTATION LAYER"
        direction TB
        A1[Pages]
        A2[Features]
        A3[Shared Components]
        A4[Forms]
    end
    
    subgraph "STATE LAYER"
        direction TB
        B1[ProjectState]
        B2[Selectors]
        B3[Commands]
        B4[Reducers]
        B5[UIStoreContract]
    end
    
    subgraph "SERVICES LAYER"
        direction TB
        C1[ProjectStateFacade]
        C2[GroupConfigService]
        C3[GlobalNumberingService]
        C4[PrefijoHelper]
        C5[FormChangeService]
        C6[ImageStorageService]
    end
    
    subgraph "PERSISTENCE LAYER"
        direction TB
        D1[PersistenceService]
        D2[localStorage]
    end
    
    subgraph "EXPORT LAYER"
        direction TB
        E1[ExportService]
        E2[PDFRenderer]
        E3[JSONExporter]
    end
    
    A1 --> B5
    A2 --> B5
    A3 --> B5
    A4 --> B5
    B5 --> B1
    B1 --> B2
    B3 --> B4
    B4 --> B1
    B5 --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C1 --> C5
    C1 --> C6
    B1 --> D1
    D1 --> D2
    B2 --> E1
    E1 --> E2
    E1 --> E3
    
    style A1 fill:#e3f2fd
    style A2 fill:#e3f2fd
    style A3 fill:#e3f2fd
    style A4 fill:#e3f2fd
    style B1 fill:#fff3e0
    style B2 fill:#fff3e0
    style B3 fill:#fff3e0
    style B4 fill:#fff3e0
    style B5 fill:#fff3e0
    style C1 fill:#e8f5e9
    style C2 fill:#e8f5e9
    style C3 fill:#e8f5e9
    style C4 fill:#e8f5e9
    style C5 fill:#e8f5e9
    style C6 fill:#e8f5e9
    style D1 fill:#fce4ec
    style D2 fill:#fce4ec
    style E1 fill:#f3e5f5
    style E2 fill:#f3e5f5
    style E3 fill:#f3e5f5
```

---

## 🔄 Flujo Completo del Proyecto

### Flujo de Usuario - Desde el Inicio hasta la Exportación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S1 as Sección 1
    participant S2 as Sección 2
    participant GS as GroupConfigService
    participant PS as ProjectState
    participant PNS as PrefijoHelper
    participant GNS as GlobalNumberingService
    participant ES as ExportService
    
    U->>S1: 1. Ingresa nombre del proyecto
    U->>S1: 2. Carga archivo JSON
    S1->>PS: 3. Guarda JSON en estado
    S1->>GS: 4. Parsea JSON para grupos
    
    GS->>GS: 5. Identifica grupos AISD (KEYs)
    GS->>GS: 6. Identifica grupos AISI (DIST únicos)
    GS->>PS: 7. Guarda configuración de grupos
    
    U->>S2: 8. Navega a Sección 2
    S2->>GS: 9. Muestra grupos identificados
    U->>S2: 10. Selecciona/deselecciona CP
    U->>S2: 11. Crea nuevos grupos (opcional)
    S2->>GS: 12. Actualiza configuración
    GS->>PS: 13. Persiste cambios
    
    U->>S2: 14. Navega a sección de grupo (ej: 3.1.4.B.1)
    S2->>PNS: 15. Extrae prefijo (_B1)
    S2->>PS: 16. Lee datos con prefijo
    U->>S2: 17. Edita datos (tablas, fotos, párrafos)
    S2->>PS: 18. Guarda con prefijo (_B1)
    
    U->>S2: 19. Navega a otro grupo (ej: 3.1.4.B.2)
    S2->>PNS: 20. Extrae prefijo (_B2)
    S2->>PS: 21. Lee datos con prefijo (_B2)
    Note over S2,PS: Datos aislados de B.1
    
    U->>S2: 22. Solicita numeración de tabla
    S2->>GNS: 23. Calcula número global
    GNS->>S2: 24. Retorna número (ej: 3.15)
    
    U->>S2: 25. Solicita numeración de foto
    S2->>GNS: 26. Calcula número global
    GNS->>S2: 27. Retorna número (ej: 3.8)
    
    U->>ES: 28. Solicita exportación
    ES->>PS: 29. Lee todos los datos
    ES->>GNS: 30. Obtiene numeración global
    ES->>ES: 31. Genera documento
    ES->>U: 32. Descarga PDF/JSON
```

### Flujo de Datos - Escritura

```mermaid
graph LR
    A[Usuario] -->|Evento| B[Componente]
    B -->|dispatch| C[Command]
    C -->|Procesa| D[Reducer]
    D -->|Nuevo Estado| E[ProjectState]
    E -->|Signal.update| F[UI Actualizada]
    E -->|Auto-save| G[PersistenceService]
    G -->|Guarda| H[localStorage]
    
    style A fill:#e1f5ff
    style E fill:#fff4e1
    style H fill:#fce4ec
```

### Flujo de Datos - Lectura

```mermaid
graph LR
    A[ProjectState] -->|Lee| B[Selector]
    B -->|Transforma| C[computed Signal]
    C -->|Reactividad| D[UI Binding]
    D -->|Muestra| E[Usuario]
    
    style A fill:#fff4e1
    style C fill:#e8f5e9
    style E fill:#e1f5ff
```

---

## 🔐 Sistema de Prefijos

### Flujo de Aislamiento de Datos

```mermaid
graph TB
    A[Usuario navega a 3.1.4.B.1] --> B[PrefijoHelper.obtenerPrefijoGrupo]
    B --> C[Prefijo: _B1]
    C --> D[Lectura de datos]
    D --> E[centroPobladoAISI_B1]
    D --> F[ubicacionCpTabla_B1]
    D --> G[fotografia_B1]
    E --> H[Componente muestra datos B.1]
    F --> H
    G --> H
    
    I[Usuario navega a 3.1.4.B.2] --> J[PrefijoHelper.obtenerPrefijoGrupo]
    J --> K[Prefijo: _B2]
    K --> L[Lectura de datos]
    L --> M[centroPobladoAISI_B2]
    L --> N[ubicacionCpTabla_B2]
    L --> O[fotografia_B2]
    M --> P[Componente muestra datos B.2]
    N --> P
    O --> P
    
    style C fill:#e8f5e9
    style K fill:#fff3e0
    style H fill:#e1f5ff
    style P fill:#fce4ec
```

### Diagrama de Aislamiento entre Grupos

```mermaid
graph TB
    subgraph "GRUPO AISI: B.1"
        A1[URL: 3.1.4.B.1.*]
        A2[Prefijo: _B1]
        A3[centroPobladoAISI_B1]
        A4[ubicacionCpTabla_B1]
        A5[fotografia_B1]
        A6[CP: 0214090010, 0214090059...]
    end
    
    subgraph "GRUPO AISI: B.2"
        B1[URL: 3.1.4.B.2.*]
        B2[Prefijo: _B2]
        B3[centroPobladoAISI_B2]
        B4[ubicacionCpTabla_B2]
        B5[fotografia_B2]
        B6[CP: 403060001, 403060002...]
    end
    
    subgraph "GRUPO AISI: B.3"
        C1[URL: 3.1.4.B.3.*]
        C2[Prefijo: _B3]
        C3[centroPobladoAISI_B3]
        C4[ubicacionCpTabla_B3]
        C5[fotografia_B3]
        C6[CP: códigos diferentes]
    end
    
    A1 --> A2
    A2 --> A3
    A2 --> A4
    A2 --> A5
    A2 --> A6
    
    B1 --> B2
    B2 --> B3
    B2 --> B4
    B2 --> B5
    B2 --> B6
    
    C1 --> C2
    C2 --> C3
    C2 --> C4
    C2 --> C5
    C2 --> C6
    
    style A2 fill:#e8f5e9
    style B2 fill:#fff3e0
    style C2 fill:#fce4ec
```

---

## 🔢 Sistema de Numeración Global

### Flujo de Numeración de Tablas

```mermaid
graph TB
    A[Sección solicita número de tabla] --> B[GlobalNumberingService]
    B --> C{Tipo de sección?}
    C -->|Sección base| D[Calcula offset base]
    C -->|Grupo AISD| E[Calcula offset AISD]
    C -->|Grupo AISI| F[Calcula offset AISI]
    
    E --> G[Offset = (grupoIndex - 1) * 36]
    F --> H[Offset = (numAISD * 36) + (grupoIndex - 1) * 22]
    
    D --> I[Número = 3 + offset + tablaIndex]
    G --> I
    H --> I
    
    I --> J[Retorna número global]
    J --> K[Componente muestra Cuadro 3.XX]
    
    style B fill:#e8f5e9
    style I fill:#fff4e1
    style K fill:#e1f5ff
```

### Flujo de Numeración de Fotos

```mermaid
graph TB
    A[Sección solicita número de foto] --> B[GlobalNumberingService]
    B --> C[Obtiene contador global de fotos]
    C --> D[Calcula número = 3 + contador + fotoIndex]
    D --> E[Retorna número global]
    E --> F[Componente muestra Foto 3.XX]
    
    style B fill:#e8f5e9
    style D fill:#fff4e1
    style F fill:#e1f5ff
```

### Ejemplo de Numeración Global

```mermaid
graph TB
    subgraph "SECCIONES BASE"
        A1[Sección 1]
        A2[Sección 2]
        A3[Sección 3]
    end
    
    subgraph "GRUPO AISD: A.1"
        B1[A.1.1]
        B2[A.1.2]
        B3[A.1.3]
    end
    
    subgraph "GRUPO AISD: A.2"
        C1[A.2.1]
        C2[A.2.2]
        C3[A.2.3]
    end
    
    subgraph "GRUPO AISI: B.1"
        D1[B.1.1]
        D2[B.1.2]
        D3[B.1.3]
    end
    
    subgraph "GRUPO AISI: B.2"
        E1[B.2.1]
        E2[B.2.2]
        E3[B.2.3]
    end
    
    A1 -->|Tablas: 3.1-3.5| F[Contador global]
    A2 -->|Tablas: 3.6-3.10| F
    A3 -->|Tablas: 3.11-3.15| F
    B1 -->|Tablas: 3.16-3.20| F
    B2 -->|Tablas: 3.21-3.25| F
    B3 -->|Tablas: 3.26-3.30| F
    C1 -->|Tablas: 3.31-3.35| F
    C2 -->|Tablas: 3.36-3.40| F
    C3 -->|Tablas: 3.41-3.45| F
    D1 -->|Tablas: 3.46-3.50| F
    D2 -->|Tablas: 3.51-3.55| F
    D3 -->|Tablas: 3.56-3.60| F
    E1 -->|Tablas: 3.61-3.65| F
    E2 -->|Tablas: 3.66-3.70| F
    E3 -->|Tablas: 3.71-3.75| F
    
    style F fill:#fff4e1
```

---

## 🧩 Componentes Clave

### Estructura de Componentes

```mermaid
graph TB
    subgraph "BaseSectionComponent"
        A[obtenerPrefijoGrupo]
        B[obtenerGrupoActualAISI]
        C[obtenerCCPPIdsDelGrupoAISI]
        D[onFieldChange]
        E[onGrupoFotografiasChange]
    end
    
    subgraph "SeccionXFormComponent"
        F[formDataSignal]
        G[parrafoSignal]
        H[fotosCacheSignal]
        I[photoFieldsHash]
        J[viewModel]
        K[EFFECT 1]
        L[EFFECT 2]
    end
    
    subgraph "SeccionXViewComponent"
        M[formDataSignal]
        N[parrafoSignal]
        O[fotosCacheSignal]
        P[photoFieldsHash]
        Q[viewModel]
        R[EFFECT 1]
        S[EFFECT 2]
    end
    
    A --> F
    A --> M
    B --> F
    B --> M
    C --> F
    C --> M
    D --> F
    E --> H
    F --> J
    G --> J
    H --> J
    K --> F
    L --> H
    M --> Q
    N --> Q
    O --> Q
    R --> M
    S --> O
    
    style A fill:#e8f5e9
    style J fill:#fff4e1
    style Q fill:#fce4ec
```

### Servicios Principales

```mermaid
graph TB
    subgraph "ProjectStateFacade"
        A1[selectField]
        A2[selectSectionFields]
        A3[selectTableData]
        A4[setField]
        A5[setFields]
        A6[setTableData]
        A7[groupsByType]
        A8[allPopulatedCenters]
    end
    
    subgraph "GroupConfigService"
        B1[getAISDGroups]
        B2[getAISIGroups]
        B3[setAISICCPPActivos]
        B4[setAISDCCPPActivos]
    end
    
    subgraph "GlobalNumberingService"
        C1[getGlobalTableNumber]
        C2[getGlobalPhotoNumber]
        C3[calculateTableOffset]
        C4[getAISDGroups]
        C5[getAISIGroups]
    end
    
    subgraph "PrefijoHelper"
        D1[obtenerPrefijoGrupo]
        D2[obtenerValorConPrefijo]
    end
    
    subgraph "FormChangeService"
        E1[persistFields]
        E2[notifySync]
    end
    
    A1 --> B1
    A2 --> B2
    A7 --> B1
    A7 --> B2
    A1 --> C1
    A1 --> C2
    C3 --> C1
    C4 --> C3
    C5 --> C3
    A1 --> D2
    D1 --> D2
    A4 --> E1
    A5 --> E1
    
    style A1 fill:#e8f5e9
    style C1 fill:#fff4e1
    style D1 fill:#fce4ec
    style E1 fill:#f3e5f5
```

---

## 📊 Resumen del Flujo Completo

### Desde el Inicio hasta la Exportación

```mermaid
graph TB
    A[Usuario inicia aplicación] --> B[Sección 1: Carga de Datos]
    B --> C[Ingresa nombre del proyecto]
    C --> D[Carga archivo JSON]
    D --> E[JSON guardado en estado]
    
    E --> F[Sección 2: Gestión de Grupos]
    F --> G[Parseo automático del JSON]
    G --> H[Identificación de grupos AISD]
    G --> I[Identificación de grupos AISI]
    H --> J[Visualización de grupos]
    I --> J
    J --> K[Selección de centros poblados]
    K --> L[Creación de nuevos grupos opcional]
    L --> M[Configuración guardada]
    
    M --> N[Navegación a secciones de grupos]
    N --> O[PrefijoHelper extrae prefijo]
    O --> P[Lectura de datos con prefijo]
    P --> Q[Edición de datos]
    Q --> R[Guardado con prefijo]
    R --> S[Aislamiento de datos]
    
    S --> T[Numeración global de tablas]
    S --> U[Numeración global de fotos]
    T --> V[GlobalNumberingService]
    U --> V
    V --> W[Números calculados]
    
    W --> X[Exportación del documento]
    X --> Y[ExportService lee todos los datos]
    Y --> Z[Generación de PDF/JSON]
    Z --> AA[Descarga del documento]
    
    style E fill:#e8f5e9
    style M fill:#fff4e1
    style S fill:#fce4ec
    style W fill:#f3e5f5
    style AA fill:#e1f5ff
```

---

## 🎯 Objetivo Final del Proyecto

El objetivo final de **webDocumentador** es proporcionar una plataforma completa para:

1. **Cargar y procesar datos** de centros poblados desde archivos JSON
2. **Organizar datos** en grupos dinámicos AISD (Comunidades Campesinas) y AISI (Distritos)
3. **Documentar cada grupo** con secciones específicas (tablas, fotos, párrafos)
4. **Aislar datos** entre grupos usando prefijos dinámicos
5. **Numerar elementos** (imágenes y tablas) globalmente en todo el documento
6. **Exportar documentos** en formatos PDF y JSON

### Resultado Esperado

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENTO FINAL                              │
│                                                                 │
│  Capítulo 3: Línea Base Social                                 │
│                                                                 │
│  3.1 - Primera imagen del documento                            │
│  3.2 - Segunda imagen del documento                            │
│  ...                                                            │
│                                                                 │
│  Cuadro 3.1 - Primera tabla del documento                      │
│  Cuadro 3.2 - Segunda tabla del documento                      │
│  ...                                                            │
│                                                                 │
│  GRUPO AISD: A.1 - CAHUACHO                                    │
│  ├── A.1.1 - Descripción                                       │
│  ├── A.1.2 - Datos demográficos                                │
│  ├── ...                                                        │
│  └── A.1.20 - Última subsección                                │
│                                                                 │
│  GRUPO AISD: A.2 - SAN PEDRO                                   │
│  ├── A.2.1 - Descripción                                       │
│  ├── ...                                                        │
│  └── A.2.20 - Última subsección                                │
│                                                                 │
│  GRUPO AISI: B.1 - DISTRITO 1                                  │
│  ├── B.1.1 - Descripción                                       │
│  ├── B.1.2 - Características                                   │
│  ├── ...                                                        │
│  └── B.1.9 - Última subsección                                 │
│                                                                 │
│  GRUPO AISI: B.2 - DISTRITO 2                                  │
│  ├── B.2.1 - Descripción                                       │
│  ├── ...                                                        │
│  └── B.2.9 - Última subsección                                 │
│                                                                 │
│  [Todos los datos aislados entre grupos]                       │
│  [Numeración global consecutiva]                               │
│  [Exportable a PDF/JSON]                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

*Última actualización: 10 de febrero de 2026*
