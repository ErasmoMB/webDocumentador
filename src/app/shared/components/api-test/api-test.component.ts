import { Component, OnInit } from '@angular/core';
import { PoblacionService } from '../../../core/services/poblacion.service';
import { DataService } from '../../../core/services/data.service';
import { ConfigService } from '../../../core/services/config.service';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  error?: any;
  timestamp?: Date;
}

@Component({
  selector: 'app-api-test',
  template: `
    <div class="api-test-container" style="padding: 20px; max-width: 1200px; margin: 0 auto; min-height: 100%;">
      <h2>🧪 Pruebas de Endpoints del Backend</h2>
      
      <div class="config-info" style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3>Configuración Actual</h3>
        <p><strong>URL Base:</strong> {{ configService.getApiUrl() }}</p>
        <p><strong>Modo Mock:</strong> {{ configService.isMockMode() ? '✅ Activado' : '❌ Desactivado (Backend)' }}</p>
      </div>

      <div class="test-controls" style="margin-bottom: 20px;">
        <button (click)="testAllEndpoints()" class="btn btn-primary" style="padding: 10px 20px; margin-right: 10px;">
          Probar Todos los Endpoints
        </button>
        <button (click)="clearResults()" class="btn btn-secondary" style="padding: 10px 20px;">
          Limpiar Resultados
        </button>
      </div>

      <div class="test-results">
        <div *ngFor="let result of testResults" class="test-result" 
             [ngClass]="{
               'success': result.status === 'success',
               'error': result.status === 'error',
               'pending': result.status === 'pending'
             }"
             style="border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 15px;">
          
          <div class="result-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0;">
              <span *ngIf="result.status === 'success'">✅</span>
              <span *ngIf="result.status === 'error'">❌</span>
              <span *ngIf="result.status === 'pending'">⏳</span>
              {{ result.endpoint }}
            </h4>
            <span *ngIf="result.timestamp" style="color: #666; font-size: 12px;">
              {{ result.timestamp | date:'HH:mm:ss' }}
            </span>
          </div>

          <p style="margin: 5px 0;"><strong>Estado:</strong> {{ result.message }}</p>

          <div *ngIf="result.data" class="result-data" style="background: #f9f9f9; padding: 10px; border-radius: 3px; margin-top: 10px;">
            <pre style="margin: 0; font-size: 12px; overflow-x: auto;">{{ formatData(result.data) }}</pre>
          </div>

          <div *ngIf="result.error" class="result-error" style="background: #ffe6e6; padding: 10px; border-radius: 3px; margin-top: 10px;">
            <strong>Error:</strong>
            <pre style="margin: 5px 0 0 0; font-size: 12px; color: #d00;">{{ formatError(result.error) }}</pre>
          </div>
        </div>
      </div>

      <div *ngIf="testResults.length === 0" class="no-results" style="text-align: center; padding: 40px; color: #666;">
        <p>No hay resultados de pruebas aún. Haz clic en "Probar Todos los Endpoints" para comenzar.</p>
      </div>
    </div>
  `,
  styles: [`
    .test-result.success {
      border-left: 4px solid #28a745;
    }
    .test-result.error {
      border-left: 4px solid #dc3545;
    }
    .test-result.pending {
      border-left: 4px solid #ffc107;
    }
    .btn {
      cursor: pointer;
      border: none;
      border-radius: 4px;
      font-weight: 500;
    }
    .btn-primary {
      background: #007bff;
      color: white;
    }
    .btn-primary:hover {
      background: #0056b3;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-secondary:hover {
      background: #545b62;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  testResults: TestResult[] = [];

  constructor(
    public configService: ConfigService,
    private poblacionService: PoblacionService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    console.log('🧪 Componente de pruebas de API inicializado');
  }

  testAllEndpoints(): void {
    this.clearResults();
    
    // Test 1: Población por CPP
    this.testPoblacionByCpp();
    
    // Test 2: Población por Distrito
    this.testPoblacionByDistrito();
    
    // Test 3: Población por Provincia
    this.testPoblacionByProvincia();
    
    // Test 4: PEA/No PEA por Distrito
    this.testPEAByDistrito();
  }

  testPoblacionByCpp(): void {
    const result: TestResult = {
      endpoint: 'GET /api/v1/poblacion/?cpp=101010001,101010002',
      status: 'pending',
      message: 'Probando...',
      timestamp: new Date()
    };
    this.testResults.push(result);

    this.poblacionService.getPoblacionByCpp(['101010001', '101010002']).subscribe({
      next: (response) => {
        result.status = 'success';
        result.message = `✅ Éxito: ${response.message}`;
        result.data = response.data;
        result.timestamp = new Date();
      },
      error: (error) => {
        result.status = 'error';
        result.message = '❌ Error al conectar con el endpoint';
        result.error = error;
        result.timestamp = new Date();
      }
    });
  }

  testPoblacionByDistrito(): void {
    const result: TestResult = {
      endpoint: 'GET /api/v1/poblacion/distrito?distrito=CHACHAPOYAS',
      status: 'pending',
      message: 'Probando...',
      timestamp: new Date()
    };
    this.testResults.push(result);

    this.poblacionService.getPoblacionByDistrito('CHACHAPOYAS').subscribe({
      next: (response) => {
        result.status = 'success';
        result.message = `✅ Éxito: ${response.message}`;
        result.data = response.data;
        result.timestamp = new Date();
      },
      error: (error) => {
        result.status = 'error';
        result.message = '❌ Error al conectar con el endpoint';
        result.error = error;
        result.timestamp = new Date();
      }
    });
  }

  testPoblacionByProvincia(): void {
    const result: TestResult = {
      endpoint: 'GET /api/v1/poblacion/provincia?provincia=CHACHAPOYAS',
      status: 'pending',
      message: 'Probando...',
      timestamp: new Date()
    };
    this.testResults.push(result);

    this.poblacionService.getPoblacionByProvincia('CHACHAPOYAS').subscribe({
      next: (response) => {
        result.status = 'success';
        result.message = `✅ Éxito: ${response.message}`;
        result.data = response.data;
        result.timestamp = new Date();
      },
      error: (error) => {
        result.status = 'error';
        result.message = '❌ Error al conectar con el endpoint';
        result.error = error;
        result.timestamp = new Date();
      }
    });
  }

  testPEAByDistrito(): void {
    const result: TestResult = {
      endpoint: 'GET /api/v1/censo/pea-nopea?distrito=CHACHAPOYAS',
      status: 'pending',
      message: 'Probando...',
      timestamp: new Date()
    };
    this.testResults.push(result);

    this.poblacionService.getPEANoPEAByDistrito('CHACHAPOYAS').subscribe({
      next: (response) => {
        result.status = 'success';
        result.message = `✅ Éxito: ${response.message}`;
        result.data = response.data;
        result.timestamp = new Date();
        
        // Verificar estructura de respuesta
        this.validatePEAStructure(response.data);
      },
      error: (error) => {
        result.status = 'error';
        result.message = '❌ Error al conectar con el endpoint';
        result.error = error;
        result.timestamp = new Date();
      }
    });
  }

  validatePEAStructure(data: any): void {
    console.log('📊 Estructura de respuesta PEA recibida:', data);
    
    // Verificar si la estructura coincide con el README
    const expectedStructure = {
      pea: 'number',
      no_pea: 'number',
      porcentaje_pea: 'string',
      porcentaje_no_pea: 'string',
      ocupada: 'number',
      desocupada: 'number',
      porcentaje_ocupada: 'string',
      porcentaje_desocupada: 'string'
    };

    const actualStructure = Object.keys(data).reduce((acc, key) => {
      acc[key] = typeof data[key];
      return acc;
    }, {} as any);

    console.log('📋 Estructura esperada (según README):', expectedStructure);
    console.log('📋 Estructura actual recibida:', actualStructure);
  }

  formatData(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  formatError(error: any): string {
    if (error.error) {
      return JSON.stringify(error.error, null, 2);
    }
    return error.message || String(error);
  }

  clearResults(): void {
    this.testResults = [];
  }
}

