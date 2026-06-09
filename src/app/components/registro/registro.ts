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
  form = { nombres: '', apellidos: '', email: '', telefono: '', password: '', rolSolicitado: 'ROLE_CLIENTE' };
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  registrar() {
    this.error = '';
    this.api.registrar(this.form).subscribe({
      next: () => {
        sessionStorage.setItem('vetsphere_verificacion', btoa(JSON.stringify({ email: this.form.email })));
        this.router.navigateByUrl('/verificacion');
      },
      error: () => this.error = 'No se pudo registrar. Revisa datos, correo duplicado o backend.'
    });
  }
}
