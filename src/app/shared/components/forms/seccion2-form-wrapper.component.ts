import { Component, Input, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChild, Injector, effect, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion2Component } from '../seccion2/seccion2.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GruposService } from 'src/app/core/services/domain/grupos.service';
import { CentrosPobladosSearchService } from 'src/app/core/services/centros-poblados-search.service';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';
import { Subscription } from 'rxjs';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion2Component],
    selector: 'app-seccion2-form-wrapper',
    templateUrl: './seccion2-form-wrapper.component.html',
    styleUrls: ['./seccion2-form-wrapper.component.css']
})
export class Seccion2FormWrapperComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() seccionId: string = '';
  @ViewChild(Seccion2Component) seccion2Component!: Seccion2Component;
  
  formData: any = {};
  comunidadesCampesinas: ComunidadCampesina[] = [];
  distritosAISI: Distrito[] = [];
  centrosPobladosJSON: any[] = [];
  autocompleteData: any = {};
  private subscription?: Subscription;

  readonly aisdGroupsSignal: Signal<readonly any[]> = this.projectFacade.groupsByType('AISD');
  readonly aisiGroupsSignal: Signal<readonly any[]> = this.projectFacade.groupsByType('AISI');
  readonly allCentrosSignal = this.projectFacade.allPopulatedCenters();
  
  readonly comunidadesSignal: Signal<ComunidadCampesina[]> = computed(() => {
    const grupos = this.aisdGroupsSignal();
    
    if (grupos.length === 0) {
      return [];
    }
    
    return grupos
      .filter((g: any) => g && g.nombre)
      .map((grupo: any) => {
        const codigosSeleccionados: string[] = [];
        
        if (grupo.ccppIds && Array.isArray(grupo.ccppIds)) {
          grupo.ccppIds.forEach((codigo: string) => {
            codigosSeleccionados.push(String(codigo).trim());
          });
        }
        
        return {
          id: grupo.id,
          nombre: grupo.nombre,
          centrosPobladosSeleccionados: codigosSeleccionados,
          esNueva: false
        };
      });
  });
  
  readonly distritosSignal: Signal<Distrito[]> = computed(() => {
    const grupos = this.aisiGroupsSignal();
    
    if (grupos.length === 0) {
      return [];
    }
    
    return grupos
      .filter((g: any) => g && g.nombre)
      .map((grupo: any) => {
        const codigosSeleccionados: string[] = [];
        
        if (grupo.ccppIds && Array.isArray(grupo.ccppIds)) {
          grupo.ccppIds.forEach((codigo: string) => {
            codigosSeleccionados.push(String(codigo).trim());
          });
        }
        
        return {
          id: grupo.id,
          nombre: grupo.nombre,
          centrosPobladosSeleccionados: codigosSeleccionados,
          esNueva: false
        };
      });
  });

  constructor(
    private projectFacade: ProjectStateFacade,
    private cdRef: ChangeDetectorRef,
    private formChange: FormChangeService,
    private gruposService: GruposService,
    private centrosPobladosSearch: CentrosPobladosSearchService,
    private injector: Injector
  ) {
    effect(() => {
      const gruposAISD = this.aisdGroupsSignal();
      
      if (gruposAISD.length > 0) {
        const comunidadesExistentes = new Map(this.comunidadesCampesinas.map(c => [c.id, c]));
        
        this.comunidadesCampesinas = gruposAISD.map((g: any) => {
          const existente = comunidadesExistentes.get(g.id);
          return {
            id: g.id,
            nombre: g.nombre,
            centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim()),
            esNueva: existente?.esNueva ?? false
          };
        });
        
        setTimeout(() => {
          const comunidadesParaPersistir = gruposAISD.map(g => ({
            id: g.id,
            nombre: g.nombre,
            centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
          }));
          
          this.formChange.persistFields(this.seccionId, 'form', {
            comunidadesCampesinas: comunidadesParaPersistir
          }, {
            updateLegacy: true,
            updateState: true,
            notifySync: true,
            persist: true
          });
        }, 50);
      }
      this.cdRef.markForCheck();
    });
    
    effect(() => {
      const gruposAISI = this.aisiGroupsSignal();
      
      if (gruposAISI.length > 0) {
        const distritosExistentes = new Map(this.distritosAISI.map(d => [d.id, d]));
        
        this.distritosAISI = gruposAISI.map((g: any) => {
          const existente = distritosExistentes.get(g.id);
          return {
            id: g.id,
            nombre: g.nombre,
            nombreOriginal: g.nombre,
            centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim()),
            esNuevo: existente?.esNuevo ?? false
          };
        });
        
        setTimeout(() => {
          const distritosParaPersistir = gruposAISI.map(g => {
            const distritoLocal = this.distritosAISI.find(d => d.id === g.id);
            return {
              id: g.id,
              nombre: g.nombre,
              nombreOriginal: distritoLocal?.nombreOriginal || g.nombre,
              centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
            };
          });
          
          this.formChange.persistFields(this.seccionId, 'form', {
            distritosAISI: distritosParaPersistir
          }, {
            updateLegacy: true,
            updateState: true,
            notifySync: true,
            persist: true
          });
        }, 50);
      }
      this.cdRef.markForCheck();
    });
  }

  ngOnInit() {
    this.actualizarDatos();
    this.restaurarGruposDesdeLocalStorage();
    
    const gruposAISD = this.aisdGroupsSignal();
    if (gruposAISD.length > 0) {
      this.comunidadesCampesinas = gruposAISD.map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim()),
        esNueva: false
      }));
      
      setTimeout(() => {
        const comunidadesParaPersistir = gruposAISD.map(g => ({
          id: g.id,
          nombre: g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
        }));
        
        this.formChange.persistFields(this.seccionId, 'form', {
          comunidadesCampesinas: comunidadesParaPersistir
        }, {
          updateLegacy: true,
          updateState: true,
          notifySync: true,
          persist: true
        });
      }, 100);
    }
    
    const gruposAISI = this.aisiGroupsSignal();
    if (gruposAISI.length > 0) {
      this.distritosAISI = gruposAISI.map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        nombreOriginal: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim()),
        esNuevo: false
      }));
      
      setTimeout(() => {
        const distritosParaPersistir = gruposAISI.map(g => ({
          id: g.id,
          nombre: g.nombre,
          nombreOriginal: g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
        }));
        
        this.formChange.persistFields(this.seccionId, 'form', {
          distritosAISI: distritosParaPersistir
        }, {
          updateLegacy: true,
          updateState: true,
          notifySync: true,
          persist: true
        });
      }, 100);
    }
    
    this.cdRef.markForCheck();
  }

  private restaurarGruposDesdeLocalStorage(): void {
    const datos = this.projectFacade.obtenerDatos();
    const gruposAISDEnStore = this.aisdGroupsSignal();
    const gruposAISIEnStore = this.aisiGroupsSignal();
    
    const comunidadesPersistidas = datos['comunidadesCampesinas'] as ComunidadCampesina[] | undefined;
    
    if (comunidadesPersistidas && comunidadesPersistidas.length > 0) {
      if (gruposAISDEnStore.length === 0) {
        comunidadesPersistidas.forEach(cc => {
          this.projectFacade.addGroup('AISD', cc.nombre, null);
        });
        
        setTimeout(() => {
          const gruposAISD = this.aisdGroupsSignal();
          
          comunidadesPersistidas.forEach(cc => {
            const grupoCreado = gruposAISD.find(g => g.nombre === cc.nombre);
            if (grupoCreado && cc.centrosPobladosSeleccionados && cc.centrosPobladosSeleccionados.length > 0) {
              this.projectFacade.dispatch({
                type: 'groupConfig/setGroupCCPP',
                payload: { tipo: 'AISD', groupId: grupoCreado.id, ccppIds: cc.centrosPobladosSeleccionados }
              });
            }
          });
          this.cdRef.markForCheck();
        }, 150);
      } else {
        const gruposFaltantes = comunidadesPersistidas.filter(cc => 
          !gruposAISDEnStore.some(g => g.id === cc.id || g.nombre === cc.nombre)
        );
        
        if (gruposFaltantes.length > 0) {
          gruposFaltantes.forEach(cc => {
            this.projectFacade.addGroup('AISD', cc.nombre, null);
          });
          
          setTimeout(() => {
            const gruposAISD = this.aisdGroupsSignal();
            
            gruposFaltantes.forEach(cc => {
              const grupoCreado = gruposAISD.find(g => g.nombre === cc.nombre);
              if (grupoCreado && cc.centrosPobladosSeleccionados && cc.centrosPobladosSeleccionados.length > 0) {
                this.projectFacade.dispatch({
                  type: 'groupConfig/setGroupCCPP',
                  payload: { tipo: 'AISD', groupId: grupoCreado.id, ccppIds: cc.centrosPobladosSeleccionados }
                });
              }
            });
            this.cdRef.markForCheck();
          }, 150);
        }
      }
    }
    
    const distritosPersistidos = datos['distritosAISI'] as Distrito[] | undefined;
    
    if (distritosPersistidos && distritosPersistidos.length > 0) {
      if (gruposAISIEnStore.length === 0) {
        distritosPersistidos.forEach(d => {
          this.projectFacade.addGroup('AISI', d.nombre, null);
        });
        
        setTimeout(() => {
          const gruposAISI = this.aisiGroupsSignal();
          
          distritosPersistidos.forEach(d => {
            const grupoCreado = gruposAISI.find(g => g.nombre === d.nombre);
            if (grupoCreado && d.centrosPobladosSeleccionados && d.centrosPobladosSeleccionados.length > 0) {
              this.projectFacade.dispatch({
                type: 'groupConfig/setGroupCCPP',
                payload: { tipo: 'AISI', groupId: grupoCreado.id, ccppIds: d.centrosPobladosSeleccionados }
              });
            }
          });
          this.cdRef.markForCheck();
        }, 150);
      } else {
        const gruposFaltantes = distritosPersistidos.filter(d => 
          !gruposAISIEnStore.some(g => g.id === d.id || g.nombre === d.nombre)
        );
        
        if (gruposFaltantes.length > 0) {
          gruposFaltantes.forEach(d => {
            this.projectFacade.addGroup('AISI', d.nombre, null);
          });
          
          setTimeout(() => {
            const gruposAISI = this.aisiGroupsSignal();
            
            gruposFaltantes.forEach(d => {
              const grupoCreado = gruposAISI.find(g => g.nombre === d.nombre);
              if (grupoCreado && d.centrosPobladosSeleccionados && d.centrosPobladosSeleccionados.length > 0) {
                this.projectFacade.dispatch({
                  type: 'groupConfig/setGroupCCPP',
                  payload: { tipo: 'AISI', groupId: grupoCreado.id, ccppIds: d.centrosPobladosSeleccionados }
                });
              }
            });
            this.cdRef.markForCheck();
          }, 150);
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const gruposAISD = this.aisdGroupsSignal();
      const gruposAISI = this.aisiGroupsSignal();
      
      if (gruposAISD.length > 0 && this.comunidadesCampesinas.length === 0) {
        this.comunidadesCampesinas = gruposAISD.map((g: any) => ({
          id: g.id,
          nombre: g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim()),
          esNueva: false
        }));
      }
      
      if (gruposAISI.length > 0 && this.distritosAISI.length === 0) {
        this.distritosAISI = gruposAISI.map((g: any) => ({
          id: g.id,
          nombre: g.nombre,
          nombreOriginal: g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim()),
          esNueva: false
        }));
      }
      
      this.cdRef.markForCheck();
    }, 0);
  }

  actualizarDatos() {
    const datos = this.projectFacade.obtenerDatos();
    this.formData = { ...datos };
    
    const comunidadesRaw = datos['comunidadesCampesinas'] || [];
    if (comunidadesRaw.length > 0) {
      this.comunidadesCampesinas = comunidadesRaw.map((cc: any) => ({
        ...cc,
        centrosPobladosSeleccionados: (cc.centrosPobladosSeleccionados || []).map((c: any) => {
          if (c === null || c === undefined) return '';
          return c.toString().trim();
        }).filter((codigo: string) => codigo !== '')
      }));
    }
    
    this.centrosPobladosJSON = datos['centrosPobladosJSON'] || [];
  }

  obtenerCentrosPobladosDeComunidad(comunidadId: string): any[] {
    const grupo = this.aisdGroupsSignal().find((g: any) => g.id === comunidadId);
    if (!grupo || !grupo.ccppIds || grupo.ccppIds.length === 0) {
      return [];
    }
    
    const todosLosCentros = this.obtenerTodosLosCentrosPoblados();
    
    return todosLosCentros.filter((cp: any) => {
      const codigo = String(cp.CODIGO || '').trim();
      return grupo.ccppIds.some((id: string) => String(id).trim() === codigo);
    });
  }

  private obtenerTodosLosCentrosPoblados(): any[] {
    const centrosDesdeState = this.allCentrosSignal();
    if (centrosDesdeState && centrosDesdeState.length > 0) {
      return centrosDesdeState.map((entry: any) => ({
        ITEM: entry.item || 0,
        UBIGEO: entry.ubigeo || 0,
        CODIGO: entry.codigo || '',
        CCPP: entry.nombre || '',
        CATEGORIA: entry.categoria || '',
        POBLACION: entry.poblacion || 0,
        DPTO: entry.dpto || '',
        PROV: entry.prov || '',
        DIST: entry.dist || '',
        ESTE: entry.este || 0,
        NORTE: entry.norte || 0,
        ALTITUD: entry.altitud || 0
      }));
    }
    
    const datos = this.projectFacade.obtenerDatos();
    const centrosDesdeJSON = this.aplanarJsonCentros();
    const centrosExtra = this.centrosPobladosJSON || [];
    const claves = new Set<string>();
    const resultado: any[] = [];

    [...centrosDesdeJSON, ...centrosExtra].forEach((cp: any) => {
      const clave = cp?.CODIGO?.toString?.() || `${cp?.CCPP || ''}-${cp?.ITEM || ''}`;
      if (!claves.has(clave)) {
        claves.add(clave);
        resultado.push(cp);
      }
    });

    return resultado.length > 0 
      ? resultado 
      : this.centrosPobladosSearch.obtenerTodosLosCentrosPoblados(datos);
  }

  private aplanarJsonCentros(): any[] {
    const datos = this.projectFacade.obtenerDatos();
    return this.centrosPobladosSearch.obtenerTodosLosCentrosPoblados(datos);
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
  }

  eliminarComunidadCampesina(id: string) {
    // Verificar que haya al menos una comunidad antes de eliminar
    if (this.comunidadesCampesinas.length <= 1) {
      alert('No se puede eliminar la última comunidad. Debe haber al menos una comunidad campesina.');
      return;
    }
    
    // Confirmar eliminación
    if (!confirm('¿Está seguro de que desea eliminar esta comunidad campesina?')) {
      return;
    }
    
    this.projectFacade.removeGroup('AISD', id, true);
    this.comunidadesCampesinas = this.comunidadesCampesinas.filter(cc => cc.id !== id);
    
    setTimeout(() => {
      const gruposAISD = this.aisdGroupsSignal();
      const comunidadesParaPersistir = gruposAISD.map(g => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
      
      this.formChange.persistFields(this.seccionId, 'form', {
        comunidadesCampesinas: comunidadesParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  agregarComunidadCampesina() {
    const nombre = `Comunidad Campesina ${this.comunidadesCampesinas.length + 1}`;
    this.projectFacade.addGroup('AISD', nombre, null);
    
    setTimeout(() => {
      const gruposAISD = this.aisdGroupsSignal();
      const nuevoGrupo = gruposAISD[gruposAISD.length - 1];
      
      if (nuevoGrupo) {
        const comunidad = this.comunidadesCampesinas.find(cc => cc.id === nuevoGrupo.id);
        if (comunidad) {
          comunidad.esNueva = true;
          comunidad.centrosPobladosSeleccionados = [];
        }
        
        setTimeout(() => {
          const gruposAISD = this.aisdGroupsSignal();
          const comunidadesParaPersistir = gruposAISD.map(g => ({
            id: g.id,
            nombre: g.nombre,
            centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
          }));
          
          this.formChange.persistFields(this.seccionId, 'form', {
            comunidadesCampesinas: comunidadesParaPersistir
          }, {
            updateLegacy: true,
            updateState: true,
            notifySync: true,
            persist: true
          });
        }, 50);
        
        this.cdRef.markForCheck();
      }
    }, 100);
  }

  actualizarNombreComunidad(id: string, nombre: string) {
    const nombreLimpio = (nombre || '').trim();
    
    if (!nombreLimpio) {
      return;
    }
    
    this.projectFacade.renameGroup('AISD', id, nombreLimpio);
    
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      comunidad.nombre = nombreLimpio;
      if (comunidad.esNueva) {
        comunidad.esNueva = false;
      }
    }
    
    setTimeout(() => {
      const gruposAISD = this.aisdGroupsSignal();
      const comunidadesParaPersistir = gruposAISD.map(g => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
      
      this.formChange.persistFields(this.seccionId, 'form', {
        comunidadesCampesinas: comunidadesParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    if (this.seccion2Component && this.seccion2Component['obtenerCentrosPobladosSeleccionadosComunidad']) {
      return this.seccion2Component.obtenerCentrosPobladosSeleccionadosComunidad(id);
    }
    return [];
  }

  obtenerCentrosPobladosVisibles(comunidad: ComunidadCampesina): any[] {
    if (comunidad && (comunidad.esNueva || !comunidad.centrosPobladosSeleccionados || comunidad.centrosPobladosSeleccionados.length === 0)) {
      return this.obtenerTodosLosCentrosPoblados();
    }
    return this.obtenerCentrosPobladosDeComunidad(comunidad.id);
  }

  estaCentroPobladoSeleccionadoComunidad(id: string, codigo: string): boolean {
    const grupo = this.aisdGroupsSignal().find((g: any) => g.id === id);
    if (!grupo || !grupo.ccppIds) {
      return false;
    }
    
    const codigoNormalizado = codigo?.toString().trim() || '';
    return grupo.ccppIds.some((c: string) => String(c).trim() === codigoNormalizado);
  }

  toggleCentroPobladoComunidad(id: string, codigo: string) {
    const codigoNormalizado = codigo?.toString().trim() || '';
    if (!codigoNormalizado) return;
    
    const grupo = this.aisdGroupsSignal().find((g: any) => g.id === id);
    if (!grupo) return;
    
    const codigosSeleccionados = grupo.ccppIds || [];
    const existe = codigosSeleccionados.some((c: string) => String(c).trim() === codigoNormalizado);
    
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (!comunidad) return;
    
    if (existe) {
      this.projectFacade.dispatch({
        type: 'groupConfig/removeCCPPFromGroup',
        payload: { tipo: 'AISD', groupId: id, ccppId: codigoNormalizado }
      });
      
      comunidad.centrosPobladosSeleccionados = (comunidad.centrosPobladosSeleccionados || []).filter(c => String(c).trim() !== codigoNormalizado);
      if (comunidad.centrosPobladosSeleccionados.length === 0 && comunidad.nombre && !comunidad.nombre.startsWith('Comunidad Campesina ')) {
        comunidad.esNueva = false;
      }
    } else {
      this.projectFacade.dispatch({
        type: 'groupConfig/addCCPPToGroup',
        payload: { tipo: 'AISD', groupId: id, ccppId: codigoNormalizado }
      });
      
      comunidad.centrosPobladosSeleccionados = [...(comunidad.centrosPobladosSeleccionados || []), codigoNormalizado];
      if (comunidad.nombre && !comunidad.nombre.startsWith('Comunidad Campesina ')) {
        comunidad.esNueva = false;
      }
    }
    
    setTimeout(() => {
      const gruposAISD = this.aisdGroupsSignal();
      const comunidadesParaPersistir = gruposAISD.map(g => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
      
      this.formChange.persistFields(this.seccionId, 'form', {
        comunidadesCampesinas: comunidadesParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  seleccionarTodosCentrosPobladosComunidad(id: string) {
    const todosLosCentros = this.obtenerTodosLosCentrosPoblados();
    const codigos = todosLosCentros.map(cp => String(cp.CODIGO || '')).filter(c => c);
    
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISD', groupId: id, ccppIds: codigos }
    });
    
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      comunidad.centrosPobladosSeleccionados = [...codigos];
      if (comunidad.esNueva) {
        comunidad.esNueva = false;
      }
    }
    
    setTimeout(() => {
      const gruposAISD = this.aisdGroupsSignal();
      const comunidadesParaPersistir = gruposAISD.map(g => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
      
      this.formChange.persistFields(this.seccionId, 'form', {
        comunidadesCampesinas: comunidadesParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string) {
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISD', groupId: id, ccppIds: [] }
    });
    
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      comunidad.centrosPobladosSeleccionados = [];
    }
    
    setTimeout(() => {
      const gruposAISD = this.aisdGroupsSignal();
      const comunidadesParaPersistir = gruposAISD.map(g => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
      
      this.formChange.persistFields(this.seccionId, 'form', {
        comunidadesCampesinas: comunidadesParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  onAutocompleteInput(field: string, value: string) {
    this.formData[field] = value;
    this.formChange.persistFields(this.seccionId, 'form', { [field]: value });
    
    if (this.seccion2Component && this.seccion2Component['onAutocompleteInput']) {
      this.seccion2Component['onAutocompleteInput'](field, value);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = { ...this.seccion2Component['autocompleteData'] };
        this.cdRef.detectChanges();
      }
    }
    this.actualizarDatos();
  }

  onFocusDistritoAdicional(field: string) {
    if (this.seccion2Component && this.seccion2Component['onFocusDistritoAdicional']) {
      this.seccion2Component['onFocusDistritoAdicional'](field);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = { ...this.seccion2Component['autocompleteData'] };
        this.cdRef.detectChanges();
      }
    }
  }

  cerrarSugerenciasAutocomplete(field: string) {
    if (this.seccion2Component && this.seccion2Component['cerrarSugerenciasAutocomplete']) {
      this.seccion2Component['cerrarSugerenciasAutocomplete'](field);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = { ...this.seccion2Component['autocompleteData'] };
        this.cdRef.detectChanges();
      }
    }
  }

  seleccionarSugerencia(field: string, sugerencia: any) {
    if (this.seccion2Component && this.seccion2Component['seleccionarSugerencia']) {
      this.seccion2Component['seleccionarSugerencia'](field, sugerencia);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = { ...this.seccion2Component['autocompleteData'] };
        this.cdRef.detectChanges();
      }
      this.actualizarDatos();
    }
  }

  trackByComunidadId(index: number, comunidad: ComunidadCampesina): string {
    return comunidad.id;
  }

  obtenerComunidades(): ComunidadCampesina[] {
    return this.comunidadesCampesinas;
  }

  obtenerDistritos(): Distrito[] {
    return this.distritosAISI;
  }

  obtenerCentrosPobladosDeDistrito(distritoId: string): any[] {
    const grupo = this.aisiGroupsSignal().find((g: any) => g.id === distritoId);
    if (!grupo) {
      return [];
    }

    if (!grupo.ccppIds || grupo.ccppIds.length === 0) {
      return this.obtenerTodosLosCentrosPoblados();
    }

    const todosLosCentros = this.obtenerTodosLosCentrosPoblados();
    
    return todosLosCentros.filter((cp: any) => {
      const codigo = String(cp.CODIGO || '').trim();
      return grupo.ccppIds.some((id: string) => String(id).trim() === codigo);
    });
  }

  obtenerCentrosPobladosVisiblesDistrito(distrito: Distrito): any[] {
    if (distrito && (distrito.esNuevo || !distrito.centrosPobladosSeleccionados || distrito.centrosPobladosSeleccionados.length === 0)) {
      return this.obtenerTodosLosCentrosPoblados();
    }
    return this.obtenerCentrosPobladosDeDistrito(distrito.id);
  }

  estaCentroPobladoSeleccionadoDistrito(id: string, codigo: string): boolean {
    const grupo = this.aisiGroupsSignal().find((g: any) => g.id === id);
    if (!grupo || !grupo.ccppIds) {
      return false;
    }
    
    const codigoNormalizado = codigo?.toString().trim() || '';
    return grupo.ccppIds.some((c: string) => String(c).trim() === codigoNormalizado);
  }

  toggleCentroPobladoDistrito(id: string, codigo: string) {
    const codigoNormalizado = codigo?.toString().trim() || '';
    if (!codigoNormalizado) return;
    
    // Consultar estado actual desde ProjectStateFacade
    const grupo = this.aisiGroupsSignal().find((g: any) => g.id === id);
    if (!grupo) return;
    
    const codigosSeleccionados = grupo.ccppIds || [];
    const existe = codigosSeleccionados.some((c: string) => String(c).trim() === codigoNormalizado);
    
    // Actualizar array local
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (!distrito) return;
    
    if (existe) {
      // Remover centro poblado
      this.projectFacade.dispatch({
        type: 'groupConfig/removeCCPPFromGroup',
        payload: { tipo: 'AISI', groupId: id, ccppId: codigoNormalizado }
      });
      
      distrito.centrosPobladosSeleccionados = (distrito.centrosPobladosSeleccionados || []).filter(c => String(c).trim() !== codigoNormalizado);
      if (distrito.centrosPobladosSeleccionados.length === 0 && distrito.nombre && !distrito.nombre.startsWith('Distrito ')) {
        distrito.esNuevo = false;
      }
    } else {
      this.projectFacade.dispatch({
        type: 'groupConfig/addCCPPToGroup',
        payload: { tipo: 'AISI', groupId: id, ccppId: codigoNormalizado }
      });
      
      distrito.centrosPobladosSeleccionados = [...(distrito.centrosPobladosSeleccionados || []), codigoNormalizado];
      if (distrito.nombre && !distrito.nombre.startsWith('Distrito ')) {
        distrito.esNuevo = false;
      }
    }
    
    setTimeout(() => {
      const gruposAISI = this.aisiGroupsSignal();
      const distritosParaPersistir = gruposAISI.map(g => {
        const distritoLocal = this.distritosAISI.find(d => d.id === g.id);
        return {
          id: g.id,
          nombre: g.nombre,
          nombreOriginal: distritoLocal?.nombreOriginal || g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
        };
      });
      
      this.formChange.persistFields(this.seccionId, 'form', {
        distritosAISI: distritosParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  seleccionarTodosCentrosPobladosDistrito(id: string) {
    // Obtener todos los códigos de centros poblados disponibles para este distrito
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (!distrito) return;
    
    const todosLosCentros = this.obtenerTodosLosCentrosPoblados();
    // Filtrar centros poblados que pertenecen al distrito del grupo AISI
    const centrosDelDistrito = todosLosCentros.filter((cp: any) => {
      return cp.DIST && cp.DIST.trim().toUpperCase() === distrito.nombre.trim().toUpperCase();
    });
    
    const codigos = centrosDelDistrito.map(cp => String(cp.CODIGO || '')).filter(c => c);
    
    // Si no hay centros del distrito específico, usar todos los centros disponibles
    const codigosFinales = codigos.length > 0 ? codigos : todosLosCentros.map(cp => String(cp.CODIGO || '')).filter(c => c);
    
    // Actualizar en ProjectStateFacade
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISI', groupId: id, ccppIds: codigosFinales }
    });
    
    // Actualizar array local inmediatamente
    distrito.centrosPobladosSeleccionados = [...codigosFinales];
    if (distrito.esNuevo) {
      distrito.esNuevo = false;
    }
    
    setTimeout(() => {
      const gruposAISI = this.aisiGroupsSignal();
      const distritosParaPersistir = gruposAISI.map(g => {
        const distritoLocal = this.distritosAISI.find(d => d.id === g.id);
        return {
          id: g.id,
          nombre: g.nombre,
          nombreOriginal: distritoLocal?.nombreOriginal || g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
        };
      });
      
      this.formChange.persistFields(this.seccionId, 'form', {
        distritosAISI: distritosParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  deseleccionarTodosCentrosPobladosDistrito(id: string) {
    // Actualizar en ProjectStateFacade
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISI', groupId: id, ccppIds: [] }
    });
    
    // Actualizar array local inmediatamente
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (distrito) {
      distrito.centrosPobladosSeleccionados = [];
    }
    
    setTimeout(() => {
      const gruposAISI = this.aisiGroupsSignal();
      const distritosParaPersistir = gruposAISI.map(g => {
        const distritoLocal = this.distritosAISI.find(d => d.id === g.id);
        return {
          id: g.id,
          nombre: g.nombre,
          nombreOriginal: distritoLocal?.nombreOriginal || g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
        };
      });
      
      this.formChange.persistFields(this.seccionId, 'form', {
        distritosAISI: distritosParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  agregarDistritoAISI() {
    const nombre = `Distrito ${this.distritosAISI.length + 1}`;
    this.projectFacade.addGroup('AISI', nombre, null);
    
    setTimeout(() => {
      const gruposAISI = this.aisiGroupsSignal();
      const nuevoGrupo = gruposAISI[gruposAISI.length - 1];
      
      if (nuevoGrupo) {
        const distrito = this.distritosAISI.find(d => d.id === nuevoGrupo.id);
        if (distrito) {
          distrito.esNuevo = true;
          distrito.centrosPobladosSeleccionados = [];
        }
        
        setTimeout(() => {
          const gruposAISI = this.aisiGroupsSignal();
          const distritosParaPersistir = gruposAISI.map(g => ({
            id: g.id,
            nombre: g.nombre,
            nombreOriginal: g.nombre,
            centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
          }));
          
          this.formChange.persistFields(this.seccionId, 'form', {
            distritosAISI: distritosParaPersistir
          }, {
            updateLegacy: true,
            updateState: true,
            notifySync: true,
            persist: true
          });
        }, 50);
        
        this.cdRef.markForCheck();
      }
    }, 100);
  }

  eliminarDistritoAISI(id: string) {
    if (this.distritosAISI.length <= 1) {
      alert('No se puede eliminar el último distrito. Debe haber al menos un distrito.');
      return;
    }
    
    if (!confirm('¿Está seguro de que desea eliminar este distrito?')) {
      return;
    }
    
    this.projectFacade.removeGroup('AISI', id, true);
    this.distritosAISI = this.distritosAISI.filter(d => d.id !== id);
    
    setTimeout(() => {
      const gruposAISI = this.aisiGroupsSignal();
      const distritosParaPersistir = gruposAISI.map(g => {
        const distritoLocal = this.distritosAISI.find(d => d.id === g.id);
        return {
          id: g.id,
          nombre: g.nombre,
          nombreOriginal: distritoLocal?.nombreOriginal || g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
        };
      });
      
      this.formChange.persistFields(this.seccionId, 'form', {
        distritosAISI: distritosParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  actualizarNombreDistrito(id: string, nombre: string) {
    const nombreLimpio = (nombre || '').trim();
    
    if (!nombreLimpio) {
      return;
    }
    
    this.projectFacade.renameGroup('AISI', id, nombreLimpio);
    
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (distrito) {
      distrito.nombre = nombreLimpio;
      if (distrito.esNuevo) {
        distrito.esNuevo = false;
      }
    }
    
    setTimeout(() => {
      const gruposAISI = this.aisiGroupsSignal();
      const distritosParaPersistir = gruposAISI.map(g => {
        const distritoLocal = this.distritosAISI.find(d => d.id === g.id);
        return {
          id: g.id,
          nombre: g.nombre,
          nombreOriginal: distritoLocal?.nombreOriginal || g.nombre,
          centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
        };
      });
      
      this.formChange.persistFields(this.seccionId, 'form', {
        distritosAISI: distritosParaPersistir
      }, {
        updateLegacy: true,
        updateState: true,
        notifySync: true,
        persist: true
      });
    }, 50);
    
    this.cdRef.markForCheck();
  }

  trackByDistritoId(index: number, distrito: Distrito): string {
    return distrito.id;
  }
}
