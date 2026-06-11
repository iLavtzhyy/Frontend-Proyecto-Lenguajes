import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SesionInactividadService } from './sesion-inactividad.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionInactividad = inject(SesionInactividadService);
  const token = localStorage.getItem('vetsphere_token');
  const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        sesionInactividad.cerrarSesion('Tu token expiro o no es valido. Inicia sesion nuevamente.');
      }
      return throwError(() => error);
    })
  );
};
