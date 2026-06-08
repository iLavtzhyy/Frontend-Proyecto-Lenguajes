import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Hospitalizacion, Mascota, Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono.component';

@Component({
  selector: 'app-hospitalizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Area clinica</p>
          <h1 class="page-title">Hospitalizacion</h1>
          <p class="page-subtitle">Pacientes internados, jaulas, plan de cuidados, alta medica y responsable clinico.</p>
        </div>
        <button class="boton-primario" type="button" (click)="nuevoIngreso()">
          <app-icono name="shield" [size]="18"></app-icono>
          Nuevo ingreso
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <article class="stat-card"><p class="stat-label">Ingresos</p><p class="stat-value">{{ hospitalizaciones.length }}</p><p class="stat-note">Total</p></article>
        <article class="stat-card"><p class="stat-label">Internados</p><p class="stat-value">{{ contar('Internado') }}</p><p class="stat-note">Activos</p></article>
        <article class="stat-card"><p class="stat-label">Observacion</p><p class="stat-value">{{ contar('Observacion') }}</p><p class="stat-note">Monitoreo</p></article>
        <article class="stat-card"><p class="stat-label">Altas</p><p class="stat-value">{{ contar('Alta') }}</p><p class="stat-note">Cerradas</p></article>
      </div>

      <div class="panel p-4">
        <input class="campo w-full" placeholder="Buscar por mascota, jaula, motivo, estado..." [(ngModel)]="busqueda">
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <article class="panel p-5" *ngFor="let h of filtradas">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span class="badge" [ngClass]="badgeEstado(h.estado)">{{ h.estado || 'Internado' }}</span>
              <h2 class="mt-3 text-xl font-black text-slate-950 dark:text-white">{{ h.mascota?.nombre || 'Paciente sin asignar' }}</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Ingreso: {{ h.ingreso | date:'dd/MM/yyyy HH:mm' }} - Jaula {{ h.jaula }}</p>
              <p class="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{{ h.motivo }}</p>
            </div>
            <div class="flex gap-2">
              <button class="boton-secundario" type="button" (click)="editar(h)">Editar</button>
              <button class="boton-secundario" type="button" (click)="eliminar(h)">Eliminar</button>
            </div>
          </div>
          <div class="soft-panel mt-4">
            <p class="form-label">Plan de cuidados</p>
            <p class="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{{ h.planCuidados || 'Sin plan registrado.' }}</p>
          </div>
          <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">Responsable: {{ nombreUsuario(h.veterinarioResponsable) }} <span *ngIf="h.alta">- Alta: {{ h.alta | date:'dd/MM/yyyy HH:mm' }}</span></p>
        </article>
      </div>

      <div class="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm sm:flex sm:justify-end sm:p-5"
           *ngIf="formularioAbierto"
           (click)="cerrar()">
        <aside class="panel h-full w-full max-w-xl overflow-y-auto p-5 shadow-2xl sm:p-6" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="page-eyebrow">{{ editandoId ? 'Editar hospitalizacion' : 'Nuevo ingreso' }}</p>
              <h2 class="section-title">Formulario de hospitalizacion</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Controla el ingreso, plan de cuidados y alta del paciente.</p>
            </div>
            <button class="boton-icono" type="button" (click)="cerrar()" aria-label="Cerrar formulario"><app-icono name="x" [size]="18"></app-icono></button>
          </div>

          <form class="mt-5 grid gap-4" (ngSubmit)="guardar()">
            <div class="grid gap-4 sm:grid-cols-2" *ngIf="!editandoId">
              <label class="grid gap-2">
                <span class="form-label">Mascota</span>
                <select class="campo" name="mascotaId" [(ngModel)]="form.mascotaId" required>
                  <option [ngValue]="null">Seleccionar mascota</option>
                  <option *ngFor="let mascota of mascotas" [ngValue]="mascota.id">{{ mascota.nombre }} - {{ mascota.propietario?.nombres }}</option>
                </select>
              </label>
              <label class="grid gap-2">
                <span class="form-label">Veterinario responsable</span>
                <select class="campo" name="veterinarioId" [(ngModel)]="form.veterinarioId" required>
                  <option [ngValue]="null">Seleccionar veterinario</option>
                  <option *ngFor="let vet of veterinarios" [ngValue]="vet.id">{{ vet.nombres }} {{ vet.apellidos }}</option>
                </select>
              </label>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="form-label">Jaula</span>
                <input class="campo" name="jaula" [(ngModel)]="form.jaula">
              </label>
              <label class="grid gap-2">
                <span class="form-label">Estado</span>
                <select class="campo" name="estado" [(ngModel)]="form.estado">
                  <option>Internado</option>
                  <option>Observacion</option>
                  <option>Critico</option>
                  <option>Alta</option>
                </select>
              </label>
            </div>
            <label class="grid gap-2">
              <span class="form-label">Motivo</span>
              <input class="campo" name="motivo" [(ngModel)]="form.motivo">
            </label>
            <label class="grid gap-2">
              <span class="form-label">Plan de cuidados</span>
              <textarea class="campo min-h-32" name="planCuidados" [(ngModel)]="form.planCuidados"></textarea>
            </label>
            <label class="grid gap-2">
              <span class="form-label">Fecha de alta</span>
              <input class="campo" type="datetime-local" name="alta" [(ngModel)]="form.alta">
            </label>
            <button class="boton-primario w-full" type="submit">{{ editandoId ? 'Guardar cambios' : 'Registrar ingreso' }}</button>
            <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300" *ngIf="mensaje">{{ mensaje }}</p>
          </form>
        </aside>
      </div>
    </section>
  `
})
export class HospitalizacionComponent implements OnInit {
  hospitalizaciones: Hospitalizacion[] = [];
  mascotas: Mascota[] = [];
  veterinarios: Usuario[] = [];
  busqueda = '';
  formularioAbierto = false;
  editandoId?: number;
  mensaje = '';
  form = this.formularioVacio();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargar();
    this.api.mascotas().subscribe(r => this.mascotas = r.data);
    this.api.veterinarios().subscribe(r => this.veterinarios = r.data);
  }

  cargar() { this.api.hospitalizaciones().subscribe(r => this.hospitalizaciones = r.data); }

  nuevoIngreso() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.veterinarioId = this.veterinarios[0]?.id || null;
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  editar(h: Hospitalizacion) {
    this.editandoId = h.id;
    this.form = {
      mascotaId: null,
      veterinarioId: null,
      jaula: h.jaula || '',
      motivo: h.motivo || '',
      planCuidados: h.planCuidados || '',
      estado: h.estado || 'Internado',
      alta: h.alta ? h.alta.slice(0, 16) : ''
    };
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    if (this.editandoId) {
      this.api.actualizarHospitalizacion(this.editandoId, { ...this.form, alta: this.form.alta || null }).subscribe(() => {
        this.mensaje = 'Hospitalizacion actualizada correctamente.';
        this.cargar();
      });
      return;
    }
    this.api.crearHospitalizacion({
      ingreso: new Date().toISOString().slice(0, 19),
      jaula: this.form.jaula,
      motivo: this.form.motivo,
      planCuidados: this.form.planCuidados,
      estado: this.form.estado,
      alta: this.form.alta || null,
      mascota: { id: this.form.mascotaId },
      veterinarioResponsable: { id: this.form.veterinarioId }
    }).subscribe(() => {
      this.mensaje = 'Ingreso registrado correctamente.';
      this.cargar();
    });
  }

  eliminar(h: Hospitalizacion) {
    if (!confirm(`Eliminar hospitalizacion de ${h.mascota?.nombre || 'paciente'}?`)) return;
    this.api.eliminarHospitalizacion(h.id).subscribe(() => this.hospitalizaciones = this.hospitalizaciones.filter(i => i.id !== h.id));
  }

  cerrar() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return { mascotaId: null as number | null, veterinarioId: null as number | null, jaula: 'H-01', motivo: '', planCuidados: '', estado: 'Internado', alta: '' };
  }

  contar(estado: string) { return this.hospitalizaciones.filter(h => (h.estado || '').toLowerCase().includes(estado.toLowerCase())).length; }
  nombreUsuario(usuario?: Usuario) { return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Sin responsable'; }
  badgeEstado(estado?: string) {
    const e = (estado || '').toLowerCase();
    if (e.includes('alta')) return 'badge-ok';
    if (e.includes('crit')) return 'badge-danger';
    if (e.includes('observ')) return 'badge-info';
    return 'badge-warn';
  }
  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.hospitalizaciones.filter(h => `${h.mascota?.nombre} ${h.jaula} ${h.motivo} ${h.estado}`.toLowerCase().includes(q));
  }
}
