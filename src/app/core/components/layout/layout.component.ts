import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { StorageFacade } from 'src/app/core/services/infrastructure/storage-facade.service';
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
    styleUrls: ['./layout.component.css'],
    standalone: false
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  private subscription?: Subscription;
  private groupsSubscription?: Subscription;
  private resizeTimeout: any;

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private projectFacade: ProjectStateFacade,
    private stateAdapter: ReactiveStateAdapter,
    private cdRef: ChangeDetectorRef,
    private storage: StorageFacade
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Debounce para evitar llamadas excesivas
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.cdRef.detectChanges();
    }, 100);
  }

  ngOnInit() {
    // Exponer el componente globally para que SeccionComponent pueda acceder
    (window as any).layoutComponentRef = this;
    
    this.loadExpandedState();
    this.actualizarSeccionesAISI();
    this.actualizarSeccionesAISD();
    
    // Suscribirse a cambios en datos legacy (FormularioService)
    this.subscription = this.stateAdapter.datos$.subscribe((datos: any) => {
      // Forzar actualización con pequeño delay para permitir que los datos se estabilicen
      setTimeout(() => {
        this.actualizarSeccionesAISI();
        this.actualizarSeccionesAISD();
        this.cdRef.markForCheck();
      }, 100);
    });

    // Suscribirse a cambios en grupos (ProjectState)
    // Esto detecta cambios cuando se cargan nuevos JSONs que crean grupos
    let previousAISDCount = 0;
    let previousAISICount = 0;
    
    this.groupsSubscription = setInterval(() => {
      try {
        const gruposAISD = this.projectFacade.aisdGroups();
        const gruposAISI = this.projectFacade.aisiGroups();
        
        if (gruposAISD.length !== previousAISDCount || gruposAISI.length !== previousAISICount) {
          previousAISDCount = gruposAISD.length;
          previousAISICount = gruposAISI.length;
          
          this.actualizarSeccionesAISI();
          this.actualizarSeccionesAISD();
          this.cdRef.markForCheck();
        }
      } catch (error) {
        // Silently handle error
      }
    }, 300) as any;
  }

  ngOnDestroy() {
    // Limpiar la referencia global
    delete (window as any).layoutComponentRef;
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    if (this.groupsSubscription) {
      clearInterval(this.groupsSubscription as any);
    }
    
    // Limpiar timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  generarSeccionesAISI(): SidebarSection[] {
    // Prioridad 1: Leer de ProjectFacade.aisiGroups() (fuente principal)
    try {
      const gruposAISI = this.projectFacade.aisiGroups();
      if (gruposAISI && gruposAISI.length > 0) {
        return gruposAISI.map((grupo: any, index: number) => {
          const numero = index + 1;
          const nombreDistrito = grupo.nombre && grupo.nombre.trim() !== '' ? ` ${grupo.nombre}` : '';
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
    } catch (error) {
      // Silently fall through to legacy
    }

    // Prioridad 2: Fallback a datos legacy (FormularioService)
    const datos = this.projectFacade.obtenerDatos();
    const distritosAISI = datos['distritosAISI'] || [];

    if (distritosAISI.length === 0) {
      return [{
        id: '3.1.4.B.1',
        title: 'B.1 Centro Poblado',
        route: '/seccion/3.1.4.B.1',
        level: 4,
        expanded: false,
        children: this.generarSubseccionesB(1)
      }];
    }

    return distritosAISI.map((distrito: any, index: number) => {
      const numero = index + 1;
      const nombre = distrito?.nombre?.trim();
      const nombreDistrito = nombre ? ` ${nombre}` : '';
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
      { id: `3.1.4.B.${numero}.9`, title: `B.${numero}.9 Indicadores de educación`, route: `/seccion/3.1.4.B.${numero}.9`, level: 5 }
    ];
  }

  generarSeccionesAISD(): SidebarSection[] {
    // Prioridad 1: Leer de ProjectFacade.aisdGroups() (fuente principal)
    try {
      const gruposAISD = this.projectFacade.aisdGroups();
      if (gruposAISD && gruposAISD.length > 0) {
        return gruposAISD.map((grupo: any, index: number) => {
          const numero = index + 1;
          const nombreGrupo = grupo.nombre && grupo.nombre.trim() !== '' ? ` ${grupo.nombre}` : '';
          return {
            id: `3.1.4.A.${numero}`,
            title: `A.${numero} Comunidad Campesina${nombreGrupo}`,
            route: `/seccion/3.1.4.A.${numero}`,
            level: 4,
            expanded: false,
            children: this.generarSubseccionesA(numero)
          };
        });
      }
    } catch (error) {
      // Silently fall through to legacy
    }

    // Prioridad 2: Fallback a datos legacy (FormularioService)
    const datos = this.projectFacade.obtenerDatos();
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
    const seccionB = this.buscarSeccionPorId('3.1.4.B');
    if (seccionB) {
      seccionB.children = this.generarSeccionesAISI();
      this.loadExpandedState();
      this.cdRef.markForCheck();
    }
  }

  actualizarSeccionesAISD() {
    const seccionA = this.buscarSeccionPorId('3.1.4.A');
    if (seccionA) {
      seccionA.children = this.generarSeccionesAISD();
      this.loadExpandedState();
      this.cdRef.markForCheck();
    }
  }

  private buscarSeccionPorId(id: string): SidebarSection | undefined {
    const buscar = (sections: SidebarSection[]): SidebarSection | undefined => {
      for (const section of sections) {
        if (section.id === id) return section;
        if (section.children) {
          const encontrada = buscar(section.children);
          if (encontrada) return encontrada;
        }
      }
      return undefined;
    };
    return buscar(this.sections);
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
    this.storage.setItem('layoutExpandedSections', JSON.stringify(expandedIds));
  }

  private loadExpandedState() {
    const saved = this.storage.getItem('layoutExpandedSections');
    if (saved) {
      try {
        const expandedIds = JSON.parse(saved) as string[];
        this.applyExpandedState(this.sections, expandedIds);
      } catch (e) {
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

