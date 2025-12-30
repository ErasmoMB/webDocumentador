# Guía de Desarrollo de Páginas - Documentador Web

## 📋 Resumen Ejecutivo

Este documento contiene toda la información necesaria para desarrollar las páginas del documentador web, incluyendo criterios de diseño, estructura de datos, integración con backend, y patrones de implementación.

---

## 🎯 Objetivo del Proyecto

Crear un documentador web que permita:
1. **Completar formularios** para cada sección del documento
2. **Ver vista previa** en tiempo real del documento generado
3. **Exportar a Word** el documento completo con todos los datos ingresados
4. **Navegar** mediante un índice interactivo a cualquier sección

---

## 📐 Estructura del Documento

### Capítulo III - Línea Base

```
CAPÍTULO III – LÍNEA BASE
└── 3.1 Descripción y caracterización...
    ├── 3.1.1 Objetivos de la línea base social
    ├── 3.1.2 Delimitación de las áreas de influencia social
    │   ├── A. Área de Influencia Social Directa (AISD)
    │   └── B. Área de Influencia Social Indirecta (AISI)
    ├── 3.1.3 Índices demográficos, sociales, económicos...
    │   ├── A. Fuentes primarias
    │   └── B. Fuentes secundarias
    └── 3.1.4 Caracterización socioeconómica...
        ├── A. Caracterización AISD
        │   ├── A.1 Comunidad Campesina Ayroca
        │   ├── A.1.1 Institucionalidad local
        │   ├── A.1.2 Aspectos demográficos
        │   ├── A.1.3 Aspectos económicos
        │   ├── A.1.4 Actividades económicas
        │   ├── A.1.5 Viviendas
        │   ├── A.1.6 Servicios básicos
        │   ├── A.1.7 Transporte y telecomunicaciones
        │   ├── A.1.8 Infraestructura
        │   ├── A.1.9 Indicadores de salud
        │   ├── A.1.11 Aspectos culturales
        │   ├── A.1.12 Agua, uso de suelos y recursos naturales
        │   ├── A.1.13 Índice de Desarrollo Humano (IDH)
        │   ├── A.1.14 Necesidades Básicas Insatisfechas (NBI)
        │   ├── A.1.15 Organización social y liderazgo
        │   └── A.1.16 Festividades y tradiciones
        └── B. Caracterización AISI
            ├── B.1 Centro Poblado Cahuacho
            ├── B.1.1 Aspectos demográficos
            ├── B.1.2 Indicadores y distribución de la PEA
            ├── B.1.3 Actividades económicas
            ├── B.1.4 Vivienda
            ├── B.1.5 Servicios básicos
            ├── B.1.6 Infraestructura de transporte y comunicaciones
            ├── B.1.7 Infraestructura en salud, educación, recreación y deporte
            ├── B.1.8 Indicadores de salud
            ├── B.1.9 Indicadores de educación
            ├── B.1.10 Aspectos culturales
            ├── B.1.11 Agua, uso de suelos y recursos naturales
            ├── B.1.12 Índice de Desarrollo Humano (IDH)
            ├── B.1.13 Necesidades Básicas Insatisfechas (NBI)
            ├── B.1.14 Organización social y liderazgo
            └── B.1.15 Festividades, costumbres y turismo
```

---

## 🎨 Criterio: Contenido Dinámico vs Fijo

### ✅ **CONTENIDO FIJO** (No cambia entre proyectos)

**Regla:** Textos conceptuales, metodológicos o teóricos que son universales.

**Ejemplos:**
- Títulos de secciones: `"3.1.1 Objetivos de la línea base social"`
- Textos explicativos generales: `"Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos..."`
- Definiciones: `"La Población Económicamente Activa (PEA) constituye un indicador fundamental..."`
- Listas de fuentes secundarias (siempre las mismas instituciones)
- Estructura narrativa que explica conceptos

**Implementación:**
```html
<!-- Texto fijo, sin variables -->
<p>Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos y técnicas cualitativas de investigación social...</p>
```

---

### 🔄 **CONTENIDO DINÁMICO** (Específico del proyecto)

**Regla:** Datos específicos que cambian según el proyecto.

