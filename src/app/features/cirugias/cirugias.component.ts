import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cirugia, Mascota, Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono.component';

@Component({
  selector: 'app-cirugias',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Quirofano</p>
          <h1 class="page-title">Cirugias y postoperatorios</h1>
          <p class="page-subtitle">Agenda quirurgica, anestesia, cirujano responsable, constantes y seguimiento postoperatorio.</p>
        </div>
        <button class="boton-primario" type="button" (click)="nueva()">
          <app-icono name="surgery" [size]="18"></app-icono>
          Programar cirugia
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <article class="stat-card"><p class="stat-label">Programadas</p><p class="stat-value">{{ cirugias.length }}</p><p class="stat-note">Total</p></article>
        <article class="stat-card"><p class="stat-label">Pendientes</p><p class="stat-value">{{ contarEstado('Pendiente') }}</p><p class="stat-note">Por atender</p></article>
        <article class="stat-card"><p class="stat-label">Completadas</p><p class="stat-value">{{ contarEstado('Completada') }}</p><p class="stat-note">Historico</p></article>
        <article class="stat-card"><p class="stat-label">Postoperatorio</p><p class="stat-value">{{ postoperatorios }}</p><p class="stat-note">Seguimiento</p></article>
      </div>

      <div class="panel p-4">
        <input class="campo w-full" placeholder="Buscar por mascota, procedimiento, cirujano o estado..." [(ngModel)]="busqueda">
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <article class="panel p-5" *ngFor="let cirugia of filtradas">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span class="badge" [ngClass]="badgeEstado(cirugia.estado)">{{ cirugia.estado || 'Pendiente' }}</span>
              <h2 class="mt-3 text-xl font-black text-slate-950 dark:text-white">{{ cirugia.procedimiento }}</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ cirugia.fechaProgramada | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {{ cirugia.mascota?.nombre || 'Paciente sin asignar' }} - {{ cirugia.tipoAnestesia || 'Anestesia pendiente' }}
              </p>
            </div>
            <div class="flex gap-2">
              <button class="boton-secundario" type="button" (click)="editar(cirugia)">Editar</button>
              <button class="boton-secundario" type="button" (click)="eliminar(cirugia)">Eliminar</button>
            </div>
          </div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="soft-panel"><p class="form-label">Cirujano</p><p class="mt-2 font-black text-slate-950 dark:text-white">{{ cirugia.cirujanoPrincipal || nombreUsuario(cirugia.cirujano) }}</p></div>
            <div class="soft-panel"><p class="form-label">Constantes</p><p class="mt-2 font-black text-slate-950 dark:text-white">{{ cirugia.constantesVitales || 'Sin registro' }}</p></div>
          </div>
          <p class="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ cirugia.estadoPostoperatorio || cirugia.notas || 'Sin notas postoperatorias.' }}</p>
        </article>
      </div>

      <div class="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm sm:flex sm:justify-end sm:p-5"
           *ngIf="formularioAbierto"
           (click)="cerrar()">
        <aside class="panel h-full w-full max-w-xl overflow-y-auto p-5 shadow-2xl sm:p-6" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="page-eyebrow">{{ editandoId ? 'Editar cirugia' : 'Nueva cirugia' }}</p>
              <h2 class="section-title">Formulario quirurgico</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Programa o actualiza el procedimiento sin salir del modulo.</p>
            </div>
            <button class="boton-icono" type="button" (click)="cerrar()" aria-label="Cerrar formulario"><app-icono name="x" [size]="18"></app-icono></button>
          </div>

          <form class="mt-5 grid gap-4" (ngSubmit)="guardar()">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="form-label">Mascota</span>
                <select class="campo" name="mascotaId" [(ngModel)]="form.mascotaId" required>
                  <option [ngValue]="null">Seleccionar mascota</option>
                  <option *ngFor="let mascota of mascotas" [ngValue]="mascota.id">{{ mascota.nombre }} - {{ mascota.propietario?.nombres }}</option>
                </select>
              </label>
              <label class="grid gap-2">
                <span class="form-label">Cirujano</span>
                <select class="campo" name="cirujanoId" [(ngModel)]="form.cirujanoId" required>
                  <option [ngValue]="null">Seleccionar cirujano</option>
                  <option *ngFor="let vet of veterinarios" [ngValue]="vet.id">{{ vet.nombres }} {{ vet.apellidos }}</option>
                </select>
              </label>
            </div>
            <label class="grid gap-2">
              <span class="form-label">Procedimiento</span>
              <input class="campo" name="procedimiento" [(ngModel)]="form.procedimiento" required>
            </label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="form-label">Fecha programada</span>
                <input class="campo" type="datetime-local" name="fechaProgramada" [(ngModel)]="form.fechaProgramada">
              </label>
              <label class="grid gap-2">
                <span class="form-label">Estado</span>
                <select class="campo" name="estado" [(ngModel)]="form.estado">
                  <option>Pendiente</option>
                  <option>En quirofano</option>
                  <option>Completada</option>
                  <option>Postoperatorio</option>
                  <option>Cancelada</option>
                </select>
              </label>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="form-label">Tipo anestesia</span>
                <input class="campo" name="tipoAnestesia" [(ngModel)]="form.tipoAnestesia">
              </label>
              <label class="grid gap-2">
                <span class="form-label">Cirujano principal</span>
                <input class="campo" name="cirujanoPrincipal" [(ngModel)]="form.cirujanoPrincipal">
              </label>
            </div>
            <label class="grid gap-2">
              <span class="form-label">Constantes vitales</span>
              <input class="campo" name="constantesVitales" [(ngModel)]="form.constantesVitales">
            </label>
            <label class="grid gap-2">
              <span class="form-label">Estado postoperatorio</span>
              <textarea class="campo min-h-24" name="estadoPostoperatorio" [(ngModel)]="form.estadoPostoperatorio"></textarea>
            </label>
            <label class="grid gap-2">
              <span class="form-label">Notas</span>
              <textarea class="campo min-h-24" name="notas" [(ngModel)]="form.notas"></textarea>
            </label>
            <button class="boton-primario w-full" type="submit">{{ editandoId ? 'Guardar cambios' : 'Programar cirugia' }}</button>
            <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300" *ngIf="mensaje">{{ mensaje }}</p>
          </form>
        </aside>
      </div>
    </section>
  `
})
export class CirugiasComponent implements OnInit {
  cirugias: Cirugia[] = [];
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

  cargar() {
    this.api.cirugias().subscribe(r => this.cirugias = r.data);
  }

  nueva() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.cirujanoId = this.veterinarios[0]?.id || null;
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  editar(cirugia: Cirugia) {
    this.editandoId = cirugia.id;
    this.form = {
      mascotaId: cirugia.mascota?.id || this.mascotas[0]?.id || null,
      cirujanoId: cirugia.cirujano?.id || this.veterinarios[0]?.id || null,
      fechaProgramada: this.fechaInput(cirugia.fechaProgramada),
      procedimiento: cirugia.procedimiento || '',
      tipoAnestesia: cirugia.tipoAnestesia || '',
      cirujanoPrincipal: cirugia.cirujanoPrincipal || this.nombreUsuario(cirugia.cirujano),
      constantesVitales: cirugia.constantesVitales || '',
      estadoPostoperatorio: cirugia.estadoPostoperatorio || '',
      estado: cirugia.estado || 'Pendiente',
      notas: cirugia.notas || ''
    };
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    const datos = { ...this.form };
    const peticion = this.editandoId ? this.api.actualizarCirugia(this.editandoId, datos) : this.api.crearCirugia(datos);
    peticion.subscribe(() => {
      this.mensaje = 'Cirugia guardada correctamente.';
      this.cargar();
    });
  }

  eliminar(cirugia: Cirugia) {
    if (!confirm(`Eliminar cirugia ${cirugia.procedimiento}?`)) return;
    this.api.eliminarCirugia(cirugia.id).subscribe(() => this.cirugias = this.cirugias.filter(c => c.id !== cirugia.id));
  }

  cerrar() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return {
      mascotaId: null as number | null,
      cirujanoId: null as number | null,
      fechaProgramada: new Date().toISOString().slice(0, 16),
      procedimiento: '',
      tipoAnestesia: 'General inhalatoria',
      cirujanoPrincipal: '',
      constantesVitales: 'FC 90 / FR 24 / Temp 38.4',
      estadoPostoperatorio: '',
      estado: 'Pendiente',
      notas: ''
    };
  }

  fechaInput(fecha?: string) {
    return fecha ? fecha.slice(0, 16) : new Date().toISOString().slice(0, 16);
  }

  nombreUsuario(usuario?: Usuario) {
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Sin asignar';
  }

  contarEstado(estado: string) {
    return this.cirugias.filter(c => (c.estado || '').toLowerCase().includes(estado.toLowerCase())).length;
  }

  get postoperatorios() {
    return this.cirugias.filter(c => (c.estado || '').toLowerCase().includes('post')).length;
  }

  badgeEstado(estado?: string) {
    const e = (estado || '').toLowerCase();
    if (e.includes('complet')) return 'badge-ok';
    if (e.includes('cancel')) return 'badge-danger';
    if (e.includes('post')) return 'badge-info';
    return 'badge-warn';
  }

  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.cirugias.filter(c => `${c.procedimiento} ${c.estado} ${c.mascota?.nombre} ${c.cirujanoPrincipal}`.toLowerCase().includes(q));
  }
}
