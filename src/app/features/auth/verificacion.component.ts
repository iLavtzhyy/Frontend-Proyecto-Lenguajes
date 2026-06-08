import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="grid min-h-screen place-items-center bg-slate-50 p-6">
      <form class="panel w-full max-w-md p-8 text-center" (ngSubmit)="verificar()">
        <p class="text-sm font-bold uppercase text-cyan-700">Segundo paso</p>
        <h1 class="mt-2 text-3xl font-black">Verifica tu correo</h1>
        <p class="mt-3 text-sm text-slate-500">Ingresa el codigo enviado a {{ email }}.</p>
        <input class="mt-8 w-full rounded-lg border p-4 text-center text-2xl font-black tracking-[.6rem]" maxlength="6" [(ngModel)]="codigo" name="codigo">
        <button class="boton-primario mt-6 w-full">Verificar y entrar</button>
      </form>
    </main>
  `
})
export class VerificacionComponent {
  email = this.route.snapshot.queryParamMap.get('email') ?? '';
  codigo = '';
  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}
  verificar() {
    this.api.verificar({ email: this.email, codigo: this.codigo }).subscribe(r => {
      localStorage.setItem('vetsphere_token', r.data.token);
      this.router.navigateByUrl('/dashboard');
    });
  }
}
