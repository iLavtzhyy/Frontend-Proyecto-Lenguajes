import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [fadeInUp],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  busqueda = '';
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.clientes().subscribe(r => this.clientes = r.data); }
  get filtrados() {
    const q = this.busqueda.toLowerCase();
    return this.clientes.filter(c => `${c.nombres} ${c.apellidos} ${c.email} ${c.telefono}`.toLowerCase().includes(q));
  }
  get totalMascotas() { return this.clientes.reduce((s, c) => s + (c.mascotas?.length || 0), 0); }
  get totalGastado() { return this.clientes.reduce((s, c) => s + Number(c.totalGastado || 0), 0); }
  get activos() { return this.clientes.filter(c => (c.estado || 'Activo') === 'Activo').length; }
}
