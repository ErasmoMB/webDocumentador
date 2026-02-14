import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StorageFacade } from '../infrastructure/storage-facade.service';

@Injectable({ providedIn: 'root' })
export class SessionDataService {
  private readonly apiUrl = (environment.apiUrl || '').replace(/\/$/, '');
  private readonly sessionIdKey = 'session-data:session-id';
  private readonly localPrefix = 'session-data:';

  constructor(
    private http: HttpClient,
    private storageFacade: StorageFacade,
  ) {}

  async saveData(key: string, data: any): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/session-data/save`,
          { key, data },
          { headers: this.buildHeaders() },
        ),
      );
    } catch {
      this.storageFacade.setItemStringified(this.localKey(key), data);
    }
  }

  async loadData(key: string): Promise<any> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/session-data/load/${encodeURIComponent(key)}`, {
          headers: this.buildHeaders(),
        }),
      );

      const value = response?.data ?? null;
      if (value !== null) {
        this.storageFacade.setItemStringified(this.localKey(key), value);
      }
      return value;
    } catch {
      return this.storageFacade.getItemParsed<any>(this.localKey(key));
    }
  }

  async clearAll(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/session-data/clear`, {
          headers: this.buildHeaders(),
          body: {},
        }),
      );
    } catch {
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
      const response: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/session-data/upload-image`, formData, {
          headers: this.buildHeaders(),
        }),
      );

      if (typeof response === 'string') {
        return response;
      }
      if (typeof response?.url === 'string') {
        return response.url;
      }
      if (typeof response?.data === 'string') {
        return response.data;
      }
      return '';
    } catch {
      const base64 = await this.fileToBase64(file);
      await this.saveData(`image:${Date.now()}`, base64);
      return base64;
    }
  }

  private buildHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-session-id': this.getOrCreateSessionId(),
    });
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
