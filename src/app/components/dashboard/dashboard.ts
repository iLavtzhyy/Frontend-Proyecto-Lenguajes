import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Dashboard } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  resumen?: Dashboard;
  tarjetas: { titulo: string; valor: number; detalle: string }[] = [];
  servicios = [
    { nombre: 'Consultas', total: 284, icono: 'stethoscope' },
    { nombre: 'Cirugias', total: 42, icono: 'surgery' },
    { nombre: 'Vacunas', total: 156, icono: 'syringe' },
    { nombre: 'Laboratorio', total: 89, icono: 'lab' },
    { nombre: 'Farmacia', total: 201, icono: 'pill' },
    { nombre: 'Emergencias', total: 18, icono: 'shield' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.dashboard().subscribe(r => {
      this.resumen = r.data;
      this.tarjetas = [
        { titulo: 'Clientes', valor: 30, detalle: 'Propietarios activos' },
        { titulo: 'Mascotas', valor: r.data.totalMascotas, detalle: 'Pacientes registrados' },
        { titulo: 'Citas hoy', valor: 6, detalle: '2 pendientes' },
        { titulo: 'Citas mes', valor: 28, detalle: 'Este mes' },
        { titulo: 'Internadas', valor: r.data.mascotasInternadas, detalle: 'Monitoreo activo' },
        { titulo: 'Cirugias hoy', valor: r.data.cirugiasHoy, detalle: 'Quirofano' }
      ];
    });
  }
}
