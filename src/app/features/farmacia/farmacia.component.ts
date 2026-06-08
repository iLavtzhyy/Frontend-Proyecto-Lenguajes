import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Producto } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono.component';

@Component({
  selector: 'app-farmacia',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">SOAP Apache CXF</p>
          <h1 class="page-title">Farmacia e inventario</h1>
          <p class="page-subtitle">Productos, precios, stock critico, movimientos y disponibilidad para facturacion.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="badge badge-info">/soap/productos?wsdl</span>
          <button class="boton-primario" type="button" (click)="nuevoProducto()">
            <app-icono name="pill" [size]="18"></app-icono>
            Nuevo producto
          </button>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <article class="stat-card"><p class="stat-label">Productos</p><p class="stat-value">{{ productos.length }}</p><p class="stat-note">Activos</p></article>
        <article class="stat-card"><p class="stat-label">Stock critico</p><p class="stat-value text-rose-700 dark:text-rose-300">{{ criticos }}</p><p class="stat-note">Alertas</p></article>
        <article class="stat-card"><p class="stat-label">Valor inventario</p><p class="stat-value text-emerald-700 dark:text-emerald-300">\${{ valorInventario | number:'1.2-2' }}</p><p class="stat-note">Calculado</p></article>
        <article class="stat-card"><p class="stat-label">Stock total</p><p class="stat-value">{{ stockTotal }}</p><p class="stat-note">Unidades</p></article>
      </div>

      <div class="panel p-4">
        <input class="campo w-full" placeholder="Buscar producto, codigo o categoria..." [(ngModel)]="busqueda">
      </div>

      <div class="table-wrap overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Codigo</th><th>Producto</th><th>Categoria</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of filtrados">
              <td class="font-black text-slate-950 dark:text-white">{{ p.codigo }}</td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.categoria }}</td>
              <td class="font-black text-emerald-700 dark:text-emerald-300">\${{ p.precio }}</td>
              <td><b class="text-slate-950 dark:text-white">{{ p.stock }}</b> / {{ p.stockCritico }}</td>
              <td><span class="badge" [ngClass]="p.stock <= p.stockCritico ? 'badge-danger' : 'badge-ok'">{{ p.stock <= p.stockCritico ? 'Critico' : 'Activo' }}</span></td>
              <td>
                <div class="flex flex-wrap gap-2">
                  <button class="action-link" type="button" (click)="abrirStock(p)">Stock</button>
                  <button class="action-link" type="button" (click)="editarProducto(p)">Editar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm sm:flex sm:justify-end sm:p-5"
           *ngIf="formularioAbierto"
           (click)="cerrarFormulario()">
        <aside class="panel h-full w-full max-w-lg overflow-y-auto p-5 shadow-2xl sm:p-6" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="page-eyebrow">{{ modoStock ? 'Movimiento farmacia' : editandoCodigo ? 'Editar producto' : 'Nuevo producto' }}</p>
              <h2 class="section-title">{{ modoStock ? productoSeleccionado?.nombre : 'Formulario de producto' }}</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Actualiza el inventario y conserva los cambios en SQL Server.</p>
            </div>
            <button class="boton-icono" type="button" (click)="cerrarFormulario()" aria-label="Cerrar formulario"><app-icono name="x" [size]="18"></app-icono></button>
          </div>

          <form class="mt-5 grid gap-4" *ngIf="!modoStock" (ngSubmit)="guardarProducto()">
            <label class="grid gap-2">
              <span class="form-label">Codigo</span>
              <input class="campo" name="codigo" [(ngModel)]="form.codigo" [disabled]="!!editandoCodigo" required>
            </label>
            <label class="grid gap-2">
              <span class="form-label">Nombre</span>
              <input class="campo" name="nombre" [(ngModel)]="form.nombre" required>
            </label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="form-label">Categoria</span>
                <input class="campo" name="categoria" [(ngModel)]="form.categoria">
              </label>
              <label class="grid gap-2">
                <span class="form-label">Precio</span>
                <input class="campo" type="number" step="0.01" name="precio" [(ngModel)]="form.precio">
              </label>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="form-label">Stock actual</span>
                <input class="campo" type="number" name="stock" [(ngModel)]="form.stock">
              </label>
              <label class="grid gap-2">
                <span class="form-label">Stock critico</span>
                <input class="campo" type="number" name="stockCritico" [(ngModel)]="form.stockCritico">
              </label>
            </div>
            <label class="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-bold dark:border-slate-800">
              <input type="checkbox" name="prioridadAlta" [(ngModel)]="form.prioridadAlta">
              Prioridad alta para alertas
            </label>
            <button class="boton-primario w-full" type="submit">{{ editandoCodigo ? 'Guardar producto' : 'Registrar producto' }}</button>
          </form>

          <form class="mt-5 grid gap-4" *ngIf="modoStock" (ngSubmit)="guardarStock()">
            <div class="soft-panel">
              <p class="form-label">Stock actual</p>
              <p class="mt-2 text-4xl font-black text-slate-950 dark:text-white">{{ productoSeleccionado?.stock }}</p>
            </div>
            <label class="grid gap-2">
              <span class="form-label">Sumar unidades al stock</span>
              <input class="campo" type="number" name="cantidadMovimiento" [(ngModel)]="cantidadMovimiento">
            </label>
            <label class="grid gap-2">
              <span class="form-label">O fijar stock exacto</span>
              <input class="campo" type="number" name="stockExacto" [(ngModel)]="stockExacto">
            </label>
            <button class="boton-primario w-full" type="submit">Aplicar stock</button>
          </form>

          <p class="mt-4 text-sm font-bold text-emerald-700 dark:text-emerald-300" *ngIf="mensaje">{{ mensaje }}</p>
        </aside>
      </div>
    </section>
  `
})
export class FarmaciaComponent implements OnInit {
  productos: Producto[] = [];
  busqueda = '';
  formularioAbierto = false;
  modoStock = false;
  editandoCodigo?: string;
  productoSeleccionado?: Producto;
  cantidadMovimiento = 0;
  stockExacto: number | null = null;
  mensaje = '';
  form: Producto = this.formularioVacio();

  constructor(private api: ApiService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.api.productos().subscribe(r => this.productos = r.data);
  }

  nuevoProducto() {
    this.form = this.formularioVacio();
    this.editandoCodigo = undefined;
    this.modoStock = false;
    this.mensaje = '';
    this.formularioAbierto = true;
  }

  editarProducto(producto: Producto) {
    this.form = { ...producto };
    this.editandoCodigo = producto.codigo;
    this.modoStock = false;
    this.mensaje = '';
    this.formularioAbierto = true;
  }

  abrirStock(producto: Producto) {
    this.productoSeleccionado = producto;
    this.cantidadMovimiento = 0;
    this.stockExacto = null;
    this.modoStock = true;
    this.mensaje = '';
    this.formularioAbierto = true;
  }

  guardarProducto() {
    const datos = {
      ...this.form,
      stock: Number(this.form.stock || 0),
      stockCritico: Number(this.form.stockCritico || 0),
      precio: Number(this.form.precio || 0)
    };
    const peticion = this.editandoCodigo ? this.api.actualizarProducto(this.editandoCodigo, datos) : this.api.crearProducto(datos);
    peticion.subscribe(() => {
      this.mensaje = 'Producto guardado correctamente.';
      this.cargar();
    });
  }

  guardarStock() {
    if (!this.productoSeleccionado) return;
    const codigo = this.productoSeleccionado.codigo;
    const peticion = this.stockExacto !== null && this.stockExacto !== undefined
      ? this.api.actualizarStock(codigo, Number(this.stockExacto))
      : this.api.agregarStock(codigo, Number(this.cantidadMovimiento || 0));
    peticion.subscribe(r => {
      this.productoSeleccionado = r.data;
      this.mensaje = 'Stock actualizado correctamente.';
      this.cargar();
    });
  }

  cerrarFormulario() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio(): Producto {
    return { codigo: '', nombre: '', categoria: 'Medicamentos', stock: 0, stockCritico: 5, precio: 0, prioridadAlta: false };
  }

  get criticos() { return this.productos.filter(p => p.stock <= p.stockCritico).length; }
  get stockTotal() { return this.productos.reduce((s, p) => s + Number(p.stock || 0), 0); }
  get valorInventario() { return this.productos.reduce((s, p) => s + Number(p.precio || 0) * Number(p.stock || 0), 0); }
  get filtrados() {
    const q = this.busqueda.toLowerCase();
    return this.productos.filter(p => `${p.codigo} ${p.nombre} ${p.categoria}`.toLowerCase().includes(q));
  }
}
