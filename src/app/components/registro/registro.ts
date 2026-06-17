import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {
  tipoRegistro: 'cliente' | 'personal' = 'cliente';
  form = { nombres: '', apellidos: '', email: '', telefono: '', password: '', rolSolicitado: 'ROLE_CLIENTE' };
  codigoAdmin = '';
  solicitudEnviada = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  cambiarTipo(tipo: 'cliente' | 'personal') {
    this.tipoRegistro = tipo;
    this.form.rolSolicitado = tipo === 'cliente' ? 'ROLE_CLIENTE' : 'ROLE_VETERINARIO';
    this.error = '';
  }

  registrar() {
    this.error = '';
    const payload = {
      ...this.form,
      codigoAdmin: this.tipoRegistro === 'personal' ? this.codigoAdmin : undefined
    };
    this.api.registrar(payload).subscribe({
      next: () => {
        if (this.tipoRegistro === 'cliente') {
          sessionStorage.setItem('vetsphere_verificacion', btoa(JSON.stringify({ email: this.form.email })));
          this.router.navigateByUrl('/verificacion');
        } else {
          this.solicitudEnviada = true;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'No se pudo registrar. Revisa los datos, correo duplicado o el código de administrador.';
      }
    });
  }
}
