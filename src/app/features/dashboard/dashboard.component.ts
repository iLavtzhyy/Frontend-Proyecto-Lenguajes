import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Dashboard } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  animations: [fadeInUp],
  template: `
    <section @fadeInUp class="page-shell">
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Resumen general</p>
          <h1 class="page-title">Dashboard VetSphere</h1>
          <p class="page-subtitle">Operacion diaria, pacientes, farmacia, facturacion y alertas clinicas en tiempo real.</p>
        </div>
        <a class="boton-primario" href="https://wa.me/593989188046?text=Hola%20VetSphere%2C%20necesito%20coordinar%20una%20consulta%20veterinaria." target="_blank">
          <app-icono name="whatsapp" [size]="18"></app-icono>
          Consultar por WhatsApp
        </a>
      </div>

      <div class="grid gap-3 lg:grid-cols-4">
        <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">Rocky - control postoperatorio pendiente</div>
        <div class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">Medicamento por agotar en farmacia</div>
        <div class="rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">4 citas confirmadas para manana</div>
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">Facturacion actualizada</div>
      </div>

      <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <article class="stat-card" *ngFor="let tarjeta of tarjetas">
          <p class="stat-label">{{ tarjeta.titulo }}</p>
          <p class="stat-value">{{ tarjeta.valor }}</p>
          <p class="stat-note">{{ tarjeta.detalle }}</p>
        </article>
      </div>

      <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <article class="panel p-5 text-center" *ngFor="let servicio of servicios">
          <div class="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
            <app-icono [name]="servicio.icono" [size]="21"></app-icono>
          </div>
          <p class="mt-3 text-sm font-black text-slate-700 dark:text-slate-200">{{ servicio.nombre }}</p>
          <p class="mt-2 text-3xl font-black text-slate-950 dark:text-white">{{ servicio.total }}</p>
          <p class="mt-1 text-xs text-slate-400">Total historico</p>
        </article>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <article class="panel p-5">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Citas - ultimos 7 dias</h2>
            <button class="action-link">Ver todas</button>
          </div>
          <div class="mt-6 flex h-56 items-end gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 pt-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div class="barra h-[35%]"></div><div class="barra h-[55%]"></div><div class="barra h-[40%]"></div><div class="barra h-[75%]"></div><div class="barra h-[60%]"></div><div class="barra h-[90%]"></div><div class="barra h-[48%]"></div>
          </div>
        </article>
        <article class="panel p-5">
          <h2 class="section-title">Pacientes por especie</h2>
          <div class="mx-auto mt-6 h-48 w-48 rounded-full ring-8 ring-slate-50 dark:ring-slate-950/50" style="background: conic-gradient(#0891b2 0 72%, #7c3aed 72% 100%);"></div>
          <div class="mt-5 flex justify-center gap-5 text-xs font-black"><span class="text-cyan-700 dark:text-cyan-300">Perro</span><span class="text-violet-700 dark:text-violet-300">Gato</span></div>
        </article>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <article class="panel p-5">
          <h2 class="section-title">Cirugias recientes</h2>
          <div class="mt-4 space-y-3">
            <div class="soft-panel flex items-center justify-between">
              <span class="font-bold text-slate-700 dark:text-slate-200">Esterilizacion - Luna</span><b class="text-emerald-700 dark:text-emerald-300">Completada</b>
            </div>
            <div class="soft-panel flex items-center justify-between">
              <span class="font-bold text-slate-700 dark:text-slate-200">Extraccion dental - Max</span><b class="text-cyan-700 dark:text-cyan-300">Programada</b>
            </div>
          </div>
        </article>
        <article class="panel p-5">
          <h2 class="section-title">Stock critico via SOAP/CXF</h2>
          <div class="mt-4 space-y-3">
            <div class="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50 p-3 dark:border-rose-900/50 dark:bg-rose-950/30" *ngFor="let producto of resumen?.stockCritico">
              <div><p class="font-black text-slate-950 dark:text-white">{{ producto.nombre }}</p><p class="text-xs text-slate-500 dark:text-slate-400">{{ producto.codigo }}</p></div>
              <b class="text-rose-700 dark:text-rose-300">{{ producto.stock }}/{{ producto.stockCritico }}</b>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`.barra{width:100%;border-radius:.45rem .45rem 0 0;background:linear-gradient(180deg,#22d3ee,#0e7490);}`]
})
export class DashboardComponent implements OnInit {
  resumen?: Dashboard;
  tarjetas: { titulo: string; valor: number; detalle: string }[] = [];
  servicios = [
    { nombre: 'Consultas', total: 284, icono: 'stethoscope' },
    { nombre: 'Cirugias', total: 42, icono: 'surgery' },
    { nombre: 'Vacunas', total: 156, icono: 'syringe' },
    { nombre: 'Laboratorio', total: 89, icono: 'lab' },
    { nombre: 'Farmacia', total: 201, icono: 'pill' },
    { nombre: 'Emergencias', total: 18, icono: 'shield' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.dashboard().subscribe(r => {
      this.resumen = r.data;
      this.tarjetas = [
        { titulo: 'Clientes', valor: 30, detalle: 'Propietarios activos' },
        { titulo: 'Mascotas', valor: r.data.totalMascotas, detalle: 'Pacientes registrados' },
        { titulo: 'Citas hoy', valor: 6, detalle: '2 pendientes' },
        { titulo: 'Citas mes', valor: 28, detalle: 'Este mes' },
        { titulo: 'Internadas', valor: r.data.mascotasInternadas, detalle: 'Monitoreo activo' },
        { titulo: 'Cirugias hoy', valor: r.data.cirugiasHoy, detalle: 'Quirofano' }
      ];
    });
  }
}
