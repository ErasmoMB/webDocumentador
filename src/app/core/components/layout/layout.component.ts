import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
export class LayoutComponent implements OnInit {
  sidebarOpen = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.loadExpandedState();
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
              route: '/seccion/3.1.4',
              level: 2,
              expanded: false,
              children: [
                {
                  id: '3.1.4.A',
                  title: 'A. Caracterización socioeconómica del Área de Influencia Social Directa (AISD)',
                  route: '/seccion/3.1.4.A',
                  level: 3,
                  expanded: false,
                  children: [
                    {
                      id: '3.1.4.A.1',
                      title: 'A.1 Comunidad Campesina Ayroca',
                      route: '/seccion/3.1.4.A.1',
                      level: 4,
                      expanded: false,
                      children: [
                        { id: '3.1.4.A.1.1', title: 'A.1.1 Institucionalidad local', route: '/seccion/3.1.4.A.1.1', level: 5 },
                        { id: '3.1.4.A.1.2', title: 'A.1.2 Aspectos demográficos', route: '/seccion/3.1.4.A.1.2', level: 5 },
                        { id: '3.1.4.A.1.3', title: 'A.1.3 Aspectos económicos', route: '/seccion/3.1.4.A.1.3', level: 5 },
                        { id: '3.1.4.A.1.4', title: 'A.1.4 Actividades económicas', route: '/seccion/3.1.4.A.1.4', level: 5 },
                        { id: '3.1.4.A.1.5', title: 'A.1.5 Viviendas', route: '/seccion/3.1.4.A.1.5', level: 5 },
                        { id: '3.1.4.A.1.6', title: 'A.1.6 Servicios básicos', route: '/seccion/3.1.4.A.1.6', level: 5 },
                        { id: '3.1.4.A.1.7', title: 'A.1.7 Transporte y telecomunicaciones', route: '/seccion/3.1.4.A.1.7', level: 5 },
                        { id: '3.1.4.A.1.8', title: 'A.1.8 Infraestructura en salud, educación, recreación y deporte', route: '/seccion/3.1.4.A.1.8', level: 5 },
                        { id: '3.1.4.A.1.9', title: 'A.1.9 Indicadores de salud', route: '/seccion/3.1.4.A.1.9', level: 5 },
                        { id: '3.1.4.A.1.10', title: 'A.1.10 Indicadores de educación', route: '/seccion/3.1.4.A.1.10', level: 5 },
                        { id: '3.1.4.A.1.11', title: 'A.1.11 Aspectos culturales', route: '/seccion/3.1.4.A.1.11', level: 5 },
                        { id: '3.1.4.A.1.12', title: 'A.1.12 Agua, uso de suelos y recursos naturales', route: '/seccion/3.1.4.A.1.12', level: 5 },
                        { id: '3.1.4.A.1.13', title: 'A.1.13 Índice de Desarrollo Humano (IDH)', route: '/seccion/3.1.4.A.1.13', level: 5 },
                        { id: '3.1.4.A.1.14', title: 'A.1.14 Necesidades Básicas Insatisfechas (NBI)', route: '/seccion/3.1.4.A.1.14', level: 5 },
                        { id: '3.1.4.A.1.15', title: 'A.1.15 Organización social y liderazgo', route: '/seccion/3.1.4.A.1.15', level: 5 },
                        { id: '3.1.4.A.1.16', title: 'A.1.16 Festividades y tradiciones', route: '/seccion/3.1.4.A.1.16', level: 5 }
                      ]
                    }
                  ]
                },
                {
                  id: '3.1.4.B',
                  title: 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
                  route: '/seccion/3.1.4.B',
                  level: 3,
                  expanded: false,
                  children: [
                    {
                      id: '3.1.4.B.1',
                      title: 'B.1 Centro Poblado Cahuacho',
                      route: '/seccion/3.1.4.B.1',
                      level: 4,
                      expanded: false,
                      children: [
                        { id: '3.1.4.B.1.1', title: 'B.1.1 Aspectos demográficos', route: '/seccion/3.1.4.B.1.1', level: 5 },
                        { id: '3.1.4.B.1.2', title: 'B.1.2 Indicadores y distribución de la PEA', route: '/seccion/3.1.4.B.1.2', level: 5 },
                        { id: '3.1.4.B.1.3', title: 'B.1.3 Actividades económicas', route: '/seccion/3.1.4.B.1.3', level: 5 },
                        { id: '3.1.4.B.1.4', title: 'B.1.4 Vivienda', route: '/seccion/3.1.4.B.1.4', level: 5 },
                        { id: '3.1.4.B.1.5', title: 'B.1.5 Servicios básicos', route: '/seccion/3.1.4.B.1.5', level: 5 },
                        { id: '3.1.4.B.1.6', title: 'B.1.6 Infraestructura de transporte y comunicaciones', route: '/seccion/3.1.4.B.1.6', level: 5 },
                        { id: '3.1.4.B.1.7', title: 'B.1.7 Infraestructura en salud, educación, recreación y deporte', route: '/seccion/3.1.4.B.1.7', level: 5 },
                        { id: '3.1.4.B.1.8', title: 'B.1.8 Indicadores de salud', route: '/seccion/3.1.4.B.1.8', level: 5 },
                        { id: '3.1.4.B.1.9', title: 'B.1.9 Indicadores de educación', route: '/seccion/3.1.4.B.1.9', level: 5 },
                        { id: '3.1.4.B.1.10', title: 'B.1.10 Aspectos culturales', route: '/seccion/3.1.4.B.1.10', level: 5 },
                        { id: '3.1.4.B.1.11', title: 'B.1.11 Agua, uso de suelos y recursos naturales', route: '/seccion/3.1.4.B.1.11', level: 5 },
                        { id: '3.1.4.B.1.12', title: 'B.1.12 Índice de Desarrollo Humano (IDH)', route: '/seccion/3.1.4.B.1.12', level: 5 },
                        { id: '3.1.4.B.1.13', title: 'B.1.13 Necesidades Básicas Insatisfechas (NBI)', route: '/seccion/3.1.4.B.1.13', level: 5 },
                        { id: '3.1.4.B.1.14', title: 'B.1.14 Organización social y liderazgo', route: '/seccion/3.1.4.B.1.14', level: 5 },
                        { id: '3.1.4.B.1.15', title: 'B.1.15 Festividades, costumbres y turismo', route: '/seccion/3.1.4.B.1.15', level: 5 }
                      ]
                    }
                  ]
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

