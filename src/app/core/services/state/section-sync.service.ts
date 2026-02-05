import { Injectable } from '@angular/core';
import { Subscription, Subject, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { FormStateService } from './form-state.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

/**
 * Servicio centralizado para sincronización reactiva entre formulario y secciones
 * 
 * Este servicio maneja la suscripción a cambios de campos específicos por sección,
 * incluyendo manejo automático de prefijos (A.1, B.1, etc.)
 */
@Injectable({ providedIn: 'root' })
export class SectionSyncService {
  private sectionSubscriptions = new Map<string, Subscription>();
  private changeNotifier = new Subject<{ sectionId: string; changes: Record<string, any> }>();
  
  readonly changes$ = this.changeNotifier.asObservable();

  constructor(
    private formState: FormStateService
  ) {}

  /**
   * Suscribe una sección a cambios de campos específicos
   * 
   * @param sectionId ID de la sección (ej: '3.1.4.A.1')
   * @param fields Array de nombres de campos a observar
   * @param callback Función a ejecutar cuando hay cambios
   * @returns Subscription que puede ser cancelada
   */
  subscribeToSection(
    sectionId: string,
    fields: string[],
    callback: (changes: Record<string, any>) => void
  ): Subscription {
    // Limpiar suscripción anterior si existe
    this.unsubscribeFromSection(sectionId);

    if (!fields || fields.length === 0) {
      // Si no hay campos, crear suscripción vacía
      return new Subscription();
    }

    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(sectionId);
    
    // Expandir campos con prefijos
    const allFields = this.expandFieldsWithPrefixes(fields, prefijo);

    // Crear observables para cada campo
    const fieldObservables = allFields.map(fieldName => {
      // Intentar obtener desde FormStateService primero
      const groupIds = ['form', 'default', 'table', 'section'];
      
      const observables = groupIds.map(groupId => 
        this.formState.getField$(sectionId, groupId, fieldName).pipe(
          map(value => ({ fieldName, groupId, value })),
          distinctUntilChanged((prev, curr) => {
            // Comparación profunda para arrays y objetos
            return JSON.stringify(prev.value) === JSON.stringify(curr.value);
          })
        )
      );

      // Combinar todos los grupos y tomar el primero que tenga valor
      return combineLatest(observables).pipe(
        map(results => {
          // Buscar el primer resultado con valor no nulo
          const result = results.find(r => r.value !== null && r.value !== undefined);
          return result ? { fieldName, value: result.value } : null;
        }),
        distinctUntilChanged((prev, curr) => {
          if (!prev && !curr) return true;
          if (!prev || !curr) return false;
          return JSON.stringify(prev.value) === JSON.stringify(curr.value);
        })
      );
    });

    // Combinar todos los campos
    const subscription = combineLatest(fieldObservables).pipe(
      debounceTime(10), // Pequeño debounce para agrupar cambios rápidos
      map(fieldResults => {
        const changes: Record<string, any> = {};
        fieldResults.forEach(result => {
          if (result && result.value !== undefined && result.value !== null) {
            changes[result.fieldName] = result.value;
          }
        });
        return changes;
      }),
      distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      })
    ).subscribe(changes => {
      if (Object.keys(changes).length > 0) {
        callback(changes);
      }
    });

    // También suscribirse a cambios notificados directamente (más inmediato)
    const changeSubscription = this.changes$.pipe(
      debounceTime(50),
      map(notification => {
        if (notification.sectionId !== sectionId) return null;
        
        const relevantChanges: Record<string, any> = {};
        Object.keys(notification.changes).forEach(fieldName => {
          // Verificar si el campo está en la lista de campos relevantes
          if (allFields.includes(fieldName)) {
            // Hacer copia profunda de arrays para evitar problemas de referencia
            const valor = notification.changes[fieldName];
            if (Array.isArray(valor)) {
              relevantChanges[fieldName] = valor.map(item => 
                typeof item === 'object' && item !== null ? { ...item } : item
              );
            } else {
              relevantChanges[fieldName] = valor;
            }
          }
        });
        
        return Object.keys(relevantChanges).length > 0 ? relevantChanges : null;
      }),
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        // Comparación profunda usando JSON.stringify
        return JSON.stringify(prev) === JSON.stringify(curr);
      })
    ).subscribe(changes => {
      if (changes && Object.keys(changes).length > 0) {
        // Ejecutar callback inmediatamente para cambios notificados
        callback(changes);
      }
    });

    // Combinar ambas suscripciones
    const combinedSubscription = new Subscription();
    combinedSubscription.add(subscription);
    combinedSubscription.add(changeSubscription);

    this.sectionSubscriptions.set(sectionId, combinedSubscription);
    return combinedSubscription;
  }

  /**
   * Expande campos con prefijos (ej: 'poblacionSexoAISD' → ['poblacionSexoAISD', 'poblacionSexoAISD_A1'])
   */
  private expandFieldsWithPrefixes(fields: string[], prefijo?: string): string[] {
    const expanded = new Set<string>();
    
    fields.forEach(field => {
      // Agregar campo base
      expanded.add(field);
      
      // Agregar con prefijo si existe
      if (prefijo) {
        expanded.add(`${field}${prefijo}`);
      }
    });
    
    return Array.from(expanded);
  }

  /**
   * Notifica cambios manualmente (usado por FormChangeService)
   */
  notifyChanges(sectionId: string, changes: Record<string, any>): void {
    // Notificar cambios internamente sin logging ruidoso por defecto
    this.changeNotifier.next({ sectionId, changes });
  }

  /**
   * Fuerza actualización de una sección
   */
  forceUpdate(sectionId: string): void {
    const subscription = this.sectionSubscriptions.get(sectionId);
    if (subscription) {
      // Disparar actualización inmediata
      this.changeNotifier.next({ sectionId, changes: {} });
    }
  }

  /**
   * Cancela suscripción de una sección
   */
  unsubscribeFromSection(sectionId: string): void {
    const subscription = this.sectionSubscriptions.get(sectionId);
    if (subscription) {
      subscription.unsubscribe();
      this.sectionSubscriptions.delete(sectionId);
    }
  }

  /**
   * Limpia todas las suscripciones
   */
  clearAll(): void {
    this.sectionSubscriptions.forEach(sub => sub.unsubscribe());
    this.sectionSubscriptions.clear();
  }
}
