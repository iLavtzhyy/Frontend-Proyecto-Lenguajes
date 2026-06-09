import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ConsultaMedica, Mascota, Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './consultas.html',
  styleUrl: './consultas.css'
})
export class ConsultasComponent implements OnInit {
  consultas: ConsultaMedica[] = [];
  mascotas: Mascota[] = [];
  veterinarios: Usuario[] = [];
  busqueda = '';
  tipos = ['Rutina', 'Emergencia', 'Control', 'Cirugia', 'Vacunacion'];
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
    this.api.consultas().subscribe(r => this.consultas = r.data);
  }

  nuevaConsulta() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.veterinarioId = this.veterinarios[0]?.id || null;
    this.mensaje = '';
    this.formularioAbierto = true;
  }

  editar(consulta: ConsultaMedica) {
    this.editandoId = consulta.id;
    this.form = {
      mascotaId: null,
      veterinarioId: null,
      tipo: consulta.tipo || 'Rutina',
      motivo: consulta.tipo || 'Consulta medica',
      diagnostico: consulta.diagnostico || '',
      tratamiento: consulta.tratamiento || '',
      temperatura: consulta.temperatura || 0,
      frecuenciaCardiaca: 0,
      frecuenciaRespiratoria: 0
    };
    this.mensaje = '';
    this.formularioAbierto = true;
  }

  guardar() {
    const datos = {
      tipo: this.form.tipo,
      tipoEvento: this.form.tipo,
      motivo: this.form.motivo,
      diagnostico: this.form.diagnostico,
      tratamiento: this.form.tratamiento,
      temperatura: Number(this.form.temperatura || 0),
      frecuenciaCardiaca: Number(this.form.frecuenciaCardiaca || 0),
      frecuenciaRespiratoria: Number(this.form.frecuenciaRespiratoria || 0)
    };
    if (this.editandoId) {
      this.api.actualizarConsulta(this.editandoId, datos).subscribe(() => {
        this.mensaje = 'Consulta actualizada correctamente.';
        this.cargar();
      });
      return;
    }
    this.api.crearConsulta({
      ...datos,
      fecha: new Date().toISOString().slice(0, 19),
      mascota: { id: this.form.mascotaId },
      veterinario: { id: this.form.veterinarioId }
    }).subscribe(() => {
      this.mensaje = 'Consulta registrada correctamente.';
      this.cargar();
    });
  }

  eliminar(consulta: ConsultaMedica) {
    if (!confirm(`Eliminar consulta de ${consulta.mascota}?`)) return;
    this.api.eliminarConsulta(consulta.id).subscribe(() => this.consultas = this.consultas.filter(c => c.id !== consulta.id));
  }

  cerrarFormulario() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return {
      mascotaId: null as number | null,
      veterinarioId: null as number | null,
      tipo: 'Rutina',
      motivo: '',
      diagnostico: '',
      tratamiento: '',
      temperatura: 38,
      frecuenciaCardiaca: 90,
      frecuenciaRespiratoria: 24
    };
  }

  contar(tipo: string) { return this.consultas.filter(c => (c.tipo || '').toLowerCase() === tipo.toLowerCase()).length; }

  badgeTipo(tipo: string) {
    const t = (tipo || '').toLowerCase();
    if (t.includes('emerg')) return 'badge-danger';
    if (t.includes('cirug')) return 'badge-warn';
    if (t.includes('vac')) return 'badge-ok';
    return 'badge-info';
  }

  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.consultas.filter(c => `${c.mascota} ${c.cliente} ${c.veterinario} ${c.diagnostico}`.toLowerCase().includes(q));
  }
}
