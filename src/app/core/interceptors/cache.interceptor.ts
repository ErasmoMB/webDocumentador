import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    
    // Siempre interceptar respuestas del backend, incluso en modo mock (por si se conecta)
    if (req.url.startsWith(apiUrl)) {
      return next.handle(req).pipe(
        tap(event => {
          if (event instanceof HttpResponse && event.status === 200) {
            const url = req.url;
            const params = this.extractParams(req);
            const responseData = event.body;
            
            if (responseData && responseData.success) {
              console.log('🔄 Interceptando respuesta del backend:', url);
              this.cacheService.saveResponse(url, params, responseData);
            }
          }
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