**Ejemplos:**
- **Nombres propios:** `{{ datos.projectName }}`, `{{ datos.grupoAISD }}`
- **Números:** `{{ datos.cantidadEntrevistas }}`, `{{ datos.poblacion }}`
- **Fechas:** `{{ datos.fechaTrabajoCampo }}`
- **Tablas con datos reales:** `*ngFor="let item of datos.entrevistados"`
- **Imágenes:** `*ngFor="let img of datos.imagenesA1"`
- **Textos editables:** `{{ datos.componente1Pagina5 }}`
- **Fuente de consultora:** `{{ datos.consultora }}`

**Implementación:**
```html
<!-- Texto dinámico con variables -->
<p>El proyecto <span class="highlight">{{ datos.projectName }}</span> se encuentra ubicado en el distrito de <span class="highlight">{{ datos.distritoSeleccionado }}</span>...</p>

<!-- Tabla dinámica -->
<table>
  <tr *ngFor="let entrevistado of datos.entrevistados">
    <td>{{ entrevistado.nombre }}</td>
    <td>{{ entrevistado.cargo }}</td>
    <td>{{ entrevistado.organizacion }}</td>
  </tr>
</table>
```

---

## 🔌 Integración con Backend vs JSON

### 📄 **Usar JSON** (Datos geográficos y de selección)

**Cuándo usar:**
- ✅ Coordenadas: `ESTE`, `NORTE`, `ALTITUD`
- ✅ Categorías: `CATEGORIA` (Capital distrital, Anexo, Caserio, etc.)
- ✅ Selección inicial de centros poblados
- ✅ Códigos CPP para luego consultar backend

**Estructura del JSON:**
```json
{
  "CAHUACHO": [
    {
      "CODIGO": 403060001,
      "CCPP": "Cahuacho",
      "CATEGORIA": "Capital distrital",
      "ESTE": 663078,
      "NORTE": 8285498,
      "ALTITUD": 3423,
      "DPTO": "Arequipa",
      "PROV": "Caraveli",
      "DIST": "Cahuacho"
    }
  ]
}
```

**Uso en código:**
```typescript
// Cargar JSON al inicio (Página Documento)
this.jsonData = this.formularioService.obtenerJSON();

// Usar coordenadas del JSON
<td>18L E: {{ json[0].ESTE }} m N: {{ json[0].NORTE }} m</td>
<td>{{ json[0].ALTITUD }} msnm</td>
```

---

### 🌐 **Usar Backend** (Datos estadísticos actualizados)

**Cuándo usar:**
- ✅ Datos de población (total, por sexo, por edades)
- ✅ Datos de PEA/No PEA
- ✅ Datos demográficos del censo

**Endpoints disponibles:**

#### 1. Población por CPP
```typescript
GET /api/v1/poblacion/?cpp=403060001,403060002

Response:
{
  "data": {
    "poblacion": {
      "total_varones": 15160,
      "total_mujeres": 16907,
      "total_poblacion": 32067,
      "porcentaje_varones": "47.28%",
      "porcentaje_mujeres": "52.72%",
      "edad_0_14": 7913,
      "edad_15_29": 9237,
      "edad_30_44": 6874,
      "edad_45_64": 5455,
      "edad_65_mas": 2588
    }
  }
}
```

#### 2. PEA/No PEA por Distrito
```typescript
GET /api/v1/censo/pea-nopea?distrito=Cahuacho

Response:
{
  "data": {
    "pea": 14934,
    "no_pea": 10215,
    "porcentaje_pea": "59.38%",
    "porcentaje_no_pea": "40.62%",
    "ocupada": 14394,
    "desocupada": 540,
    "porcentaje_ocupada": "96.38%",
    "porcentaje_desocupada": "3.62%"
  }
}
```

#### 3. Población por Distrito
```typescript
GET /api/v1/poblacion/distrito?distrito=Cahuacho

Response:
{
  "data": [
    {
      "cpp": "403060001",
      "centro_poblado": "Cahuacho",
      "total": 160,
      "hombres": 78,
      "mujeres": 82
    }
  ]
}
```

