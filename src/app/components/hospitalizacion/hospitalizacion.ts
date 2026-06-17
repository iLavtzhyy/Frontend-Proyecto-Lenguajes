import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Hospitalizacion, Mascota, Usuario, Factura } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-hospitalizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './hospitalizacion.html',
  styleUrl: './hospitalizacion.css'
})
export class HospitalizacionComponent implements OnInit {
  hospitalizaciones: Hospitalizacion[] = [];
  mascotas: Mascota[] = [];
  veterinarios: Usuario[] = [];
  facturas: Factura[] = [];
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

  cargar() { 
    this.api.hospitalizaciones().subscribe(r => this.hospitalizaciones = r.data); 
    this.api.facturas().subscribe(r => this.facturas = r.data);
  }

  pagarFactura(facturaId?: number) {
    if (!facturaId) return;
    this.api.actualizarEstadoFactura(facturaId, 'Pagado').subscribe(() => {
      this.cargar();
    });
  }

  obtenerEstadoPago(facturaId?: number): string {
    if (!facturaId) return 'Pendiente';
    const f = this.facturas.find(x => x.id === facturaId);
    return f ? f.estadoPago : 'Pendiente';
  }

  nuevoIngreso() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.veterinarioId = this.veterinarios[0]?.id || null;
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  editar(h: Hospitalizacion) {
    this.editandoId = h.id;
    this.form = {
      mascotaId: h.mascota?.id || null,
      veterinarioId: h.veterinarioResponsable?.id || null,
      jaula: h.jaula || '',
      motivo: h.motivo || '',
      planCuidados: h.planCuidados || '',
      estado: h.estado || 'Internado',
      alta: h.alta ? h.alta.slice(0, 16) : '',
      precio: h.precio || 45.00
    };
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    if (this.editandoId) {
      this.api.actualizarHospitalizacion(this.editandoId, { ...this.form, alta: this.form.alta || null }).subscribe(() => {
        this.mensaje = 'Hospitalizacion actualizada correctamente.';
        this.cargar();
        this.cerrar();
      });
      return;
    }
    this.api.crearHospitalizacion({
      ingreso: new Date().toISOString().slice(0, 19),
      jaula: this.form.jaula,
      motivo: this.form.motivo,
      planCuidados: this.form.planCuidados,
      estado: this.form.estado,
      alta: this.form.alta || null,
      precio: this.form.precio,
      mascota: { id: this.form.mascotaId },
      veterinarioResponsable: { id: this.form.veterinarioId }
    }).subscribe(() => {
      this.mensaje = 'Ingreso registrado correctamente.';
      this.cargar();
      this.cerrar();
    });
  }

  eliminar(h: Hospitalizacion) {
    if (!confirm(`Eliminar hospitalizacion de ${h.mascota?.nombre || 'paciente'}?`)) return;
    this.api.eliminarHospitalizacion(h.id).subscribe(() => this.hospitalizaciones = this.hospitalizaciones.filter(i => i.id !== h.id));
  }

  cerrar() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return { mascotaId: null as number | null, veterinarioId: null as number | null, jaula: 'H-01', motivo: '', planCuidados: '', estado: 'Internado', alta: '', precio: 45.00 };
  }

  contar(estado: string) { return this.hospitalizaciones.filter(h => (h.estado || '').toLowerCase().includes(estado.toLowerCase())).length; }
  nombreUsuario(usuario?: Usuario) { return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Sin responsable'; }
  badgeEstado(estado?: string) {
    const e = (estado || '').toLowerCase();
    if (e.includes('alta')) return 'badge-ok';
    if (e.includes('crit')) return 'badge-danger';
    if (e.includes('observ')) return 'badge-info';
    return 'badge-warn';
  }
  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.hospitalizaciones.filter(h => `${h.mascota?.nombre} ${h.jaula} ${h.motivo} ${h.estado}`.toLowerCase().includes(q));
  }
}
