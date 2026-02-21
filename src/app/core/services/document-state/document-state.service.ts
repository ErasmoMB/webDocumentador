import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout, catchError, defaultIfEmpty } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentStateApiService {
  private readonly apiUrl = (environment.apiUrl || '').replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  async saveSection(documentId: string, sectionId: string, data: any): Promise<void> {
    if (!documentId || !sectionId) return;

    await firstValueFrom(
      this.http
        .post<any>(`${this.apiUrl}/document-state/save`, {
          documentId,
          sectionId,
          data,
        })
        .pipe(
          timeout(3000),
          catchError((err: any) => {
            console.warn('[DocumentStateApi] Error saving section state', err);
            return of(null);
          }),
          defaultIfEmpty(null),
        ),
    );
  }

  async loadSection(documentId: string, sectionId: string): Promise<any | null> {
    if (!documentId || !sectionId) return null;

    const resp = await firstValueFrom(
      this.http
        .get<any>(
          `${this.apiUrl}/document-state/load/${encodeURIComponent(documentId)}/${encodeURIComponent(sectionId)}`,
        )
        .pipe(
          timeout(3000),
          catchError((err: any) => {
            console.warn('[DocumentStateApi] Error loading section state', err);
            return of(null);
          }),
          defaultIfEmpty(null),
        ),
    );

    return resp?.data ?? null;
  }
}
