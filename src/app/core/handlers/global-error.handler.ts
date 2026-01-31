import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from '../services/infrastructure/logger.service';

/**
 * GlobalErrorHandler
 * Captura y gestiona todos los errores no controlados de la aplicación
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private logger: LoggerService) {}

  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      // Errores HTTP
      this.handleHttpError(error);
    } else {
      // Errores JavaScript
      this.handleClientError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    const errorMsg = `[HTTP Error] ${error.status} ${error.statusText}`;
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      this.logger.error(`${errorMsg}: ${error.error.message}`, error);
    } else {
      // Error del lado del servidor
      this.logger.error(
        `${errorMsg}\nURL: ${error.url}\nBody: ${JSON.stringify(error.error)}`,
        error
      );
    }

    // Notificar al usuario (integrar con servicio de notificaciones)
    this.notifyUser(this.getUserFriendlyMessage(error));
  }

  private handleClientError(error: Error): void {
    const errorMsg = `[Client Error] ${error.message || error.toString()}`;
    this.logger.error(errorMsg, error);

    // Stack trace para debugging
    if (error.stack) {
      this.logger.debug(`Stack: ${error.stack}`);
    }

    // Notificar al usuario
    this.notifyUser('Ha ocurrido un error inesperado. Por favor, recarga la página.');
  }

  private getUserFriendlyMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'No se puede conectar al servidor. Verifica tu conexión a internet.';
      case 400:
        return 'Los datos enviados no son válidos. Por favor, verifica la información.';
      case 401:
        return 'No estás autorizado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no existe.';
      case 500:
        return 'Error del servidor. Por favor, intenta más tarde.';
      case 503:
        return 'El servicio no está disponible temporalmente.';
      default:
        return 'Ha ocurrido un error. Por favor, intenta nuevamente.';
    }
  }

  private notifyUser(message: string): void {
    // TODO: Integrar con servicio de notificaciones/snackbar
    console.warn('User Notification:', message);
    
    // Ejemplo: si tienes un NotificationService
    // this.notificationService.show(message, 'error');
  }
}
