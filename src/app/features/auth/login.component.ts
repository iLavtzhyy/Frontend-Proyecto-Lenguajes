import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[1.1fr_.9fr]">
      <section class="relative hidden overflow-hidden lg:block">
        <img class="h-full w-full object-cover" src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1600" alt="Clinica veterinaria">
        <div class="absolute inset-0 bg-slate-950/45"></div>
        <div class="absolute bottom-16 left-16 max-w-xl text-white">
          <img class="mb-5 h-28 w-28 rounded-lg object-contain bg-white/95 p-2 shadow-xl" src="assets/logo-vetsphere-icon.png" alt="VetSphere">
          <h1 class="text-6xl font-black">VetSphere</h1>
          <p class="mt-4 text-lg text-cyan-50">Gestion clinica, cirugias, reportes, farmacia SOAP y seguimiento completo de cada paciente.</p>
        </div>
      </section>
      <section class="flex items-center justify-center p-8">
        <form class="w-full max-w-md panel p-8" (ngSubmit)="entrar()">
          <p class="text-sm font-bold uppercase text-cyan-700">Acceso seguro</p>
          <h2 class="mt-2 text-3xl font-black">Iniciar sesion</h2>
          <label class="mt-8 block text-sm font-bold">Correo</label>
          <input class="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3" [(ngModel)]="email" name="email">
          <label class="mt-4 block text-sm font-bold">Password</label>
          <input type="password" class="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3" [(ngModel)]="password" name="password">
          <button class="boton-primario mt-6 w-full">Entrar</button>
          <a routerLink="/registro" class="mt-5 block text-center text-sm font-bold text-cyan-700">Crear cuenta nueva</a>
          <p class="mt-4 text-xs text-slate-500">Admin: admin1&#64;vetsphere.com / Vet2026!</p>
        </form>
      </section>
    </main>
  `
})
export class LoginComponent {
  email = 'admin1@vetsphere.com';
  password = 'Vet2026!';
  constructor(private api: ApiService, private router: Router) {}
  entrar() {
    this.api.login({ email: this.email, password: this.password }).subscribe(r => {
      localStorage.setItem('vetsphere_token', r.data.token);
      this.router.navigateByUrl('/dashboard');
    });
  }
}
