import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Factura } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule],
  animations: [fadeInUp],
  templateUrl: './facturacion.html',
  styleUrl: './facturacion.css'
})
export class FacturacionComponent implements OnInit {
  facturas: Factura[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.facturas().subscribe(r => this.facturas = r.data); }
  get total() { return this.facturas.reduce((s, f) => s + Number(f.total || 0), 0); }
  get pendientes() { return this.facturas.filter(f => f.estadoPago === 'Pendiente').length; }
  get pagadas() { return this.facturas.filter(f => f.estadoPago === 'Pagado').length; }
}