**Uso en código:**
```typescript
// En componente que necesita datos de población
ngOnInit() {
  // 1. Obtener códigos CPP de seleccionados
  const codigos = this.datos.seleccionados.map(s => s.split(' - ')[1]);
  
  // 2. Consultar backend
  this.poblacionService.getPoblacionByCpp(codigos).subscribe(response => {
    // 3. Auto-llenar tablas
    this.datos.poblacionSexoTabla = [
      { sexo: 'Hombre', casos: response.data.poblacion.total_varones, ... },
      { sexo: 'Mujer', casos: response.data.poblacion.total_mujeres, ... }
    ];
    
    // 4. Generar textos automáticos
    this.datos.textoPoblacionSexo = this.generarTexto(response.data.poblacion);
  });
}
```

---

## 🏗️ Patrón de Diseño de Páginas

### Estructura HTML

Cada página debe tener esta estructura:

```html
<div class="container">
  <!-- IZQUIERDA: Vista Previa -->
  <div class="preview">
    <h3>3.1.1 Objetivos de la línea base social</h3>
    
    <!-- Textos fijos -->
    <p>Los objetivos de la presente línea de base social (LBS) son los siguientes:</p>
    
    <!-- Textos dinámicos -->
    <ul>
      <li>Describir los aspectos demográficos... del proyecto de exploración minera <span class="highlight">{{ datos.projectName }}</span>.</li>
    </ul>
    
    <!-- Tablas dinámicas -->
    <table class="table-container">
      <tr *ngFor="let item of datos.tabla">
        <td>{{ item.campo1 }}</td>
        <td>{{ item.campo2 }}</td>
      </tr>
    </table>
    
    <!-- Imágenes dinámicas -->
    <div *ngFor="let img of datos.imagenes; let i = index">
      <p><strong>Fotografía N° 3. {{ i + 1 }}:</strong> {{ img.name }}</p>
      <img [src]="img.url" alt="{{ img.name }}">
      <p>Fuente: {{ datos.consultora }}</p>
    </div>
  </div>

  <!-- DERECHA: Formulario -->
  <div class="formulario">
    <div class="title">Objetivos de la línea base social</div>
    
    <!-- Inputs para datos dinámicos -->
    <div class="label">NOMBRE DEL PROYECTO:</div>
    <input class="inputstyle" type="text" [(ngModel)]="datos.projectName">
    
    <!-- Botones de navegación -->
    <div class="navigation-buttons">
      <button class="btn btn--tertiary" (click)="regresar()">Atrás</button>
      <button class="btn btn--primary" (click)="siguientePaso()">Siguiente</button>
    </div>
  </div>
</div>
```

---

## 📝 Patrón de Componente TypeScript

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';
import { PoblacionService } from 'src/app/core/services/poblacion.service';

@Component({
  selector: 'app-nombre-componente',
  templateUrl: './nombre-componente.component.html',
})
export class NombreComponenteComponent implements OnInit {
  datos: any;
  jsonData: any[] = [];

  constructor(
    private formularioService: FormularioService,
    private router: Router,
    private poblacionService: PoblacionService
  ) {}

  ngOnInit() {
    // 1. Obtener datos del servicio centralizado
    this.datos = this.formularioService.obtenerDatos();
    this.jsonData = this.formularioService.obtenerJSON();

    // 2. Inicializar campos si no existen
    if (!this.datos.campoEjemplo) {
      this.datos.campoEjemplo = '';
    }

    // 3. Generar textos automáticos basados en datos previos
    if (!this.datos.textoGenerado) {
      this.datos.textoGenerado = `Texto generado con ${this.datos.distritoSeleccionado}...`;
    }

    // 4. Si necesitas datos del backend, consultarlos aquí
    if (this.datos.seleccionados?.length > 0) {
      this.cargarDatosBackend();
    }

    // 5. Guardar estado inicial
    this.formularioService.actualizarDatos(this.datos);
  }

  cargarDatosBackend() {
    const codigos = this.datos.seleccionados.map(s => s.split(' - ')[1]);
    
    this.poblacionService.getPoblacionByCpp(codigos).subscribe(response => {
      // Auto-llenar tablas
      this.datos.poblacionTabla = this.procesarDatosPoblacion(response.data.poblacion);
      
      // Generar textos automáticos
      this.datos.textoPoblacion = this.generarTextoPoblacion(response.data.poblacion);
      
      // Guardar cambios
      this.formularioService.actualizarDatos(this.datos);
    });
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/ruta-siguiente']);
  }

