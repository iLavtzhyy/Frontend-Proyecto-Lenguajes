import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent {
  constructor(private api: ApiService) {}

  tarjetas = [
    {
      tipo: 'PDF',
      titulo: 'Historial clinico',
      texto: 'Documento medico con ficha del paciente, consultas, vacunas, cirugias y firma de VetSphere.',
      icono: 'file',
      accion: () => this.pdf()
    },
    {
      tipo: 'Excel',
      titulo: 'Finanzas e inventario',
      texto: 'Exporta productos, stock, precios y valor valorizado para control administrativo.',
      icono: 'download',
      accion: () => this.excel()
    },
    {
      tipo: 'SOAP/CXF',
      titulo: 'Pruebas XML de farmacia',
      texto: 'Inventario conectado a servicio SOAP protegido con UsernameToken y XML seguro.',
      icono: 'shield',
      accion: () => this.excel()
    }
  ];

  pdf() { this.api.descargar('/reportes/mascotas/1/historial.pdf', 'historial-milo.pdf'); }
  excel() { this.api.descargar('/reportes/finanzas.xlsx', 'finanzas-vetsphere.xlsx'); }
}
