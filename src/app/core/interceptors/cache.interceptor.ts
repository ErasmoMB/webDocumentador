import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CacheService } from '../services/cache.service';
import { ConfigService } from '../services/config.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(
    private cacheService: CacheService,
    private configService: ConfigService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiUrl = this.configService.getApiUrl();
    
    // Verificar si estamos en la vista de plantilla (modo vista)
    const isPlantillaView = typeof window !== 'undefined' && window.location.pathname.includes('/plantilla');
    
    // Siempre interceptar respuestas del backend, incluso en modo mock (por si se conecta)
    if (req.url.startsWith(apiUrl)) {
      return next.handle(req).pipe(
        tap(event => {
          // Solo guardar en cache respuestas exitosas (200)
          if (event instanceof HttpResponse && event.status === 200) {
            const url = req.url;
            const params = this.extractParams(req);
            const responseData = event.body;
            
            if (responseData && responseData.success) {
              // Solo mostrar logs cuando no estamos en modo vista
              if (!isPlantillaView) {
                console.log('✅ Respuesta exitosa cacheada:', url);
              }
              this.cacheService.saveResponse(url, params, responseData);
            }
          }
        }),
        catchError((error: HttpErrorResponse) => {
          // Silenciar completamente errores 500 en modo vista (plantilla) para no llenar la consola
          // Estos errores son esperados cuando el backend no está disponible o tiene problemas
          // Los datos ya están cargados desde formularioService en modo vista
          if (isPlantillaView && error.status >= 500) {
            // Retornar un observable vacío para evitar que se muestren más errores
            // Esto previene que se propaguen errores adicionales en la consola
            return new Observable<HttpEvent<any>>(observer => {
              observer.complete();
            });
          }
          
          // Log de errores solo cuando no estamos en modo vista
          if (error.status === 0) {
            console.warn('⚠️ Conexión rechazada:', req.url);
          } else if (error.status >= 500) {
            console.warn(`⚠️ Error ${error.status} del servidor:`, req.url);
          } else if (error.status >= 400) {
            console.warn(`⚠️ Error ${error.status} del cliente:`, req.url);
          }
          
          // Re-lanzar el error para que los interceptores posteriores lo manejen
          throw error;
        })
      );
    }

    return next.handle(req);
  }

  private extractParams(req: HttpRequest<any>): any {
    const params: any = {};
    
    if (req.params) {
      req.params.keys().forEach(key => {
        params[key] = req.params.get(key);
      });
    }

    if (req.urlWithParams !== req.url) {
      const urlParams = new URLSearchParams(req.urlWithParams.split('?')[1]);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }
}