  regresar() {
    this.router.navigate(['/ruta-anterior']);
  }
}
```

---

## 🗺️ Estructura de Rutas Completa

### Introducción (`/introduccion/...`)

| Ruta | Sección | Componente |
|------|---------|------------|
| `/introduccion/objetivos` | 3.1.1 Objetivos | `ObjetivosComponent` |
| `/introduccion/aisd` | 3.1.2.A AISD | `AisdComponent` |
| `/introduccion/aisi` | 3.1.2.B AISI | `AisiComponent` |
| `/introduccion/fuentes-informacion` | 3.1.3 Fuentes | `FuentesInformacionComponent` |

### AISD (`/aisd/...`)

| Ruta | Sección | Componente |
|------|---------|------------|
| `/aisd/comunidad-ayroca` | A.1 Comunidad | `ComunidadAyrocaComponent` |
| `/aisd/institucionalidad` | A.1.1 Institucionalidad | `InstitucionalidadComponent` |
| `/aisd/aspectos-demograficos` | A.1.2 Demográficos | `AspectosDemograficosComponent` |
| `/aisd/aspectos-economicos` | A.1.3 Económicos | `AspectosEconomicosComponent` |
| `/aisd/actividades-economicas` | A.1.4 Actividades | `ActividadesEconomicasComponent` |
| `/aisd/viviendas` | A.1.5 Viviendas | `ViviendasComponent` |
| `/aisd/servicios-basicos` | A.1.6 Servicios | `ServiciosBasicosComponent` |
| `/aisd/transporte-telecomunicaciones` | A.1.7 Transporte | `TransporteTelecomunicacionesComponent` |
| `/aisd/infraestructura` | A.1.8 Infraestructura | `InfraestructuraComponent` |
| `/aisd/indicadores-salud` | A.1.9 Salud | `IndicadoresSaludComponent` |
| `/aisd/aspectos-culturales` | A.1.11 Culturales | `AspectosCulturalesComponent` |
| `/aisd/agua-suelos-recursos` | A.1.12 Agua/Suelos | `AguaSuelosRecursosComponent` ✅ |
| `/aisd/idh` | A.1.13 IDH | `IdhComponent` ✅ |
| `/aisd/nbi` | A.1.14 NBI | `NbiComponent` ✅ |
| `/aisd/organizacion-liderazgo` | A.1.15 Organización | `OrganizacionLiderazgoComponent` ✅ |
| `/aisd/festividades-tradiciones` | A.1.16 Festividades | `FestividadesTradicionesComponent` ✅ |

### AISI (`/aisi/...`)

| Ruta | Sección | Componente |
|------|---------|------------|
| `/aisi/centro-poblado-cahuacho` | B.1 Centro Poblado | `CentroPobladoCahuachoComponent` |
| `/aisi/aspectos-demograficos` | B.1.1 Demográficos | `AspectosDemograficosAisiComponent` |
| `/aisi/indicadores-pea` | B.1.2 PEA | `IndicadoresPeaAisiComponent` |
| `/aisi/actividades-economicas` | B.1.3 Actividades | `ActividadesEconomicasAisiComponent` |
| `/aisi/vivienda` | B.1.4 Vivienda | `ViviendaAisiComponent` |
| `/aisi/servicios-basicos` | B.1.5 Servicios | `ServiciosBasicosAisiComponent` |
| `/aisi/transporte-comunicaciones` | B.1.6 Transporte | `TransporteComunicacionesAisiComponent` |
| `/aisi/infraestructura` | B.1.7 Infraestructura | `InfraestructuraAisiComponent` |
| `/aisi/indicadores-salud` | B.1.8 Salud | `IndicadoresSaludAisiComponent` |
| `/aisi/indicadores-educacion` | B.1.9 Educación | `IndicadoresEducacionAisiComponent` |
| `/aisi/aspectos-culturales` | B.1.10 Culturales | `AspectosCulturalesAisiComponent` |
| `/aisi/agua-suelos-recursos` | B.1.11 Agua/Suelos | `AguaSuelosRecursosAisiComponent` |
| `/aisi/idh` | B.1.12 IDH | `IdhAisiComponent` |
| `/aisi/nbi` | B.1.13 NBI | `NbiAisiComponent` |
| `/aisi/organizacion-liderazgo-aisi` | B.1.14 Organización | `OrganizacionLiderazgoAisiComponent` ✅ |
| `/aisi/festividades-costumbres-turismo` | B.1.15 Festividades | `FestividadesCostumbresTurismoComponent` ✅ |

**✅ = Ya existe**

---

## 📊 Gestión de Datos

### FormularioService (Servicio Centralizado)

**Ubicación:** `src/app/services/services/formulario.service.ts`

**Métodos principales:**
```typescript
// Obtener todos los datos
obtenerDatos(): any

