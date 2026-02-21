import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../utilities/config.service';
import { timeout, catchError } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

/**
 * ✅ BACKEND AVAILABILITY SERVICE
 * 
 * Detecta si la BD está disponible haciendo health checks periódicos.
 * Expone un signal que indica si se debe usar localStorage como fallback.
 * 
 * FLUJO:
 * 1. Al iniciar: Hacer health check
 * 2. Si OK → backendAvailable = true (usar SOLO BD)
 * 3. Si FALLA → backendAvailable = false (usar localStorage como fallback)
 * 4. Revisar cada 30 segundos si vuelve a estar disponible
 */
@Injectable({
  providedIn: 'root'
})
export class BackendAvailabilityService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  // Signal que indica si el backend está disponible
  // ✅ ESTRATEGIA: Inicializar en TRUE (asumir que está disponible)
  // Solo cambiar a FALSE si el health check falla repeditamente
  private _backendAvailable = signal<boolean>(true);
  readonly backendAvailable = this._backendAvailable.asReadonly();

  // Signal que indica si está en proceso de verificación
  private _checking = signal<boolean>(false);
  readonly isChecking = this._checking.asReadonly();

  // Intervalo de health check (en ms)
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 60 segundos (reducido de 30s para menos carga)
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // NO hacer health check en constructor - hacerlo lazy después de 2s
    // Esto permite que el frontend cargue sin esperar conexión con backend
    
    // Configurar effect para logs
    effect(() => {
      const available = this._backendAvailable();
      const checking = this._checking();
      if (checking) {
        // console.log('🔄 [BackendAvailability] Verificando conexión con backend...');
      } else if (available) {
        // console.log('✅ [BackendAvailability] Backend DISPONIBLE - Usando SOLO base de datos (SessionDataService)');
      } else {
        console.warn('⚠️ [BackendAvailability] Backend NO disponible - Activando fallback localStorage');
      }
    });
    
    // Iniciar monitoreo periódico DESPUÉS de 2 segundos (permite que frontend cargue)
    setTimeout(() => {
      this.checkBackendHealth(); // Primer health check después de 2s
      this.startMonitoring(); // Luego iniciar intervalo
    }, 2000);
  }

  /**
   * Verifica la disponibilidad del backend
   * ESTRATEGIA: Intenta un endpoint conocido que devuelva cualquier respuesta
   * Si el servidor responde (incluso con error), está disponible
   */
  private checkBackendHealth(): void {
    this._checking.set(true);

    const apiUrl = this.configService.getApiUrl();
    
    // Endpoint con timeout CORTO (500ms)
    // If backend doesn't respond quickly, we assume it's available (preferir BD que localStorage)
    const testUrl = `${apiUrl}/session-data/load/health-check`;

    this.http
      .get(testUrl, {
        responseType: 'json',
        headers: {
          'x-session-id': 'health-check'
        }
      })
      .pipe(
        timeout(500), // ⚡ REDUCIDO de 3000ms a 500ms - evita bloquear UI
        // Cualquier respuesta (error de validación o éxito) = servidor está activo
        catchError((error: any) => {
          // Si es un error de red (CORS, conectividad), backend no disponible
          if (error.status === 0 || error.name === 'TimeoutError') {
            return EMPTY;
          }
          // Si es un error HTTP (400, 401, 403, 404, etc.), backend SÍ está activo
          // Solo es un error de la API, no de conectividad
          return of({ ok: true, serverActive: true });
        })
      )
      .subscribe({
        next: (response: any) => {
          // Si obtiene respuesta de cualquier tipo, el servidor está activo
          this._backendAvailable.set(true);
          this._checking.set(false);
        },
        error: (error) => {
          // Error de red o timeout = backend no disponible
          this._backendAvailable.set(false);
          this._checking.set(false);
        },
        complete: () => {
          // Si complete sin next (EMPTY), backend no disponible
          if (!this._backendAvailable()) {
            this._checking.set(false);
          }
        }
      });
  }

  /**
   * Inicia el monitoreo periódico de disponibilidad
   */
  startMonitoring(): void {
    // Evitar múltiples intervalos
    if (this.healthCheckInterval) {
      return;
    }

    // console.log('📊 [BackendAvailability] Iniciando monitoreo periódico (cada 30s)');
    
    this.healthCheckInterval = setInterval(() => {
      this.checkBackendHealth();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Detiene el monitoreo periódico
   */
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      // console.log('⏹️ [BackendAvailability] Monitoreo detenido');
    }
  }

  /**
   * Devuelve true si se debe usar localStorage
   * (cuando el backend NO está disponible)
   */
  shouldUseLocalStorage(): boolean {
    return !this._backendAvailable();
  }

  /**
   * Devuelve true si se debe usar SOLO backend
   * (cuando el backend está disponible)
   */
  shouldUseBackendOnly(): boolean {
    return this._backendAvailable();
  }

  /**
   * Limpia recursos
   */
  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}
