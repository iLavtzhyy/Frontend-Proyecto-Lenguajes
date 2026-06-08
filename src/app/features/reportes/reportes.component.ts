import { Component } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { fadeInUp } from '../../shared/animations/fade-in-up';

@Component({
  selector: 'app-reportes',
  standalone: true,
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Reportes</p>
          <h1 class="page-title">Descargables clinicos y financieros</h1>
          <p class="page-subtitle">Exporta documentos para exposicion, auditoria, historial del paciente e inventario valorizado.</p>
        </div>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <article class="panel p-6">
          <p class="page-eyebrow">PDF corporativo</p>
          <h2 class="mt-2 text-2xl font-black text-slate-950 dark:text-white">Historial clinico de mascota</h2>
          <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Descarga el historial completo del paciente con consultas, vacunas, cirugias y registros medicos.</p>
          <button class="boton-primario mt-5" (click)="pdf()">Descargar PDF</button>
        </article>
        <article class="panel p-6">
          <p class="page-eyebrow">Excel</p>
          <h2 class="mt-2 text-2xl font-black text-slate-950 dark:text-white">Estadisticas financieras</h2>
          <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Exporta inventario valorizado, facturacion y control financiero en formato .xlsx.</p>
          <button class="boton-primario mt-5" (click)="excel()">Descargar Excel</button>
        </article>
      </div>
    </section>
  `
})
export class ReportesComponent {
  constructor(private api: ApiService) {}
  pdf() { this.api.descargar('/reportes/mascotas/1/historial.pdf', 'historial-milo.pdf'); }
  excel() { this.api.descargar('/reportes/finanzas.xlsx', 'finanzas-vetsphere.xlsx'); }
}
