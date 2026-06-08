import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ConsultaMedica, Mascota, Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono.component';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Registro clinico</p>
          <h1 class="page-title">Consultas medicas</h1>
          <p class="page-subtitle">Diagnosticos, tratamientos, signos vitales, costos y seguimiento por paciente.</p>
        </div>
        <button class="boton-primario" type="button" (click)="nuevaConsulta()">
          <app-icono name="stethoscope" [size]="18"></app-icono>
          Nueva consulta
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-5">
        <article class="stat-card text-center" *ngFor="let tipo of tipos">
          <p class="stat-value">{{ contar(tipo) }}</p>
          <p class="stat-label">{{ tipo }}</p>
        </article>
      </div>

      <div class="panel p-4">
        <input class="campo w-full" placeholder="Buscar por mascota, cliente, veterinario o diagnostico..." [(ngModel)]="busqueda">
      </div>

      <div class="space-y-3">
        <article class="panel p-5" *ngFor="let consulta of filtradas">
          <div class="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span class="badge" [ngClass]="badgeTipo(consulta.tipo)">{{ consulta.tipo }}</span>
              <h2 class="mt-3 text-xl font-black text-slate-950 dark:text-white">{{ consulta.mascota }} - {{ consulta.cliente }}</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ consulta.fecha }} - {{ consulta.veterinario }}</p>
              <p class="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{{ consulta.diagnostico }}</p>
              <p class="mt-1 text-xs font-bold text-rose-600 dark:text-rose-300">{{ consulta.tratamiento }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-950/40 lg:min-w-56 lg:text-right">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ consulta.pesoKg }} kg - {{ consulta.temperatura }} C</p>
              <p class="mt-2 text-3xl font-black text-emerald-700 dark:text-emerald-300">\${{ consulta.precio }}</p>
              <div class="mt-3 flex gap-3 lg:justify-end">
                <button class="action-link" type="button" (click)="editar(consulta)">Editar</button>
                <button class="action-link" type="button" (click)="eliminar(consulta)">Eliminar</button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm sm:flex sm:justify-end sm:p-5"
           *ngIf="formularioAbierto"
           (click)="cerrarFormulario()">
        <aside class="panel h-full w-full max-w-xl overflow-y-auto p-5 shadow-2xl sm:p-6"
               (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="page-eyebrow">{{ editandoId ? 'Editar consulta' : 'Nueva consulta' }}</p>
              <h2 class="section-title">Formulario de consulta</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Registra la atencion medica sin perder el historial de la mascota.</p>
            </div>
            <button class="boton-icono" type="button" (click)="cerrarFormulario()" aria-label="Cerrar formulario">
              <app-icono name="x" [size]="18"></app-icono>
            </button>
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
                <span class="form-label">Veterinario</span>
                <select class="campo" name="veterinarioId" [(ngModel)]="form.veterinarioId" required>
                  <option [ngValue]="null">Seleccionar veterinario</option>
                  <option *ngFor="let vet of veterinarios" [ngValue]="vet.id">{{ vet.nombres }} {{ vet.apellidos }}</option>
                </select>
              </label>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="form-label">Tipo</span>
                <select class="campo" name="tipo" [(ngModel)]="form.tipo">
                  <option>Rutina</option>
                  <option>Emergencia</option>
                  <option>Control</option>
                  <option>Cirugia</option>
                  <option>Vacunacion</option>
                </select>
              </label>
              <label class="grid gap-2">
                <span class="form-label">Temperatura</span>
                <input class="campo" type="number" step="0.1" name="temperatura" [(ngModel)]="form.temperatura">
              </label>
            </div>

            <label class="grid gap-2">
              <span class="form-label">Motivo</span>
              <input class="campo" name="motivo" [(ngModel)]="form.motivo">
            </label>
            <label class="grid gap-2">
              <span class="form-label">Diagnostico</span>
              <textarea class="campo min-h-28" name="diagnostico" [(ngModel)]="form.diagnostico"></textarea>
            </label>
            <label class="grid gap-2">
              <span class="form-label">Tratamiento</span>
              <textarea class="campo min-h-28" name="tratamiento" [(ngModel)]="form.tratamiento"></textarea>
            </label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="form-label">Frecuencia cardiaca</span>
                <input class="campo" type="number" name="frecuenciaCardiaca" [(ngModel)]="form.frecuenciaCardiaca">
              </label>
              <label class="grid gap-2">
                <span class="form-label">Frecuencia respiratoria</span>
                <input class="campo" type="number" name="frecuenciaRespiratoria" [(ngModel)]="form.frecuenciaRespiratoria">
              </label>
            </div>
            <button class="boton-primario w-full" type="submit">{{ editandoId ? 'Guardar cambios' : 'Registrar consulta' }}</button>
            <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300" *ngIf="mensaje">{{ mensaje }}</p>
          </form>
        </aside>
      </div>
    </section>
  `
})
export class ConsultasComponent implements OnInit {
  consultas: ConsultaMedica[] = [];
  mascotas: Mascota[] = [];
  veterinarios: Usuario[] = [];
  busqueda = '';
  tipos = ['Rutina', 'Emergencia', 'Control', 'Cirugia', 'Vacunacion'];
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
    this.api.consultas().subscribe(r => this.consultas = r.data);
  }

  nuevaConsulta() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.veterinarioId = this.veterinarios[0]?.id || null;
    this.mensaje = '';
    this.formularioAbierto = true;
  }

  editar(consulta: ConsultaMedica) {
    this.editandoId = consulta.id;
    this.form = {
      mascotaId: null,
      veterinarioId: null,
      tipo: consulta.tipo || 'Rutina',
      motivo: consulta.tipo || 'Consulta medica',
      diagnostico: consulta.diagnostico || '',
      tratamiento: consulta.tratamiento || '',
      temperatura: consulta.temperatura || 0,
      frecuenciaCardiaca: 0,
      frecuenciaRespiratoria: 0
    };
    this.mensaje = '';
    this.formularioAbierto = true;
  }

  guardar() {
    const datos = {
      tipo: this.form.tipo,
      tipoEvento: this.form.tipo,
      motivo: this.form.motivo,
      diagnostico: this.form.diagnostico,
      tratamiento: this.form.tratamiento,
      temperatura: Number(this.form.temperatura || 0),
      frecuenciaCardiaca: Number(this.form.frecuenciaCardiaca || 0),
      frecuenciaRespiratoria: Number(this.form.frecuenciaRespiratoria || 0)
    };
    if (this.editandoId) {
      this.api.actualizarConsulta(this.editandoId, datos).subscribe(() => {
        this.mensaje = 'Consulta actualizada correctamente.';
        this.cargar();
      });
      return;
    }
    this.api.crearConsulta({
      ...datos,
      fecha: new Date().toISOString().slice(0, 19),
      mascota: { id: this.form.mascotaId },
      veterinario: { id: this.form.veterinarioId }
    }).subscribe(() => {
      this.mensaje = 'Consulta registrada correctamente.';
      this.cargar();
    });
  }

  eliminar(consulta: ConsultaMedica) {
    if (!confirm(`Eliminar consulta de ${consulta.mascota}?`)) return;
    this.api.eliminarConsulta(consulta.id).subscribe(() => this.consultas = this.consultas.filter(c => c.id !== consulta.id));
  }

  cerrarFormulario() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return {
      mascotaId: null as number | null,
      veterinarioId: null as number | null,
      tipo: 'Rutina',
      motivo: '',
      diagnostico: '',
      tratamiento: '',
      temperatura: 38,
      frecuenciaCardiaca: 90,
      frecuenciaRespiratoria: 24
    };
  }

  contar(tipo: string) { return this.consultas.filter(c => (c.tipo || '').toLowerCase() === tipo.toLowerCase()).length; }

  badgeTipo(tipo: string) {
    const t = (tipo || '').toLowerCase();
    if (t.includes('emerg')) return 'badge-danger';
    if (t.includes('cirug')) return 'badge-warn';
    if (t.includes('vac')) return 'badge-ok';
    return 'badge-info';
  }

  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.consultas.filter(c => `${c.mascota} ${c.cliente} ${c.veterinario} ${c.diagnostico}`.toLowerCase().includes(q));
  }
}
