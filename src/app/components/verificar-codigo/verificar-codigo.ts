import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verificar-codigo.html',
  styleUrl: './verificar-codigo.css'
})
export class VerificacionComponent {
  email = this.obtenerEmail();
  codigo = '';
  mensaje = '';
  ok = false;

  constructor(private api: ApiService, private router: Router) {
    if (!this.email) this.router.navigateByUrl('/registro');
  }

  get emailEnmascarado() {
    const [usuario, dominio] = this.email.split('@');
    if (!usuario || !dominio) return 'tu correo';
    return `${usuario.slice(0, 2)}***@${dominio}`;
  }

  verificar() {
    this.mensaje = '';
    this.api.verificar({ email: this.email, codigo: this.codigo }).subscribe({
      next: r => {
        localStorage.setItem('vetsphere_token', r.data.token);
        sessionStorage.removeItem('vetsphere_verificacion');
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.ok = false;
        this.mensaje = 'Codigo invalido o expirado.';
      }
    });
  }

  reenviar() {
    this.api.reenviarCodigo(this.email).subscribe({
      next: () => {
        this.ok = true;
        this.mensaje = 'Codigo reenviado. Revisa tu Gmail.';
      },
      error: () => {
        this.ok = false;
        this.mensaje = 'No se pudo reenviar el codigo.';
      }
    });
  }

  private obtenerEmail() {
    const valor = sessionStorage.getItem('vetsphere_verificacion');
    if (!valor) return '';
    try {
      return JSON.parse(atob(valor)).email || '';
    } catch {
      return '';
    }
  }
}
