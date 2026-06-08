import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Gestion de propietarios</p>
          <h1 class="page-title">Clientes</h1>
          <p class="page-subtitle">Propietarios, mascotas asociadas, contacto y gasto acumulado dentro de la clinica.</p>
        </div>
        <button class="boton-primario">Nuevo cliente</button>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <article class="stat-card"><p class="stat-label">Clientes</p><p class="stat-value">{{ clientes.length }}</p><p class="stat-note">Propietarios</p></article>
        <article class="stat-card"><p class="stat-label">Mascotas</p><p class="stat-value">{{ totalMascotas }}</p><p class="stat-note">Pacientes asociados</p></article>
        <article class="stat-card"><p class="stat-label">Gasto total</p><p class="stat-value">\${{ totalGastado | number:'1.2-2' }}</p><p class="stat-note">Facturacion historica</p></article>
        <article class="stat-card"><p class="stat-label">Activos</p><p class="stat-value">{{ activos }}</p><p class="stat-note">Con seguimiento</p></article>
      </div>

      <div class="panel p-4">
        <input class="campo w-full max-w-xl" placeholder="Buscar por nombre, email, telefono..." [(ngModel)]="busqueda">
      </div>

      <div class="table-wrap overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr><th>Cliente</th><th>Email</th><th>Telefono</th><th>Mascotas</th><th>Gastado</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let cliente of filtrados">
              <td>
                <div class="font-black text-slate-950 dark:text-white">{{ cliente.nombres }} {{ cliente.apellidos }}</div>
                <div class="text-xs text-slate-400">{{ cliente.documento || 'Sin documento' }}</div>
              </td>
              <td>{{ cliente.email }}</td>
              <td>{{ cliente.telefono }}</td>
              <td><span class="badge badge-info">{{ cliente.mascotas?.length || 0 }} mascotas</span></td>
              <td class="font-black text-emerald-700 dark:text-emerald-300">\${{ cliente.totalGastado || 0 }}</td>
              <td><span class="badge badge-ok">{{ cliente.estado || 'Activo' }}</span></td>
              <td class="space-x-3"><button class="action-link">Ver</button><button class="action-link">Editar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  busqueda = '';
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.clientes().subscribe(r => this.clientes = r.data); }
  get filtrados() {
    const q = this.busqueda.toLowerCase();
    return this.clientes.filter(c => `${c.nombres} ${c.apellidos} ${c.email} ${c.telefono}`.toLowerCase().includes(q));
  }
  get totalMascotas() { return this.clientes.reduce((s, c) => s + (c.mascotas?.length || 0), 0); }
  get totalGastado() { return this.clientes.reduce((s, c) => s + Number(c.totalGastado || 0), 0); }
  get activos() { return this.clientes.filter(c => (c.estado || 'Activo') === 'Activo').length; }
}
