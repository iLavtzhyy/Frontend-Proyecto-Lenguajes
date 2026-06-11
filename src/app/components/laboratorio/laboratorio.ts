import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Mascota, OrdenLaboratorio, Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-laboratorio',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './laboratorio.html',
  styleUrl: './laboratorio.css'
})
export class LaboratorioComponent implements OnInit {
  ordenes: OrdenLaboratorio[] = [];
  mascotas: Mascota[] = [];
  veterinarios: Usuario[] = [];
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

  cargar() { this.api.laboratorio().subscribe(r => this.ordenes = r.data); }

  nueva() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.veterinarioId = this.veterinarios[0]?.id || null;
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  editar(orden: OrdenLaboratorio) {
    this.editandoId = orden.id;
    this.form = {
      mascotaId: null,
      veterinarioId: null,
      tipoPrueba: orden.tipoPrueba || '',
      resultado: orden.resultado || '',
      estado: orden.estado || 'Pendiente',
      archivoResultadoUrl: orden.archivoResultadoUrl || ''
    };
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    if (this.editandoId) {
      this.api.actualizarOrdenLaboratorio(this.editandoId, this.form).subscribe(() => {
        this.mensaje = 'Orden actualizada correctamente.';
        this.cargar();
        this.cerrar();
      });
      return;
    }
    this.api.crearOrdenLaboratorio({
      fecha: new Date().toISOString().slice(0, 19),
      tipoPrueba: this.form.tipoPrueba,
      resultado: this.form.resultado,
      estado: this.form.estado,
      archivoResultadoUrl: this.form.archivoResultadoUrl,
      mascota: { id: this.form.mascotaId },
      veterinarioSolicitante: { id: this.form.veterinarioId }
    }).subscribe(() => {
      this.mensaje = 'Orden creada correctamente.';
      this.cargar();
      this.cerrar();
    });
  }

  eliminar(orden: OrdenLaboratorio) {
    if (!confirm(`Eliminar orden ${orden.tipoPrueba}?`)) return;
    this.api.eliminarOrdenLaboratorio(orden.id).subscribe(() => this.ordenes = this.ordenes.filter(o => o.id !== orden.id));
  }

  cerrar() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return { mascotaId: null as number | null, veterinarioId: null as number | null, tipoPrueba: 'Hemograma completo', resultado: '', estado: 'Pendiente', archivoResultadoUrl: '' };
  }

  contar(estado: string) { return this.ordenes.filter(o => (o.estado || '').toLowerCase().includes(estado.toLowerCase())).length; }
  nombreUsuario(usuario?: Usuario) { return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Sin veterinario'; }
  badgeEstado(estado?: string) {
    const e = (estado || '').toLowerCase();
    if (e.includes('entregado')) return 'badge-ok';
    if (e.includes('repetir')) return 'badge-danger';
    if (e.includes('proces')) return 'badge-info';
    return 'badge-warn';
  }
  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.ordenes.filter(o => `${o.tipoPrueba} ${o.estado} ${o.resultado} ${o.mascota?.nombre}`.toLowerCase().includes(q));
  }
}