// Actualizar datos (merge)
actualizarDatos(nuevosDatos: any): void

// Reemplazar todos los datos
reemplazarDatos(nuevosDatos: any): void

// JSON de centros poblados
obtenerJSON(): DatosJSON[]
guardarJSON(data: any): void
```

**Estructura de datos:**
```typescript
datos = {
  // Datos básicos
  projectName: string,
  departamentoSeleccionado: string,
  provinciaSeleccionada: string,
  distritoSeleccionado: string,
  
  // AISD/AISI
  grupoAISD: string,
  grupoAISI: string,
  seleccionados: string[],
  seleccionadosAISI: string[],
  
  // Fuentes primarias
  cantidadEntrevistas: number,
  entrevistados: Array<{nombre: string, cargo: string, organizacion: string}>,
  fechaTrabajoCampo: string,
  consultora: string,
  
  // Población (del backend)
  datosobtenidosAPI: any,
  poblacionSexoTabla: Array<{sexo: string, casos: number, porcentaje: string}>,
  poblacionEtarioTabla: Array<{categoria: string, casos: number, porcentaje: string}>,
  
  // PEA (del backend)
  peaTabla: Array<{...}>,
  petTabla: Array<{...}>,
  
  // Imágenes
  imagenesA1: Array<{name: string, url: string}>,
  imagenes2: Array<{name: string, url: string}>,
  
  // Textos editables
  componente1Pagina5: string,
  componente2Pagina5: string,
  textoPoblacionSexo: string,
  textoPoblacionEtario: string,
  // ... más campos según se necesiten
}
```

---

## 🎯 Criterio de División de Páginas

### Regla General

**1 página = 1 sección/subsección del índice**

**Excepciones:**
- Si una sección tiene ≤ 3 subsecciones cortas (a, b, c) → **1 página con todas**
- Si una sección tiene > 3 subsecciones o es muy larga → **Dividir en páginas separadas**

### Ejemplos

#### ✅ **1 Página (Subsecciones agrupadas)**

**A.1.2 Aspectos Demográficos:**
- `a. Población según sexo` (texto + tabla)
- `b. Población según grupo etario` (texto + tabla)
- → **1 página:** `/aisd/aspectos-demograficos`

**A.1.3 Aspectos Económicos:**
- `a. PET` (texto + tabla)
- `b. PEA` (texto + tabla)
- `b.1 Situación del empleo` (texto)
- `b.2 Ingresos` (texto)
- `b.3 Índice de desempleo` (texto + tabla)
- → **1 página:** `/aisd/aspectos-economicos`

#### ✅ **Páginas Separadas**

**A.1.4 Actividades Económicas:**
- Contenido extenso con múltiples tablas y subsecciones
- → **1 página:** `/aisd/actividades-economicas`

**A.1.5 Viviendas:**
- Contenido extenso con tablas de materiales
- → **1 página:** `/aisd/viviendas`

---

## 🔄 Flujo de Trabajo para Crear una Página

### Paso 1: Crear el Componente

```bash
ng generate component features/aisd/pages/aspectos-demograficos
```

### Paso 2: Actualizar el Routing

**`aisd-routing.module.ts`:**
```typescript
import { AspectosDemograficosComponent } from './pages/aspectos-demograficos/aspectos-demograficos.component';

