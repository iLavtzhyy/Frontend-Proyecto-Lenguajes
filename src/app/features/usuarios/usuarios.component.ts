import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Administracion</p>
          <h1 class="page-title">Usuarios y solicitudes</h1>
          <p class="page-subtitle">Administra administradores, recepcionistas, veterinarios, clientes y aprobaciones pendientes.</p>
        </div>
        <button class="boton-primario" type="button" (click)="nuevo()">
          <app-icono name="users" [size]="18"></app-icono>
          Crear usuario
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <article class="stat-card"><p class="stat-label">Usuarios</p><p class="stat-value">{{ usuarios.length }}</p><p class="stat-note">Registrados</p></article>
        <article class="stat-card"><p class="stat-label">Veterinarios</p><p class="stat-value">{{ porRol('ROLE_VETERINARIO') }}</p><p class="stat-note">Equipo medico</p></article>
        <article class="stat-card"><p class="stat-label">Recepcion</p><p class="stat-value">{{ porRol('ROLE_RECEPCIONISTA') }}</p><p class="stat-note">Admision</p></article>
        <article class="stat-card"><p class="stat-label">Pendientes</p><p class="stat-value text-amber-700 dark:text-amber-300">{{ solicitudes.length }}</p><p class="stat-note">Por aprobar</p></article>
      </div>

      <div class="panel p-4">
        <input class="campo w-full" placeholder="Buscar por nombre, email, telefono o rol..." [(ngModel)]="busqueda">
      </div>

      <div class="table-wrap overflow-x-auto">
        <div class="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 class="section-title">Solicitudes pendientes</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Cuando un recepcionista o veterinario se registra, aparece aqui para aprobarlo.</p>
        </div>
        <table class="data-table" *ngIf="solicitudes.length; else sinSolicitudes">
          <thead><tr><th>Usuario</th><th>Email</th><th>Telefono</th><th>Rol</th><th>Accion</th></tr></thead>
          <tbody>
            <tr *ngFor="let u of solicitudes">
              <td class="font-black text-slate-950 dark:text-white">{{ u.nombres }} {{ u.apellidos }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.telefono }}</td>
              <td><span class="badge badge-info">{{ rolPrincipal(u) }}</span></td>
              <td><button class="boton-primario" type="button" (click)="aprobar(u.id)">Aprobar</button></td>
            </tr>
          </tbody>
        </table>
        <ng-template #sinSolicitudes><p class="p-5 text-sm text-slate-500 dark:text-slate-400">No hay solicitudes pendientes.</p></ng-template>
      </div>

      <div class="table-wrap overflow-x-auto">
        <div class="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 class="section-title">Usuarios del sistema</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Listado general con roles activos y datos de contacto.</p>
        </div>
        <table class="data-table">
          <thead><tr><th>Nombre</th><th>Email</th><th>Telefono</th><th>Rol</th><th>Especialidad</th></tr></thead>
          <tbody>
            <tr *ngFor="let u of filtrados">
              <td class="font-black text-slate-950 dark:text-white">{{ u.nombres }} {{ u.apellidos }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.telefono }}</td>
              <td><span class="badge badge-info">{{ rolPrincipal(u) }}</span></td>
              <td>{{ u.especialidad || 'Sin especialidad' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm sm:flex sm:justify-end sm:p-5"
           *ngIf="formularioAbierto"
           (click)="cerrar()">
        <aside class="panel h-full w-full max-w-xl overflow-y-auto p-5 shadow-2xl sm:p-6" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="page-eyebrow">Nuevo usuario</p>
              <h2 class="section-title">Formulario de usuario</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Crea usuarios internos con rol real del sistema.</p>
            </div>
            <button class="boton-icono" type="button" (click)="cerrar()" aria-label="Cerrar formulario"><app-icono name="x" [size]="18"></app-icono></button>
          </div>

          <form class="mt-5 grid gap-4" (ngSubmit)="guardar()">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2"><span class="form-label">Nombres</span><input class="campo" name="nombres" [(ngModel)]="form.nombres" required></label>
              <label class="grid gap-2"><span class="form-label">Apellidos</span><input class="campo" name="apellidos" [(ngModel)]="form.apellidos" required></label>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2"><span class="form-label">Email</span><input class="campo" type="email" name="email" [(ngModel)]="form.email" required></label>
              <label class="grid gap-2"><span class="form-label">Telefono</span><input class="campo" name="telefono" [(ngModel)]="form.telefono"></label>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2"><span class="form-label">Password</span><input class="campo" type="password" name="password" [(ngModel)]="form.password" required></label>
              <label class="grid gap-2">
                <span class="form-label">Rol</span>
                <select class="campo" name="rol" [(ngModel)]="rol">
                  <option>ROLE_ADMIN</option>
                  <option>ROLE_RECEPCIONISTA</option>
                  <option>ROLE_VETERINARIO</option>
                  <option>ROLE_CLIENTE</option>
                </select>
              </label>
            </div>
            <label class="grid gap-2"><span class="form-label">Foto URL</span><input class="campo" name="fotoUrl" [(ngModel)]="form.fotoUrl"></label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2"><span class="form-label">Especialidad</span><input class="campo" name="especialidad" [(ngModel)]="form.especialidad"></label>
              <label class="grid gap-2"><span class="form-label">Cedula profesional</span><input class="campo" name="cedulaProfesional" [(ngModel)]="form.cedulaProfesional"></label>
            </div>
            <label class="grid gap-2"><span class="form-label">Biografia</span><textarea class="campo min-h-28" name="biografia" [(ngModel)]="form.biografia"></textarea></label>
            <button class="boton-primario w-full" type="submit">Crear usuario</button>
            <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300" *ngIf="mensaje">{{ mensaje }}</p>
          </form>
        </aside>
      </div>
    </section>
  `
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  solicitudes: Usuario[] = [];
  busqueda = '';
  formularioAbierto = false;
  mensaje = '';
  rol = 'ROLE_VETERINARIO';
  form = this.formularioVacio();

  constructor(private api: ApiService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.api.usuarios().subscribe(r => this.usuarios = r.data);
    this.api.solicitudesPendientes().subscribe(r => this.solicitudes = r.data);
  }

  nuevo() {
    this.form = this.formularioVacio();
    this.rol = 'ROLE_VETERINARIO';
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    this.api.crearUsuario({ ...this.form, roles: [this.rol] }).subscribe(() => {
      this.mensaje = 'Usuario creado correctamente.';
      this.cargar();
    });
  }

  aprobar(id: number) {
    this.api.aprobarUsuario(id).subscribe(() => this.cargar());
  }

  cerrar() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      password: 'Vet2026!',
      fotoUrl: '',
      especialidad: '',
      cedulaProfesional: '',
      biografia: ''
    };
  }

  rolPrincipal(usuario: Usuario) {
    return usuario.roles?.[0]?.nombre || 'Sin rol';
  }

  porRol(rol: string) {
    return this.usuarios.filter(u => u.roles?.some(r => r.nombre === rol)).length;
  }

  get filtrados() {
    const q = this.busqueda.toLowerCase();
    return this.usuarios.filter(u => `${u.nombres} ${u.apellidos} ${u.email} ${u.telefono} ${this.rolPrincipal(u)}`.toLowerCase().includes(q));
  }
}
