import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Mascota, OrdenLaboratorio, Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono.component';

@Component({
  selector: 'app-laboratorio',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Diagnostico clinico</p>
          <h1 class="page-title">Laboratorio</h1>
          <p class="page-subtitle">Ordenes, resultados, archivos, estado de procesamiento y trazabilidad por paciente.</p>
        </div>
        <button class="boton-primario" type="button" (click)="nueva()">
          <app-icono name="lab" [size]="18"></app-icono>
          Nueva orden
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <article class="stat-card"><p class="stat-label">Ordenes</p><p class="stat-value">{{ ordenes.length }}</p><p class="stat-note">Registradas</p></article>
        <article class="stat-card"><p class="stat-label">Pendientes</p><p class="stat-value">{{ contar('Pendiente') }}</p><p class="stat-note">Por procesar</p></article>
        <article class="stat-card"><p class="stat-label">Procesando</p><p class="stat-value">{{ contar('Procesando') }}</p><p class="stat-note">En laboratorio</p></article>
        <article class="stat-card"><p class="stat-label">Entregadas</p><p class="stat-value">{{ contar('Entregado') }}</p><p class="stat-note">Con resultado</p></article>
      </div>

      <div class="panel p-4">
        <input class="campo w-full" placeholder="Buscar por mascota, prueba, estado o resultado..." [(ngModel)]="busqueda">
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <article class="panel p-5" *ngFor="let orden of filtradas">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span class="badge" [ngClass]="badgeEstado(orden.estado)">{{ orden.estado || 'Pendiente' }}</span>
              <h2 class="mt-3 text-xl font-black text-slate-950 dark:text-white">{{ orden.tipoPrueba }}</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ orden.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="mt-3 text-sm text-slate-700 dark:text-slate-300">{{ orden.mascota?.nombre || 'Sin mascota' }} - {{ nombreUsuario(orden.veterinarioSolicitante) }}</p>
            </div>
            <div class="flex gap-2">
              <button class="boton-secundario" type="button" (click)="editar(orden)">Editar</button>
              <button class="boton-secundario" type="button" (click)="eliminar(orden)">Eliminar</button>
            </div>
          </div>
          <div class="soft-panel mt-4">
            <p class="form-label">Resultado</p>
            <p class="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{{ orden.resultado || 'Resultado pendiente.' }}</p>
          </div>
          <a class="action-link mt-4 inline-flex" *ngIf="orden.archivoResultadoUrl" [href]="orden.archivoResultadoUrl" target="_blank">Abrir archivo</a>
        </article>
      </div>

      <div class="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm sm:flex sm:justify-end sm:p-5"
           *ngIf="formularioAbierto"
           (click)="cerrar()">
        <aside class="panel h-full w-full max-w-xl overflow-y-auto p-5 shadow-2xl sm:p-6" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="page-eyebrow">{{ editandoId ? 'Editar orden' : 'Nueva orden' }}</p>
              <h2 class="section-title">Formulario de laboratorio</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Actualiza resultado y estado sin perder el vinculo con el paciente.</p>
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
                <span class="form-label">Veterinario solicitante</span>
                <select class="campo" name="veterinarioId" [(ngModel)]="form.veterinarioId" required>
                  <option [ngValue]="null">Seleccionar veterinario</option>
                  <option *ngFor="let vet of veterinarios" [ngValue]="vet.id">{{ vet.nombres }} {{ vet.apellidos }}</option>
                </select>
              </label>
            </div>
            <label class="grid gap-2">
              <span class="form-label">Tipo de prueba</span>
              <input class="campo" name="tipoPrueba" [(ngModel)]="form.tipoPrueba" required>
            </label>
            <label class="grid gap-2">
              <span class="form-label">Estado</span>
              <select class="campo" name="estado" [(ngModel)]="form.estado">
                <option>Pendiente</option>
                <option>Procesando</option>
                <option>Entregado</option>
                <option>Repetir muestra</option>
              </select>
            </label>
            <label class="grid gap-2">
              <span class="form-label">Resultado</span>
              <textarea class="campo min-h-32" name="resultado" [(ngModel)]="form.resultado"></textarea>
            </label>
            <label class="grid gap-2">
              <span class="form-label">URL archivo resultado</span>
              <input class="campo" name="archivoResultadoUrl" [(ngModel)]="form.archivoResultadoUrl">
            </label>
            <button class="boton-primario w-full" type="submit">{{ editandoId ? 'Guardar cambios' : 'Crear orden' }}</button>
            <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300" *ngIf="mensaje">{{ mensaje }}</p>
          </form>
        </aside>
      </div>
    </section>
  `
})
export class LaboratorioComponent implements OnInit {
  ordenes: OrdenLaboratorio[] = [];
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

  cargar() { this.api.laboratorio().subscribe(r => this.ordenes = r.data); }

  nueva() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.veterinarioId = this.veterinarios[0]?.id || null;
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  editar(orden: OrdenLaboratorio) {
    this.editandoId = orden.id;
    this.form = {
      mascotaId: null,
      veterinarioId: null,
      tipoPrueba: orden.tipoPrueba || '',
      resultado: orden.resultado || '',
      estado: orden.estado || 'Pendiente',
      archivoResultadoUrl: orden.archivoResultadoUrl || ''
    };
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    if (this.editandoId) {
      this.api.actualizarOrdenLaboratorio(this.editandoId, this.form).subscribe(() => {
        this.mensaje = 'Orden actualizada correctamente.';
        this.cargar();
      });
      return;
    }
    this.api.crearOrdenLaboratorio({
      fecha: new Date().toISOString().slice(0, 19),
      tipoPrueba: this.form.tipoPrueba,
      resultado: this.form.resultado,
      estado: this.form.estado,
      archivoResultadoUrl: this.form.archivoResultadoUrl,
      mascota: { id: this.form.mascotaId },
      veterinarioSolicitante: { id: this.form.veterinarioId }
    }).subscribe(() => {
      this.mensaje = 'Orden creada correctamente.';
      this.cargar();
    });
  }

  eliminar(orden: OrdenLaboratorio) {
    if (!confirm(`Eliminar orden ${orden.tipoPrueba}?`)) return;
    this.api.eliminarOrdenLaboratorio(orden.id).subscribe(() => this.ordenes = this.ordenes.filter(o => o.id !== orden.id));
  }

  cerrar() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return { mascotaId: null as number | null, veterinarioId: null as number | null, tipoPrueba: 'Hemograma completo', resultado: '', estado: 'Pendiente', archivoResultadoUrl: '' };
  }

  contar(estado: string) { return this.ordenes.filter(o => (o.estado || '').toLowerCase().includes(estado.toLowerCase())).length; }
  nombreUsuario(usuario?: Usuario) { return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Sin veterinario'; }
  badgeEstado(estado?: string) {
    const e = (estado || '').toLowerCase();
    if (e.includes('entregado')) return 'badge-ok';
    if (e.includes('repetir')) return 'badge-danger';
    if (e.includes('proces')) return 'badge-info';
    return 'badge-warn';
  }
  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.ordenes.filter(o => `${o.tipoPrueba} ${o.estado} ${o.resultado} ${o.mascota?.nombre}`.toLowerCase().includes(q));
  }
}