const routes: Routes = [
  { path: 'aspectos-demograficos', component: AspectosDemograficosComponent },
  // ... más rutas
];
```

### Paso 3: Implementar el Componente

**Estructura básica:**
1. **HTML:** Vista previa (izquierda) + Formulario (derecha)
2. **TypeScript:** 
   - Obtener datos de `FormularioService`
   - Consultar backend si es necesario
   - Generar textos automáticos
   - Guardar datos en `FormularioService`

### Paso 4: Integrar con Backend (si aplica)

```typescript
ngOnInit() {
  this.datos = this.formularioService.obtenerDatos();
  
  // Si necesita datos de población
  if (this.datos.seleccionados?.length > 0) {
    const codigos = this.datos.seleccionados.map(s => s.split(' - ')[1]);
    
    this.poblacionService.getPoblacionByCpp(codigos).subscribe(response => {
      // Procesar y guardar datos
      this.procesarDatosPoblacion(response.data.poblacion);
    });
  }
}
```

### Paso 5: Verificar en el Índice

El índice ya está configurado en `NavigationIndexService`. Solo verifica que la ruta coincida.

---

## 📋 Checklist para Cada Página

- [ ] Componente creado con nombre descriptivo
- [ ] Ruta agregada al módulo de routing correspondiente
- [ ] HTML con estructura: vista previa (izquierda) + formulario (derecha)
- [ ] Textos fijos identificados y sin variables
- [ ] Textos dinámicos con `{{ }}` y `*ngFor` donde corresponda
- [ ] Tablas dinámicas con `*ngFor`
- [ ] Inputs para editar datos dinámicos
- [ ] Integración con backend (si aplica)
- [ ] Generación automática de textos basados en datos previos
- [ ] Guardado de datos en `FormularioService`
- [ ] Botones de navegación (Atrás/Siguiente)
- [ ] Ruta verificada en `NavigationIndexService`

---

## 🛠️ Servicios Disponibles

### PoblacionService

**Ubicación:** `src/app/core/services/poblacion.service.ts`

**Métodos:**
```typescript
// Obtener población por códigos CPP
getPoblacionByCpp(cpp: string[]): Observable<PoblacionResponse>

// Obtener población por distrito
getPoblacionByDistrito(distrito: string): Observable<PoblacionDistritoResponse>

// Obtener PEA/No PEA por distrito
getPEANoPEAByDistrito(distrito: string): Observable<PEANoPEAResponse>
```

### ConfigService

**Ubicación:** `src/app/core/services/config.service.ts`

**Métodos:**
```typescript
// Verificar si está en modo mock
isMockMode(): boolean

// Obtener URL del API
getApiUrl(): string
```

---

## 📸 Manejo de Imágenes

### Subir Imagen

```typescript
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImageUrl = e.target.result; // Base64
    };
    reader.readAsDataURL(file);
  }
}

guardarImagen() {
  if (!this.selectedImageUrl || !this.imageName.trim()) {
    alert('Por favor, complete todos los campos.');
    return;
  }

  // Guardar en array de imágenes
  if (!this.datos.imagenesA1) {
    this.datos.imagenesA1 = [];
  }
  
  this.datos.imagenesA1.push({ 
    name: this.imageName, 
    url: this.selectedImageUrl 
  });
  
  this.imageName = '';
  this.selectedImageUrl = null;
  this.formularioService.actualizarDatos(this.datos);
}
```

### Mostrar Imágenes

```html
<div class="image-gallery" *ngIf="datos.imagenesA1 && datos.imagenesA1.length > 0">
  <div *ngFor="let img of datos.imagenesA1; let i = index" class="image-item">
    <p><strong>Fotografía N° 3. {{ i + 1 }}:</strong> {{ img.name }}</p>
    <img [src]="img.url" alt="{{ img.name }}" width="150">
    <p>Fuente: {{ datos.consultora }}</p>
  </div>
</div>
```

---

## 📊 Manejo de Tablas

### Tabla Predefinida (Estructura fija, datos variables)

```typescript
// En el componente
tableData = [
  { categoria: "Programas Sociales", respuesta: "", nombre: "", comentario: "" },
  { categoria: "Municipio", respuesta: "", nombre: "", comentario: "" },
  // ... más filas
];

// En el HTML
<table>
  <tr *ngFor="let item of tableData">
    <td>{{ item.categoria }}</td>
    <td><input [(ngModel)]="item.respuesta"></td>
    <td><input [(ngModel)]="item.nombre"></td>
    <td><input [(ngModel)]="item.comentario"></td>
  </tr>
