import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';

interface SidebarSection {
  id: string;
  title: string;
  route?: string;
  level: number;
  children?: SidebarSection[];
  expanded?: boolean;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  private subscription?: Subscription;

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private formularioService: FormularioService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    // Exponer el componente globally para que SeccionComponent pueda acceder
    (window as any).layoutComponentRef = this;
    
    this.loadExpandedState();
    this.actualizarSeccionesAISI();
    this.actualizarSeccionesAISD();
    
    this.subscription = this.stateService.datos$.subscribe(() => {
      this.actualizarSeccionesAISI();
      this.actualizarSeccionesAISD();
    });
  }

  ngOnDestroy() {
    // Limpiar la referencia global
    delete (window as any).layoutComponentRef;
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  generarSeccionesAISI(): SidebarSection[] {
    const datos = this.formularioService.obtenerDatos();
    const distritosSeleccionados = datos['distritosSeleccionadosAISI'] || [];
    
    if (distritosSeleccionados.length === 0) {
      return [{
        id: '3.1.4.B.1',
        title: 'B.1 Centro Poblado',
        route: '/seccion/3.1.4.B.1',
        level: 4,
        expanded: false,
        children: this.generarSubseccionesB(1)
      }];
    }

    return distritosSeleccionados.map((distrito: string, index: number) => {
      const numero = index + 1;
      const nombreDistrito = distrito && distrito.trim() !== '' ? ` ${distrito}` : '';
      return {
        id: `3.1.4.B.${numero}`,
        title: `B.${numero} Centro Poblado${nombreDistrito}`,
        route: `/seccion/3.1.4.B.${numero}`,
        level: 4,
        expanded: false,
        children: this.generarSubseccionesB(numero)
      };
    });
  }

  generarSubseccionesB(numero: number): SidebarSection[] {
    return [
      { id: `3.1.4.B.${numero}.1`, title: `B.${numero}.1 Aspectos demográficos`, route: `/seccion/3.1.4.B.${numero}.1`, level: 5 },
      { id: `3.1.4.B.${numero}.2`, title: `B.${numero}.2 Indicadores y distribución de la PEA`, route: `/seccion/3.1.4.B.${numero}.2`, level: 5 },
      { id: `3.1.4.B.${numero}.3`, title: `B.${numero}.3 Actividades económicas`, route: `/seccion/3.1.4.B.${numero}.3`, level: 5 },
      { id: `3.1.4.B.${numero}.4`, title: `B.${numero}.4 Vivienda`, route: `/seccion/3.1.4.B.${numero}.4`, level: 5 },
      { id: `3.1.4.B.${numero}.5`, title: `B.${numero}.5 Servicios básicos`, route: `/seccion/3.1.4.B.${numero}.5`, level: 5 },
      { id: `3.1.4.B.${numero}.6`, title: `B.${numero}.6 Infraestructura de transporte y comunicaciones`, route: `/seccion/3.1.4.B.${numero}.6`, level: 5 },
      { id: `3.1.4.B.${numero}.7`, title: `B.${numero}.7 Infraestructura en salud, educación, recreación y deporte`, route: `/seccion/3.1.4.B.${numero}.7`, level: 5 },
      { id: `3.1.4.B.${numero}.8`, title: `B.${numero}.8 Indicadores de salud`, route: `/seccion/3.1.4.B.${numero}.8`, level: 5 },
      { id: `3.1.4.B.${numero}.9`, title: `B.${numero}.9 Indicadores de educación`, route: `/seccion/3.1.4.B.${numero}.9`, level: 5 },
      { id: `3.1.4.B.${numero}.10`, title: `B.${numero}.10 Aspectos culturales`, route: `/seccion/3.1.4.B.${numero}.10`, level: 5 },
      { id: `3.1.4.B.${numero}.11`, title: `B.${numero}.11 Agua, uso de suelos y recursos naturales`, route: `/seccion/3.1.4.B.${numero}.11`, level: 5 },
      { id: `3.1.4.B.${numero}.12`, title: `B.${numero}.12 Índice de Desarrollo Humano (IDH)`, route: `/seccion/3.1.4.B.${numero}.12`, level: 5 },
      { id: `3.1.4.B.${numero}.13`, title: `B.${numero}.13 Necesidades Básicas Insatisfechas (NBI)`, route: `/seccion/3.1.4.B.${numero}.13`, level: 5 },
      { id: `3.1.4.B.${numero}.14`, title: `B.${numero}.14 Organización social y liderazgo`, route: `/seccion/3.1.4.B.${numero}.14`, level: 5 },
      { id: `3.1.4.B.${numero}.15`, title: `B.${numero}.15 Festividades, costumbres y turismo`, route: `/seccion/3.1.4.B.${numero}.15`, level: 5 }
    ];
  }

  generarSeccionesAISD(): SidebarSection[] {
    const datos = this.formularioService.obtenerDatos();
    const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
    
    if (comunidadesCampesinas.length === 0) {
      return [{
        id: '3.1.4.A.1',
        title: 'A.1 Comunidad Campesina',
        route: '/seccion/3.1.4.A.1',
        level: 4,
        expanded: false,
        children: this.generarSubseccionesA(1)
      }];
    }

    return comunidadesCampesinas.map((comunidad: any, index: number) => {
      const numero = index + 1;
      const nombreComunidad = comunidad.nombre && comunidad.nombre.trim() !== '' ? ` ${comunidad.nombre}` : '';
      return {
        id: `3.1.4.A.${numero}`,
        title: `A.${numero} Comunidad Campesina${nombreComunidad}`,
        route: `/seccion/3.1.4.A.${numero}`,
        level: 4,
        expanded: false,
        children: this.generarSubseccionesA(numero)
      };
    });
  }

  generarSubseccionesA(numero: number): SidebarSection[] {
    return [
      { id: `3.1.4.A.${numero}.1`, title: `A.${numero}.1 Institucionalidad local`, route: `/seccion/3.1.4.A.${numero}.1`, level: 5 },
      { id: `3.1.4.A.${numero}.2`, title: `A.${numero}.2 Aspectos demográficos`, route: `/seccion/3.1.4.A.${numero}.2`, level: 5 },
      { id: `3.1.4.A.${numero}.3`, title: `A.${numero}.3 Aspectos económicos`, route: `/seccion/3.1.4.A.${numero}.3`, level: 5 },
      { id: `3.1.4.A.${numero}.4`, title: `A.${numero}.4 Actividades económicas`, route: `/seccion/3.1.4.A.${numero}.4`, level: 5 },
      { id: `3.1.4.A.${numero}.5`, title: `A.${numero}.5 Viviendas`, route: `/seccion/3.1.4.A.${numero}.5`, level: 5 },
      { id: `3.1.4.A.${numero}.6`, title: `A.${numero}.6 Servicios básicos`, route: `/seccion/3.1.4.A.${numero}.6`, level: 5 },
      { id: `3.1.4.A.${numero}.7`, title: `A.${numero}.7 Transporte y telecomunicaciones`, route: `/seccion/3.1.4.A.${numero}.7`, level: 5 },
      { id: `3.1.4.A.${numero}.8`, title: `A.${numero}.8 Infraestructura en salud, educación, recreación y deporte`, route: `/seccion/3.1.4.A.${numero}.8`, level: 5 },
      { id: `3.1.4.A.${numero}.9`, title: `A.${numero}.9 Indicadores de salud`, route: `/seccion/3.1.4.A.${numero}.9`, level: 5 },
      { id: `3.1.4.A.${numero}.10`, title: `A.${numero}.10 Indicadores de educación`, route: `/seccion/3.1.4.A.${numero}.10`, level: 5 },
      { id: `3.1.4.A.${numero}.11`, title: `A.${numero}.11 Aspectos culturales`, route: `/seccion/3.1.4.A.${numero}.11`, level: 5 },
      { id: `3.1.4.A.${numero}.12`, title: `A.${numero}.12 Agua, uso de suelos y recursos naturales`, route: `/seccion/3.1.4.A.${numero}.12`, level: 5 },
      { id: `3.1.4.A.${numero}.13`, title: `A.${numero}.13 Índice de Desarrollo Humano (IDH)`, route: `/seccion/3.1.4.A.${numero}.13`, level: 5 },
      { id: `3.1.4.A.${numero}.14`, title: `A.${numero}.14 Necesidades Básicas Insatisfechas (NBI)`, route: `/seccion/3.1.4.A.${numero}.14`, level: 5 },
      { id: `3.1.4.A.${numero}.15`, title: `A.${numero}.15 Organización social y liderazgo`, route: `/seccion/3.1.4.A.${numero}.15`, level: 5 },
      { id: `3.1.4.A.${numero}.16`, title: `A.${numero}.16 Festividades y tradiciones`, route: `/seccion/3.1.4.A.${numero}.16`, level: 5 }
    ];
  }

  actualizarSeccionesAISI() {
    const seccionB = this.sections[0]?.children?.[0]?.children?.[1];
    if (seccionB && seccionB.id === '3.1.4.B') {
      seccionB.children = this.generarSeccionesAISI();
      this.loadExpandedState();
    }
  }

  actualizarSeccionesAISD() {
    const seccionA = this.sections[0]?.children?.[0]?.children?.[1]?.children?.[0];
    if (seccionA && seccionA.id === '3.1.4.A') {
      seccionA.children = this.generarSeccionesAISD();
      this.loadExpandedState();
    }
  }

  sections: SidebarSection[] = [
    {
      id: 'capitulo3',
      title: 'CAPÍTULO III – LÍNEA BASE',
      level: 0,
      expanded: false,
      children: [
        {
          id: '3.1',
          title: '3.1 Descripción y caracterización de los aspectos sociales, culturales y antropológicos',
          level: 1,
          expanded: false,
          children: [
            {
              id: '3.1.1',
              title: '3.1.1 Objetivos de la línea base social',
              route: '/seccion/3.1.1',
              level: 2
            },
            {
              id: '3.1.2',
              title: '3.1.2 Delimitación de las áreas de influencia social',
              level: 2,
              expanded: false,
              children: [
                {
                  id: '3.1.2.A',
                  title: 'A. Área de Influencia Social Directa (AISD)',
                  route: '/seccion/3.1.2.A',
                  level: 3
                },
                {
                  id: '3.1.2.B',
                  title: 'B. Área de Influencia Social Indirecta (AISI)',
                  route: '/seccion/3.1.2.B',
                  level: 3
                }
              ]
            },
            {
              id: '3.1.3',
              title: '3.1.3 Índices demográficos, sociales, económicos, de ocupación laboral y otros similares',
              level: 2,
              expanded: false,
              children: [
                {
                  id: '3.1.3.A',
                  title: 'A. Fuentes primarias',
                  route: '/seccion/3.1.3.A',
                  level: 3
                },
                {
                  id: '3.1.3.B',
                  title: 'B. Fuentes secundarias',
                  route: '/seccion/3.1.3.B',
                  level: 3
                }
              ]
            },
            {
              id: '3.1.4',
              title: '3.1.4 Caracterización socioeconómica de las áreas de influencia social',
              level: 2,
              expanded: false,
              children: [
                {
                  id: '3.1.4.A',
                  title: 'A. Caracterización socioeconómica del Área de Influencia Social Directa (AISD)',
                  level: 3,
                  expanded: false,
                  children: this.generarSeccionesAISD()
                },
                {
                  id: '3.1.4.B',
                  title: 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
                  level: 3,
                  expanded: false,
                  children: this.generarSeccionesAISI()
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSection(section: SidebarSection) {
    if (section.children) {
      section.expanded = !section.expanded;
      this.saveExpandedState();
    }
  }

  private saveExpandedState() {
    const expandedIds: string[] = [];
    this.collectExpandedIds(this.sections, expandedIds);
    localStorage.setItem('layoutExpandedSections', JSON.stringify(expandedIds));
  }

  private loadExpandedState() {
    const saved = localStorage.getItem('layoutExpandedSections');
    if (saved) {
      try {
        const expandedIds = JSON.parse(saved) as string[];
        this.applyExpandedState(this.sections, expandedIds);
      } catch (e) {
        console.error('Error loading expanded state:', e);
      }
    }
  }

  private collectExpandedIds(sections: SidebarSection[], expandedIds: string[]) {
    sections.forEach(section => {
      if (section.expanded) {
        expandedIds.push(section.id);
      }
      if (section.children) {
        this.collectExpandedIds(section.children, expandedIds);
      }
    });
  }

  private applyExpandedState(sections: SidebarSection[], expandedIds: string[]) {
    sections.forEach(section => {
      if (expandedIds.includes(section.id)) {
        section.expanded = true;
      }
      if (section.children) {
        this.applyExpandedState(section.children, expandedIds);
      }
    });
  }

  hasChildren(section: SidebarSection): boolean {
    return !!(section.children && section.children.length > 0);
  }

  irAPlantilla() {
    const currentUrl = this.router.url;
    let returnSection = '3.1.1';
    
    if (currentUrl.startsWith('/seccion/')) {
      const sectionId = currentUrl.replace('/seccion/', '');
      if (sectionId) {
        returnSection = sectionId;
      }
    }
    
    this.router.navigate(['/plantilla'], {
      state: { returnSection: returnSection }
    });
  }
}

