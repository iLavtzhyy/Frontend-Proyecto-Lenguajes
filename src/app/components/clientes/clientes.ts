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
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  busqueda = '';
  
  mostrarFormCliente = false;
  esNuevo = false;
  clienteEdicion: any = {};
  clienteDetalles: Cliente | null = null;

  constructor(private api: ApiService) {}
  
  ngOnInit() { 
    this.cargarClientes(); 
  }
  
  cargarClientes() {
    this.api.clientes().subscribe(r => this.clientes = r.data);
  }
  
  get filtrados() {
    const q = this.busqueda.toLowerCase();
    return this.clientes.filter(c => `${c.nombres} ${c.apellidos} ${c.email} ${c.telefono}`.toLowerCase().includes(q));
  }
  
  get totalMascotas() { return this.clientes.reduce((s, c) => s + (c.mascotas?.length || 0), 0); }
  get totalGastado() { return this.clientes.reduce((s, c) => s + Number(c.totalGastado || 0), 0); }
  get activos() { return this.clientes.filter(c => (c.estado || 'Activo') === 'Activo').length; }

  abrirNuevoCliente() {
    this.esNuevo = true;
    this.clienteEdicion = {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      ciudad: 'Quito',
      documento: '',
      estado: 'Activo'
    };
    this.mostrarFormCliente = true;
  }

  abrirEditarCliente(cliente: Cliente) {
    this.esNuevo = false;
    this.clienteEdicion = { ...cliente };
    this.mostrarFormCliente = true;
  }

  abrirDetallesCliente(cliente: Cliente) {
    this.clienteDetalles = cliente;
  }

  cerrarFormCliente() {
    this.mostrarFormCliente = false;
    this.clienteEdicion = {};
  }

  cerrarDetallesCliente() {
    this.clienteDetalles = null;
  }

  guardarCliente() {
    if (!this.clienteEdicion.nombres || !this.clienteEdicion.apellidos || !this.clienteEdicion.email) {
      alert('Por favor complete los campos obligatorios: Nombres, Apellidos y Email.');
      return;
    }

    if (this.esNuevo) {
      this.api.crearCliente(this.clienteEdicion).subscribe({
        next: (res) => {
          if (res.ok) {
            this.cargarClientes();
            this.cerrarFormCliente();
          } else {
            alert(res.mensaje || 'Error al guardar el cliente');
          }
        },
        error: (err) => {
          alert(err.error?.mensaje || 'Error al guardar el cliente. Verifique que el correo no esté registrado.');
        }
      });
    } else {
      this.api.actualizarCliente(this.clienteEdicion.id, this.clienteEdicion).subscribe({
        next: (res) => {
          if (res.ok) {
            this.cargarClientes();
            this.cerrarFormCliente();
          } else {
            alert(res.mensaje || 'Error al actualizar el cliente');
          }
        },
        error: (err) => {
          alert(err.error?.mensaje || 'Error al actualizar el cliente');
        }
      });
    }
  }
}
