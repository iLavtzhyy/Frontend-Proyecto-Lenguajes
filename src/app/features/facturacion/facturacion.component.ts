import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Factura } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Control financiero</p>
          <h1 class="page-title">Facturacion</h1>
          <p class="page-subtitle">Gasto por cliente, servicios clinicos, farmacia y estado de pago.</p>
        </div>
        <button class="boton-primario">Nueva factura</button>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <article class="stat-card"><p class="stat-label">Total facturado</p><p class="stat-value">\${{ total | number:'1.2-2' }}</p><p class="stat-note">Historico</p></article>
        <article class="stat-card"><p class="stat-label">Facturas</p><p class="stat-value">{{ facturas.length }}</p><p class="stat-note">Emitidas</p></article>
        <article class="stat-card"><p class="stat-label">Pendientes</p><p class="stat-value text-amber-700 dark:text-amber-300">{{ pendientes }}</p><p class="stat-note">Por cobrar</p></article>
        <article class="stat-card"><p class="stat-label">Pagadas</p><p class="stat-value text-emerald-700 dark:text-emerald-300">{{ pagadas }}</p><p class="stat-note">Cerradas</p></article>
      </div>

      <div class="table-wrap overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Factura</th><th>Cliente</th><th>Mascota</th><th>Concepto</th><th>Total</th><th>Estado</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of facturas">
              <td class="font-black text-slate-950 dark:text-white">{{ f.numero }}</td>
              <td>{{ f.cliente }}</td>
              <td>{{ f.mascota }}</td>
              <td>{{ f.concepto }}</td>
              <td class="font-black text-emerald-700 dark:text-emerald-300">\${{ f.total }}</td>
              <td><span class="badge" [ngClass]="f.estadoPago === 'Pagado' ? 'badge-ok' : 'badge-warn'">{{ f.estadoPago }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class FacturacionComponent implements OnInit {
  facturas: Factura[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.facturas().subscribe(r => this.facturas = r.data); }
  get total() { return this.facturas.reduce((s, f) => s + Number(f.total || 0), 0); }
  get pendientes() { return this.facturas.filter(f => f.estadoPago === 'Pendiente').length; }
  get pagadas() { return this.facturas.filter(f => f.estadoPago === 'Pagado').length; }
}
