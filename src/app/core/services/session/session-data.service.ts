import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout, catchError, defaultIfEmpty } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { ConfigService } from '../utilities/config.service';
import { StorageFacade } from '../infrastructure/storage-facade.service';

@Injectable({ providedIn: 'root' })
export class SessionDataService {
  private readonly apiUrl: string;
  private readonly sessionIdKey = 'session-data:session-id';
  private readonly localPrefix = 'session-data:';

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private storageFacade: StorageFacade,
  ) {
    this.apiUrl = this.configService.getApiUrl();
  }

  async saveData(key: string, data: any): Promise<void> {
    try {
      const sessionId = this.getOrCreateSessionId();
      const headers = new HttpHeaders({
        'x-session-id': sessionId,
        'Content-Type': 'application/json',
      });

      console.log(`[SessionData] 💾 Guardando: key=${key}, sessionId=${sessionId}`);

      const response = await firstValueFrom(
        this.http.post<any>(
          `${this.apiUrl}/session-data/save`,
          { key, data },
          { headers }
        ).pipe(
          timeout(1000), // ⚡ Timeout de 1s para no bloquear
          catchError((error: any) => {
            console.warn(`[SessionData] ⚠️ Error guardando en backend, usando localStorage (catch)`);
            return of(null);
          }),
          defaultIfEmpty(null)
        )
      );

      if (!response) {
        console.warn(`[SessionData] ⚠️ Backend no devolvió respuesta — usando localStorage como fallback`);
        this.storageFacade.setItemStringified(this.localKey(key), data);
        return;
      }

      console.log(`[SessionData] ✅ Guardado exitoso:`, response);
    } catch (error) {
      console.error(`[SessionData] ❌ Error guardando ${key}:`, error);
      // Fallback a localStorage
      this.storageFacade.setItemStringified(this.localKey(key), data);
    }
  }

  async loadData(key: string): Promise<any> {
    try {
      const sessionId = this.getOrCreateSessionId();
      const headers = new HttpHeaders({
        'x-session-id': sessionId,
      });

      console.log(`[SessionData] 📥 Cargando: key=${key}, sessionId=${sessionId}`);

      const response: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/session-data/load/${encodeURIComponent(key)}`, {
          headers,
        }).pipe(
          timeout(1000), // ⚡ Timeout de 1s para no bloquear UI
          catchError((error: any) => {
            console.warn(`[SessionData] ⚠️ Error cargando de backend, usando localStorage`);
            return of(null);
          }),
          defaultIfEmpty(null)
        )
      );

      const value = response?.data ?? null;
      console.log(`[SessionData] ✅ Cargado:`, { key, value });
      
      if (value !== null) {
        this.storageFacade.setItemStringified(this.localKey(key), value);
      }
      return value;
    } catch (error) {
      console.error(`[SessionData] ⚠️ Error cargando ${key}:`, error);
      return this.storageFacade.getItemParsed<any>(this.localKey(key));
    }
  }

  async clearAll(): Promise<void> {
    try {
      const sessionId = this.getOrCreateSessionId();
      const headers = new HttpHeaders({
        'x-session-id': sessionId,
      });

      console.log(`[SessionData] 🗑️ Limpiando sesión: ${sessionId}`);

      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/session-data/clear`, {
          headers,
          body: {},
        }).pipe(
          timeout(1000), // ⚡ Timeout de 1s
          catchError((error: any) => {
            console.warn(`[SessionData] ⚠️ Error limpiando sesión en backend`);
            return of(null);
          }),
          defaultIfEmpty(null)
        )
      );

      console.log(`[SessionData] ✅ Sesión limpiada`);
    } catch (error) {
      console.error(`[SessionData] ⚠️ Error limpiando sesión:`, error);
    }

    const keys = this.storageFacade.keys();
    for (const key of keys) {
      if (key.startsWith(this.localPrefix)) {
        this.storageFacade.removeItem(key);
      }
    }
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const sessionId = this.getOrCreateSessionId();
      const headers = new HttpHeaders({
        'x-session-id': sessionId,
      });

      console.log(`[SessionData] 📤 Subiendo imagen: ${file.name}`);

      const response: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/session-data/upload-image`, formData, {
          headers,
        }),
      );

      if (typeof response === 'string') {
        console.log(`[SessionData] ✅ Imagen subida:`, response);
        return response;
      }
      if (typeof response?.url === 'string') {
        console.log(`[SessionData] ✅ Imagen subida:`, response.url);
        return response.url;
      }
      if (typeof response?.data === 'string') {
        console.log(`[SessionData] ✅ Imagen subida:`, response.data);
        return response.data;
      }
      return '';
    } catch (error) {
      console.error(`[SessionData] ⚠️ Error subiendo imagen:`, error);
      const base64 = await this.fileToBase64(file);
      await this.saveData(`image:${Date.now()}`, base64);
      return base64;
    }
  }

  private getOrCreateSessionId(): string {
    const current = this.storageFacade.getItem(this.sessionIdKey);
    if (current) {
      return current;
    }

    const created = this.generateSessionId();
    this.storageFacade.setItem(this.sessionIdKey, created);
    return created;
  }

  private localKey(key: string): string {
    return `${this.localPrefix}${key}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
}
