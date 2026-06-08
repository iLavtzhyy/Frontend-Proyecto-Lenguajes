import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="grid min-h-screen place-items-center bg-slate-50 p-6">
      <form class="panel w-full max-w-xl p-8" (ngSubmit)="registrar()">
        <p class="text-sm font-bold uppercase text-cyan-700">Nuevo tutor</p>
        <h1 class="mt-2 text-3xl font-black">Registro con verificacion</h1>
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <input class="rounded-lg border p-3" placeholder="Nombres" [(ngModel)]="form.nombres" name="nombres">
          <input class="rounded-lg border p-3" placeholder="Apellidos" [(ngModel)]="form.apellidos" name="apellidos">
          <input class="rounded-lg border p-3 md:col-span-2" placeholder="Correo" [(ngModel)]="form.email" name="email">
          <input class="rounded-lg border p-3" placeholder="Telefono" [(ngModel)]="form.telefono" name="telefono">
          <input class="rounded-lg border p-3" type="password" placeholder="Password" [(ngModel)]="form.password" name="password">
          <select class="rounded-lg border p-3 md:col-span-2" [(ngModel)]="form.rolSolicitado" name="rolSolicitado">
            <option value="ROLE_CLIENTE">Cliente</option>
            <option value="ROLE_RECEPCIONISTA">Recepcionista</option>
            <option value="ROLE_VETERINARIO">Veterinario</option>
          </select>
        </div>
        <button class="boton-primario mt-6 w-full">Enviar solicitud y codigo</button>
        <a routerLink="/login" class="mt-4 block text-center text-sm font-bold text-cyan-700">Ya tengo cuenta</a>
      </form>
    </main>
  `
})
export class RegistroComponent {
  form = { nombres: '', apellidos: '', email: '', telefono: '', password: '', rolSolicitado: 'ROLE_CLIENTE' };
  constructor(private api: ApiService, private router: Router) {}
  registrar() {
    this.api.registrar(this.form).subscribe(() => this.router.navigate(['/verificacion'], { queryParams: { email: this.form.email } }));
  }
}
