import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { GlobalErrorHandler } from './handlers/global-error.handler';
import { PersistenceObserverService } from './persistence/persistence-observer.service';

/**
 * CoreModule
 * Módulo singleton que contiene servicios globales y configuración de la aplicación.
 * Solo debe importarse UNA VEZ en AppModule.
 * 
 * Incluye:
 * - Servicios singleton (providedIn: 'root')
 * - Interceptors HTTP
 * - Guards
 * - Global Error Handler
 * - Configuración global
 */
@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    // ✅ CRÍTICO: Inyectar PersistenceObserverService para que su effect() se ejecute
    // Esto garantiza que la persistencia automática funcione desde el inicio de la app
    PersistenceObserverService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule ya fue importado. Importar solo en AppModule (root module).'
      );
    }
  }
}
