import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente, Mascota } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-mascotas',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './mascotas.html',
  styleUrl: './mascotas.css'
})
export class MascotasComponent implements OnInit {
  mascotas: Mascota[] = [];
  clientes: Cliente[] = [];
  seleccionada?: Mascota;
  mensajeArchivo = '';
  mensajeFormulario = '';
  busqueda = '';
  formularioAbierto = false;
  editandoId?: number;
  foto?: File | null;
  form = this.formularioVacio();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargar();
    this.api.clientes().subscribe(r => {
      this.clientes = r.data;
      if (!this.form.propietarioId && this.clientes.length) this.form.propietarioId = this.clientes[0].id;
    });
  }

  cargar() {
    this.api.mascotas().subscribe(r => {
      this.mascotas = r.data;
      if (!this.seleccionada && r.data.length) this.seleccionada = r.data[0];
      if (this.seleccionada) this.seleccionada = r.data.find(m => m.id === this.seleccionada?.id) || r.data[0];
    });
  }

  get filtradas() {
    const q = this.busqueda.toLowerCase();
    return this.mascotas.filter(m => `${m.nombre} ${m.especie} ${m.raza} ${m.propietario?.nombres} ${m.propietario?.apellidos}`.toLowerCase().includes(q));
  }

  seleccionarMascota(mascota: Mascota) {
    this.seleccionada = mascota;
  }

  nuevo() {
    this.editandoId = undefined;
    this.form = this.formularioVacio();
    this.form.propietarioId = this.clientes[0]?.id || null;
    this.foto = null;
    this.mensajeFormulario = '';
    this.formularioAbierto = true;
  }

  editar(mascota: Mascota) {
    this.editandoId = mascota.id;
    this.form = {
      nombre: mascota.nombre,
      especie: mascota.especie || 'Canino',
      raza: mascota.raza,
      sexo: mascota.sexo || 'Macho',
      color: mascota.color,
      pesoKg: mascota.pesoKg,
      fechaNacimiento: mascota.fechaNacimiento,
      propietarioId: mascota.propietario?.id || null,
      estado: mascota.estado || 'ACTIVA'
    };
    this.mensajeFormulario = '';
    this.formularioAbierto = true;
  }

  guardar() {
    const datos = { ...this.form, pesoKg: Number(this.form.pesoKg || 0), fechaNacimiento: this.form.fechaNacimiento || null };
    if (this.editandoId) {
      this.api.actualizarMascota(this.editandoId, datos).subscribe(r => {
        this.mensajeFormulario = 'Mascota actualizada correctamente.';
        this.seleccionada = r.data;
        this.cargar();
      });
      return;
    }
    this.api.crearMascota(datos, this.foto).subscribe(r => {
      this.mensajeFormulario = 'Mascota registrada correctamente.';
      this.seleccionada = r.data;
      this.cargar();
    });
  }

  eliminar(mascota: Mascota) {
    if (!confirm(`Eliminar a ${mascota.nombre}?`)) return;
    this.api.eliminarMascota(mascota.id).subscribe(() => {
      this.mascotas = this.mascotas.filter(m => m.id !== mascota.id);
      this.seleccionada = this.mascotas[0];
      if (this.editandoId === mascota.id) this.cerrarFormulario();
    });
  }

  cerrarFormulario() {
    this.formularioAbierto = false;
    this.editandoId = undefined;
    this.mensajeFormulario = '';
  }

  fotoFormulario(evento: Event) {
    this.foto = (evento.target as HTMLInputElement).files?.[0] || null;
  }

  formularioVacio() {
    return {
      nombre: '',
      especie: 'Canino',
      raza: '',
      sexo: 'Macho',
      color: '',
      pesoKg: 0,
      fechaNacimiento: '',
      propietarioId: null as number | null,
      estado: 'ACTIVA'
    };
  }

  fotoMascota(mascota: Mascota) {
    return mascota.fotoUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900';
  }

  eventos(mascota: Mascota) {
    return [
      ...(mascota.historiales || []).map(h => ({ fecha: h.fecha, tipo: h.tipoEvento, titulo: h.motivo, detalle: `${h.diagnostico || ''} Tratamiento: ${h.tratamiento || ''}` })),
      ...(mascota.cirugias || []).map(c => ({ fecha: c.fechaProgramada, tipo: 'CIRUGIA', titulo: c.procedimiento, detalle: `${c.tipoAnestesia || ''}. ${c.estadoPostoperatorio || ''}` }))
    ].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }

  seleccionar(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (archivo) this.subir(archivo);
  }

  soltar(evento: DragEvent) {
    evento.preventDefault();
    const archivo = evento.dataTransfer?.files?.[0];
    if (archivo) this.subir(archivo);
  }

  subir(archivo: File) {
    this.api.subirArchivo(archivo).subscribe(r => this.mensajeArchivo = `Archivo guardado: ${r.data}`);
  }

  descargarPdf(id: number) { this.api.descargar(`/reportes/mascotas/${id}/historial.pdf`, `historial-${id}.pdf`); }
  descargarExcel() { this.api.descargar('/reportes/finanzas.xlsx', 'reporte-financiero-vetsphere.xlsx'); }
}
