import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private cache: any | null = null;
  private loading: Promise<any> | null = null;

  constructor(private http: HttpClient) {}

  async getCapitulo3Datos(): Promise<any> {
    if (this.cache) {
      return this.cache;
    }

    if (this.loading) {
      return this.loading;
    }

    const path = `${environment.mockDataPath}/capitulo3.json`;
    this.loading = firstValueFrom(this.http.get(path))
      .then(data => {
        this.cache = data;
        this.loading = null;
        return this.cache;
      })
      .catch(error => {
        this.loading = null;
        throw error;
      });

    return this.loading;
  }
}
