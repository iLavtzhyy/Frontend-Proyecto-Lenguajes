import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { Mascota, Usuario } from '../../core/modelos';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-recepcion',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './agendar-cita.html',
  styleUrl: './agendar-cita.css'
})
export class RecepcionComponent implements OnInit {
  panel: Record<string, number> = {};
  citas: any[] = [];
  mascotas: Mascota[] = [];
  veterinarios: Usuario[] = [];
  formularioAbierto = false;
  mensaje = '';
  form = this.formularioVacio();
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.cargar();
    this.api.mascotas().subscribe({
      next: r => this.mascotas = r.data,
      error: () => this.mensaje = 'No se pudieron cargar mascotas. Revisa backend y permisos.'
    });
    this.api.veterinarios().subscribe({
      next: r => this.veterinarios = r.data,
      error: () => this.mensaje = 'No se pudieron cargar veterinarios.'
    });
  }

  cargar() {
    this.api.recepcion().subscribe({
      next: r => this.panel = r.data,
      error: () => this.mensaje = 'No se pudo cargar el panel de recepcion.'
    });
    this.api.citas().subscribe({
      next: r => this.citas = r.data,
      error: () => {
        this.citas = [];
        this.mensaje = 'No se pudieron cargar citas. Verifica que Spring Boot este ejecutandose en el puerto 8080.';
      }
    });
  }

  nueva() {
    this.form = this.formularioVacio();
    this.form.mascotaId = this.mascotas[0]?.id || null;
    this.form.veterinarioId = this.veterinarios[0]?.id || null;
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    this.api.crearCita({
      fechaHora: this.form.fechaHora,
      motivo: this.form.motivo,
      estado: this.form.estado,
      observaciones: this.form.observaciones,
      mascota: { id: this.form.mascotaId },
      veterinario: { id: this.form.veterinarioId }
    }).subscribe({
      next: () => {
        this.mensaje = 'Cita creada correctamente.';
        this.formularioAbierto = false;
        this.cargar();
      },
      error: () => this.mensaje = 'No se pudo crear la cita. Revisa mascota, veterinario y permisos.'
    });
  }

  cerrar() {
    this.formularioAbierto = false;
  }

  formularioVacio() {
    const fecha = new Date();
    fecha.setHours(fecha.getHours() + 1);
    return {
      fechaHora: fecha.toISOString().slice(0, 16),
      motivo: 'Consulta general',
      estado: 'Programada',
      observaciones: '',
      mascotaId: null as number | null,
      veterinarioId: null as number | null
    };
  }
}
