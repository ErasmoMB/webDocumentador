import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SectionAccessControlService } from '../services/section-access-control.service';
import { LoggerService } from '../services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class SectionAccessGuard implements CanActivate {

  constructor(
    private accessControl: SectionAccessControlService,
    private router: Router,
    private logger: LoggerService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const sectionId = route.params['id'] || route.data['sectionId'];

    if (!sectionId) {
      this.logger.warn('[SectionAccessGuard] Sin sectionId en ruta', state.url);
      return new Observable(obs => obs.next(true)); // Permitir si no hay sección específica
    }

    return this.accessControl.getSectionAccessState$(sectionId).pipe(
      tap(accessState => {
        if (!accessState.isAvailable) {
          this.logger.warn(
            `[SectionAccessGuard] Acceso denegado a ${sectionId}: ${accessState.reason}`
          );
        }
      }),
      map(accessState => {
        if (!accessState.isAvailable) {
          this.router.navigate(['/inicio']);
          return false;
        }
        return true;
      })
    );
  }
}
