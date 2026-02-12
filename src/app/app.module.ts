import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { LayoutComponent } from './core/components/layout/layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DataCleanupService } from './core/services/utilities/data-cleanup.service';
import { MockDataInitializerHandler } from './core/handlers/mock-data-initializer.handler';
import { StateRehydrationService } from './core/persistence/state-rehydration.service';
import { SECTION_PROVIDERS } from './core/dependency-injection.config';

/**
 * Factory para inicializar limpieza de datos legacy
 * Se ejecuta antes de que la aplicación inicie completamente
 */
export function initializeDataCleanup(cleanupService: DataCleanupService) {
  return () => cleanupService.cleanupLegacyData();
}

/**
 * Factory para inicializar datos del mock
 * Se ejecuta antes de que la aplicación inicie completamente
 */
export function initializeMockData(mockDataInitializer: MockDataInitializerHandler) {
  return () => mockDataInitializer.initializeMockData();
}

/**
 * Factory para rehidratar el estado desde localStorage
 * Se ejecuta PRIMERO para restaurar datos persistidos
 */
export function initializeStateRehydration(rehydrationService: StateRehydrationService) {
  return () => rehydrationService.rehydrate();
}

@NgModule({ declarations: [
        AppComponent,
        LayoutComponent,
        MainLayoutComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        RouterModule,
        CoreModule, // ✅ Importado UNA VEZ - singleton guard
        AppRoutingModule], providers: [
        ...SECTION_PROVIDERS,
        // ✅ PRIMERO: Rehidratar estado desde localStorage
        provideAppInitializer(() => {
          const initializerFn = (initializeStateRehydration)(inject(StateRehydrationService));
          return initializerFn();
        }),
        provideAppInitializer(() => {
          const initializerFn = (initializeDataCleanup)(inject(DataCleanupService));
          return initializerFn();
        }),
        provideAppInitializer(() => {
          const initializerFn = (initializeMockData)(inject(MockDataInitializerHandler));
          return initializerFn();
        }),
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }

