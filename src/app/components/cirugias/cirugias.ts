import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cirugia, Mascota, Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-cirugias',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './cirugias.html',
  styleUrl: './cirugias.css'
})
export class CirugiasComponent implements OnInit {
  cirugias: Cirugia[] = [];
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

  cargar() {
    this.api.cirugias().subscribe(r => this.cirugias = r.data);
  }

  nueva() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.cirujanoId = this.veterinarios[0]?.id || null;
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  editar(cirugia: Cirugia) {
    this.editandoId = cirugia.id;
    this.form = {
      mascotaId: cirugia.mascota?.id || this.mascotas[0]?.id || null,
      cirujanoId: cirugia.cirujano?.id || this.veterinarios[0]?.id || null,
      fechaProgramada: this.fechaInput(cirugia.fechaProgramada),
      procedimiento: cirugia.procedimiento || '',
      tipoAnestesia: cirugia.tipoAnestesia || '',
      cirujanoPrincipal: cirugia.cirujanoPrincipal || this.nombreUsuario(cirugia.cirujano),
      constantesVitales: cirugia.constantesVitales || '',
      estadoPostoperatorio: cirugia.estadoPostoperatorio || '',
      estado: cirugia.estado || 'Pendiente',
      notas: cirugia.notas || ''
    };
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    const datos = { ...this.form };
    const peticion = this.editandoId ? this.api.actualizarCirugia(this.editandoId, datos) : this.api.crearCirugia(datos);
    peticion.subscribe(() => {
      this.mensaje = 'Cirugia guardada correctamente.';
      this.cargar();
    });
  }

  eliminar(cirugia: Cirugia) {
    if (!confirm(`Eliminar cirugia ${cirugia.procedimiento}?`)) return;
    this.api.eliminarCirugia(cirugia.id).subscribe(() => this.cirugias = this.cirugias.filter(c => c.id !== cirugia.id));
  }

  cerrar() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return {
      mascotaId: null as number | null,
      cirujanoId: null as number | null,
      fechaProgramada: new Date().toISOString().slice(0, 16),
      procedimiento: '',
      tipoAnestesia: 'General inhalatoria',
      cirujanoPrincipal: '',
      constantesVitales: 'FC 90 / FR 24 / Temp 38.4',
      estadoPostoperatorio: '',
      estado: 'Pendiente',
      notas: ''
    };
  }

  fechaInput(fecha?: string) {
    return fecha ? fecha.slice(0, 16) : new Date().toISOString().slice(0, 16);
  }

  nombreUsuario(usuario?: Usuario) {
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Sin asignar';
  }

  contarEstado(estado: string) {
    return this.cirugias.filter(c => (c.estado || '').toLowerCase().includes(estado.toLowerCase())).length;
  }

  get postoperatorios() {
    return this.cirugias.filter(c => (c.estado || '').toLowerCase().includes('post')).length;
  }

  badgeEstado(estado?: string) {
    const e = (estado || '').toLowerCase();
    if (e.includes('complet')) return 'badge-ok';
    if (e.includes('cancel')) return 'badge-danger';
    if (e.includes('post')) return 'badge-info';
    return 'badge-warn';
  }

  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.cirugias.filter(c => `${c.procedimiento} ${c.estado} ${c.mascota?.nombre} ${c.cirujanoPrincipal}`.toLowerCase().includes(q));
  }
}
