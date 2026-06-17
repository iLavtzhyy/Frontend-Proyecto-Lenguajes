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
  servicios: { nombre: string; total: number; icono: string }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.dashboard().subscribe(r => {
      this.resumen = r.data;
      this.tarjetas = [
        { titulo: 'Clientes', valor: r.data.totalClientes, detalle: 'Propietarios activos' },
        { titulo: 'Mascotas', valor: r.data.totalMascotas, detalle: 'Pacientes registrados' },
        { titulo: 'Citas hoy', valor: r.data.citasHoy, detalle: 'Planificadas hoy' },
        { titulo: 'Citas mes', valor: r.data.citasMes, detalle: 'Este mes' },
        { titulo: 'Internadas', valor: r.data.mascotasInternadas, detalle: 'Monitoreo activo' },
        { titulo: 'Cirugias hoy', valor: r.data.cirugiasHoy, detalle: 'En quirófano' }
      ];
      this.servicios = [
        { nombre: 'Consultas', total: r.data.totalConsultas, icono: 'stethoscope' },
        { nombre: 'Cirugias', total: r.data.totalCirugias, icono: 'surgery' },
        { nombre: 'Vacunas', total: r.data.totalVacunas, icono: 'syringe' },
        { nombre: 'Laboratorio', total: r.data.totalLaboratorio, icono: 'lab' },
        { nombre: 'Farmacia', total: r.data.totalProductos, icono: 'pill' },
        { nombre: 'Emergencias', total: r.data.totalEmergencias, icono: 'shield' }
      ];
    });
  }

  // Getters for dynamic calculations in template
  get gatoPorcentaje() {
    if (!this.resumen) return 30;
    const total = this.resumen.totalPerros + this.resumen.totalGatos;
    if (total === 0) return 30;
    return Math.round((this.resumen.totalGatos / total) * 100);
  }

  get perroPorcentaje() {
    if (!this.resumen) return 70;
    const total = this.resumen.totalPerros + this.resumen.totalGatos;
    if (total === 0) return 70;
    return Math.round((this.resumen.totalPerros / total) * 100);
  }

  get maxCitaCount() {
    if (!this.resumen || !this.resumen.citasUltimos7Dias.length) return 10;
    return Math.max(...this.resumen.citasUltimos7Dias, 5);
  }

  getBarHeightPercentage(count: number): string {
    const max = this.maxCitaCount;
    return `${Math.round((count / max) * 100)}%`;
  }
}
