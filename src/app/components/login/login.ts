import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { IconoComponent } from '../../shared/components/icono/icono';
import { SesionInactividadService } from '../../core/sesion-inactividad.service';
import { AutorizacionService } from '../../core/autorizacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconoComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  recuperacionAbierta = false;
  pasoRecuperacion = 1;
  recuperacionEmail = '';
  codigoRecuperacion = '';
  nuevaPassword = '';
  mensajeRecuperacion = '';
  mensajeRecuperacionOk = false;

  constructor(private api: ApiService, private router: Router, private sesionInactividad: SesionInactividadService, private autorizacion: AutorizacionService) {
    const mensajeSesion = this.sesionInactividad.consumirMensaje();
    if (mensajeSesion) this.error = mensajeSesion;
  }

  entrar() {
    this.error = '';
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: r => {
        this.autorizacion.guardarSesion(r.data);
        this.sesionInactividad.registrarActividad();
        this.router.navigateByUrl('/dashboard');
      },
      error: () => this.error = 'No se pudo iniciar sesion. Revisa correo, contrasena o backend.'
    });
  }

  abrirRecuperacion() {
    this.recuperacionAbierta = true;
    this.pasoRecuperacion = 1;
    this.mensajeRecuperacion = '';
    this.recuperacionEmail = this.email;
  }

  cerrarRecuperacion() {
    this.recuperacionAbierta = false;
    this.mensajeRecuperacion = '';
  }

  enviarRecuperacion() {
    this.api.solicitarRecuperacion(this.recuperacionEmail).subscribe({
      next: () => {
        this.mensajeRecuperacionOk = true;
        this.mensajeRecuperacion = 'Codigo enviado. Revisa tu Gmail.';
        this.pasoRecuperacion = 2;
      },
      error: () => {
        this.mensajeRecuperacionOk = false;
        this.mensajeRecuperacion = 'No se pudo enviar el codigo. Revisa el correo o el backend.';
      }
    });
  }

  restablecer() {
    this.api.restablecerPassword({ email: this.recuperacionEmail, codigo: this.codigoRecuperacion, nuevaPassword: this.nuevaPassword }).subscribe({
      next: () => {
        this.mensajeRecuperacionOk = true;
        this.mensajeRecuperacion = 'Contrasena actualizada. Ya puedes iniciar sesion.';
        this.email = this.recuperacionEmail;
        this.password = '';
        setTimeout(() => this.cerrarRecuperacion(), 800);
      },
      error: () => {
        this.mensajeRecuperacionOk = false;
        this.mensajeRecuperacion = 'Codigo invalido o expirado.';
      }
    });
  }
}
