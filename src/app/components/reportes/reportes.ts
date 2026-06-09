import { Component } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { fadeInUp } from '../../shared/animations/fade-in-up';

@Component({
  selector: 'app-reportes',
  standalone: true,
  animations: [fadeInUp],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent {
  constructor(private api: ApiService) {}
  pdf() { this.api.descargar('/reportes/mascotas/1/historial.pdf', 'historial-milo.pdf'); }
  excel() { this.api.descargar('/reportes/finanzas.xlsx', 'finanzas-vetsphere.xlsx'); }
}
