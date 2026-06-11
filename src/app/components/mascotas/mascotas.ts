import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente, Mascota } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';
import { AutorizacionService } from '../../core/autorizacion.service';

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
  puedeGestionarClientes = false;

  constructor(private api: ApiService, private autorizacion: AutorizacionService) {}

  ngOnInit() {
    this.cargar();
    this.puedeGestionarClientes = this.autorizacion.tieneRol(['ROLE_ADMIN', 'ROLE_RECEPCIONISTA', 'ROLE_VETERINARIO']);
    if (!this.puedeGestionarClientes) return;
    this.api.clientes().subscribe({
      next: r => {
        this.clientes = r.data;
        if (!this.form.propietarioId && this.clientes.length) this.form.propietarioId = this.clientes[0].id;
      },
      error: () => {
        this.clientes = [];
      }
    });
  }

  cargar() {
    this.api.mascotas().subscribe({
      next: r => {
        this.mascotas = r.data;
        if (!this.seleccionada && r.data.length) this.seleccionada = r.data[0];
        if (this.seleccionada) this.seleccionada = r.data.find(m => m.id === this.seleccionada?.id) || r.data[0];
      },
      error: () => {
        this.mascotas = [];
        this.seleccionada = undefined;
        this.mensajeFormulario = 'No se pudieron cargar mascotas. Revisa que el backend este encendido y tu rol tenga permiso.';
      }
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
      this.api.actualizarMascota(this.editandoId, datos).subscribe({
        next: r => {
          this.mensajeFormulario = 'Mascota actualizada correctamente.';
          this.seleccionada = r.data;
          this.cargar();
          this.cerrarFormulario();
        },
        error: () => this.mensajeFormulario = 'No se pudo actualizar la mascota.'
      });
      return;
    }
    this.api.crearMascota(datos, this.foto).subscribe({
      next: r => {
        this.mensajeFormulario = 'Mascota registrada correctamente.';
        this.seleccionada = r.data;
        this.cargar();
        this.cerrarFormulario();
      },
      error: () => this.mensajeFormulario = 'No se pudo registrar la mascota.'
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
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) this.subir(archivo);
    input.value = '';
  }

  soltar(evento: DragEvent) {
    evento.preventDefault();
    const archivo = evento.dataTransfer?.files?.[0];
    if (archivo) this.subir(archivo);
  }

  subir(archivo: File) {
    if (!this.seleccionada) return;
    const historial = {
      fecha: new Date().toISOString().slice(0, 19),
      tipoEvento: 'ARCHIVO MEDICO',
      motivo: `Archivo cargado: ${archivo.name}`,
      diagnostico: 'Documento adjunto al historial clinico del paciente.',
      tratamiento: 'Revision documental pendiente en consulta.',
      vacunas: '',
      temperatura: 0,
      frecuenciaCardiaca: 0,
      frecuenciaRespiratoria: 0,
      veterinarioId: null
    };
    this.api.agregarHistorialMascota(this.seleccionada.id, historial, archivo).subscribe(r => {
      this.mensajeArchivo = `Archivo guardado en historial: ${this.nombreArchivo(r.data.archivosUrl)}`;
      this.cargar();
    });
  }

  eliminarArchivo(mascota: Mascota, historialId: number, nombre: string) {
    if (!confirm(`Eliminar el archivo ${nombre}?`)) return;
    this.api.eliminarArchivoMascota(mascota.id, historialId).subscribe(() => {
      this.mensajeArchivo = 'Archivo eliminado del historial.';
      this.cargar();
    });
  }

  descargarPdf(id: number) { this.api.descargar(`/reportes/mascotas/${id}/historial.pdf`, `historial-${id}.pdf`); }
  descargarExcel() { this.api.descargar('/reportes/finanzas.xlsx', 'reporte-financiero-vetsphere.xlsx'); }

  archivosClinicos(mascota: Mascota) {
    return (mascota.historiales || []).filter(h => !!h.archivosUrl);
  }

  nombreArchivo(url?: string) {
    if (!url) return 'archivo-medico';
    return decodeURIComponent(url.split('/').pop() || 'archivo-medico');
  }

  urlArchivo(url?: string) {
    if (!url) return '#';
    return url.startsWith('http') ? url : `http://localhost:8080${url}`;
  }

  iconoArchivo(url?: string) {
    const nombre = (url || '').toLowerCase();
    if (nombre.endsWith('.pdf')) return 'PDF';
    if (/\.(png|jpg|jpeg|webp)$/i.test(nombre)) return 'IMG';
    return 'DOC';
  }
}
