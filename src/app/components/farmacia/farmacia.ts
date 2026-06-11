import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Producto } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-farmacia',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './farmacia.html',
  styleUrl: './farmacia.css'
})
export class FarmaciaComponent implements OnInit {
  productos: Producto[] = [];
  busqueda = '';
  categoriaActiva = 'Todas';
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
    this.api.productos().subscribe({
      next: r => this.productos = r.data,
      error: () => {
        this.productos = [];
        this.mensaje = 'No se pudo cargar farmacia. Revisa que el backend este encendido y que tu rol tenga permiso.';
      }
    });
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
    peticion.subscribe({
      next: () => {
        this.mensaje = 'Producto guardado correctamente.';
        this.cargar();
        this.cerrarFormulario();
      },
      error: () => this.mensaje = 'No se pudo guardar el producto.'
    });
  }

  guardarStock() {
    if (!this.productoSeleccionado) return;
    const codigo = this.productoSeleccionado.codigo;
    const peticion = this.stockExacto !== null && this.stockExacto !== undefined
      ? this.api.actualizarStock(codigo, Number(this.stockExacto))
      : this.api.agregarStock(codigo, Number(this.cantidadMovimiento || 0));
    peticion.subscribe({
      next: r => {
        this.productoSeleccionado = r.data;
        this.mensaje = 'Stock actualizado correctamente.';
        this.cargar();
        this.cerrarFormulario();
      },
      error: () => this.mensaje = 'No se pudo actualizar el stock. Verifica permiso de recepcion/admin.'
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
  get categorias() {
    return ['Todas', ...Array.from(new Set(this.productos.map(p => p.categoria || 'Sin categoria'))).sort()];
  }
  get resumenCategorias() {
    return this.categorias.filter(c => c !== 'Todas').map(categoria => {
      const productos = this.productos.filter(p => (p.categoria || 'Sin categoria') === categoria);
      return {
        categoria,
        productos: productos.length,
        stock: productos.reduce((s, p) => s + Number(p.stock || 0), 0),
        criticos: productos.filter(p => p.stock <= p.stockCritico).length,
        valor: productos.reduce((s, p) => s + Number(p.precio || 0) * Number(p.stock || 0), 0)
      };
    });
  }
  get filtrados() {
    const q = this.busqueda.toLowerCase();
    return this.productos.filter(p => {
      const coincideTexto = `${p.codigo} ${p.nombre} ${p.categoria}`.toLowerCase().includes(q);
      const coincideCategoria = this.categoriaActiva === 'Todas' || (p.categoria || 'Sin categoria') === this.categoriaActiva;
      return coincideTexto && coincideCategoria;
    });
  }
  get gruposFiltrados() {
    return this.categorias
      .filter(categoria => categoria !== 'Todas')
      .map(categoria => ({
        categoria,
        productos: this.filtrados.filter(p => (p.categoria || 'Sin categoria') === categoria)
      }))
      .filter(grupo => grupo.productos.length);
  }
}
