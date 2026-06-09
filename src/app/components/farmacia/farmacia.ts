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