</table>
```

### Tabla Dinámica (Filas agregables)

```typescript
// Agregar fila
agregarFila() {
  if (!this.datos.tabla) {
    this.datos.tabla = [];
  }
  this.datos.tabla.push({ campo1: '', campo2: '', campo3: 0 });
}

// Eliminar fila
eliminarFila(index: number) {
  this.datos.tabla.splice(index, 1);
}

// Calcular totales
calcularTotal(): number {
  return this.datos.tabla.reduce((sum, item) => sum + (item.campo3 || 0), 0);
}
```

---

## 🎨 Estilos CSS

### Clases Comunes

```css
/* Contenedor principal */
.container {
  display: flex;
  gap: 20px;
}

/* Vista previa (izquierda) */
.preview {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
}

/* Formulario (derecha) */
.formulario {
  width: 400px;
  padding: 20px;
  background: white;
  border-left: 1px solid #ddd;
}

/* Títulos */
.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.label {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}

/* Inputs */
.inputstyle {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Tablas */
.table-container {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.table-header {
  background: #f0f0f0;
  padding: 10px;
  text-align: left;
  font-weight: bold;
}

.table-cell {
  padding: 8px;
  border: 1px solid #ddd;
}

/* Highlight para datos dinámicos */
.highlight {
  background: yellow;
  padding: 2px 4px;
}

/* Botones de navegación */
.navigation-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
```

---

## 🔍 Ejemplo Completo: A.1.2 Aspectos Demográficos

### Componente TypeScript

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';
import { PoblacionService } from 'src/app/core/services/poblacion.service';

@Component({
  selector: 'app-aspectos-demograficos',
  templateUrl: './aspectos-demograficos.component.html',
})
export class AspectosDemograficosComponent implements OnInit {
  datos: any;

  constructor(
    private formularioService: FormularioService,
    private router: Router,
    private poblacionService: PoblacionService
  ) {}

  ngOnInit() {
    this.datos = this.formularioService.obtenerDatos();
    
    // Inicializar tablas si no existen
    if (!this.datos.poblacionSexoTabla) {
      this.datos.poblacionSexoTabla = [];
    }
    if (!this.datos.poblacionEtarioTabla) {
      this.datos.poblacionEtarioTabla = [];
    }

    // Cargar datos del backend si hay seleccionados
    if (this.datos.seleccionados?.length > 0) {
      this.cargarDatosPoblacion();
    }
  }

  cargarDatosPoblacion() {
    const codigos = this.datos.seleccionados.map((s: string) => s.split(' - ')[1]);
    
    this.poblacionService.getPoblacionByCpp(codigos).subscribe(response => {
      const poblacion = response.data.poblacion;
      
      // Auto-llenar tabla de población por sexo
      this.datos.poblacionSexoTabla = [
        {
          sexo: 'Hombre',
          casos: poblacion.total_varones,
          porcentaje: poblacion.porcentaje_varones
        },
        {
          sexo: 'Mujer',
          casos: poblacion.total_mujeres,
          porcentaje: poblacion.porcentaje_mujeres
        },
        {
          sexo: 'Total',
          casos: poblacion.total_poblacion,
          porcentaje: '100,00 %'
        }
      ];

      // Auto-llenar tabla de población por edad
      this.datos.poblacionEtarioTabla = [
        {
          categoria: '0 a 14 años',
          casos: poblacion.edad_0_14,
          porcentaje: ((poblacion.edad_0_14 / poblacion.total_poblacion) * 100).toFixed(2) + ' %'
        },
        {
          categoria: '15 a 29 años',
          casos: poblacion.edad_15_29,
          porcentaje: ((poblacion.edad_15_29 / poblacion.total_poblacion) * 100).toFixed(2) + ' %'
        },
        // ... más grupos de edad
      ];

      // Generar texto automático
      this.datos.textoPoblacionSexo = `Respecto a la población de la ${this.datos.grupoAISD}, 
        tomando en cuenta data obtenida de los Censos Nacionales 2017, existen un total de 
        ${poblacion.total_poblacion} habitantes...`;

      this.formularioService.actualizarDatos(this.datos);
    });
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/aisd/aspectos-economicos']);
  }

  regresar() {
    this.router.navigate(['/aisd/institucionalidad']);
  }
}
```

### Template HTML

```html
<div class="container">
  <div class="preview">
    <h5>A.1.2 Aspectos Demográficos</h5>
    
    <p style="margin-bottom: 10px;"><strong>a. Población según sexo</strong></p>
    <p class="text-justify">{{ datos.textoPoblacionSexo || '...' }}</p>
    
    <p class="table-title">Cuadro N° 3. 5</p>
    <p class="table-title-main">Población por sexo – {{ datos.grupoAISD }} (2017)</p>
    <table class="table-container">
      <thead>
        <tr>
          <th class="table-header">Sexo</th>
          <th class="table-header">Casos</th>
          <th class="table-header">Porcentaje</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of datos.poblacionSexoTabla">
          <td class="table-cell">{{ item.sexo }}</td>
          <td class="table-cell">{{ item.casos }}</td>
          <td class="table-cell">{{ item.porcentaje }}</td>
        </tr>
      </tbody>
    </table>
    <p class="source">Fuente: <span class="highlight">Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)</span></p>
    
    <p style="margin-top: 20px; margin-bottom: 10px;"><strong>b. Población según grupo etario</strong></p>
    <p class="text-justify">{{ datos.textoPoblacionEtario || '...' }}</p>
    
    <p class="table-title">Cuadro N° 3. 6</p>
    <p class="table-title-main">Población por grandes grupos de edad – {{ datos.grupoAISD }} (2017)</p>
    <table class="table-container">
      <thead>
        <tr>
          <th class="table-header">Categoría</th>
          <th class="table-header">Casos</th>
          <th class="table-header">Porcentaje</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of datos.poblacionEtarioTabla">
          <td class="table-cell">{{ item.categoria }}</td>
          <td class="table-cell">{{ item.casos }}</td>
          <td class="table-cell">{{ item.porcentaje }}</td>
        </tr>
      </tbody>
    </table>
    <p class="source">Fuente: <span class="highlight">Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)</span></p>
  </div>

  <div class="formulario">
    <div class="title">Aspectos Demográficos</div>
    
    <div class="label">TEXTO POBLACIÓN POR SEXO:</div>
    <textarea class="inputstyle" [(ngModel)]="datos.textoPoblacionSexo" rows="4"></textarea>
    
    <div class="label">TEXTO POBLACIÓN POR EDAD:</div>
    <textarea class="inputstyle" [(ngModel)]="datos.textoPoblacionEtario" rows="4"></textarea>
    
    <button class="btn btn--primary" (click)="cargarDatosPoblacion()">Cargar Datos del Backend</button>
    
    <div class="navigation-buttons">
      <button class="btn btn--tertiary" (click)="regresar()">Atrás</button>
      <button class="btn btn--primary" (click)="siguientePaso()">Siguiente</button>
    </div>
  </div>
</div>
```

---

## 🚀 Próximos Pasos

1. **Crear componentes faltantes** siguiendo el patrón establecido
2. **Actualizar módulos de routing** con las nuevas rutas
3. **Implementar integración con backend** en las páginas que lo requieran
4. **Verificar navegación** desde el índice
5. **Probar flujo completo** desde Documento hasta Resumen

---

## 📚 Referencias

- **Backend API:** `BACKEND_API_README.md`
- **Servicio de Navegación:** `src/app/shared/services/navigation-index.service.ts`
- **Servicio de Formulario:** `src/app/services/services/formulario.service.ts`
- **Servicio de Población:** `src/app/core/services/poblacion.service.ts`
- **Ejemplo de Componente:** `src/app/features/introduccion/pages/pagina4/pagina4.component.ts`

---

## ✅ Estado Actual

- ✅ Criterio dinámico vs fijo definido
- ✅ Integración backend vs JSON definida
- ✅ Estructura del índice completa
- ✅ Rutas definidas con nombres descriptivos
- ✅ Patrón de diseño establecido
- ⏳ Componentes pendientes de crear
- ⏳ Integración backend pendiente en algunas páginas

---

**Última actualización:** Diciembre 2024

