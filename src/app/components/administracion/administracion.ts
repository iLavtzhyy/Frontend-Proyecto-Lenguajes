import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { Usuario } from '../../core/modelos';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [fadeInUp],
  templateUrl: './administracion.html',
  styleUrl: './administracion.css'
})
export class AdministracionComponent implements OnInit {
  indicadores: Record<string, number> = {};
  solicitudes: Usuario[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.administracion().subscribe(r => this.indicadores = r.data);
    this.api.solicitudesPendientes().subscribe(r => this.solicitudes = r.data);
  }
  aprobar(id: number) {
    this.api.aprobarUsuario(id).subscribe(() => {
      this.solicitudes = this.solicitudes.filter(s => s.id !== id);
      this.indicadores['solicitudes'] = Math.max(0, (this.indicadores['solicitudes'] || 1) - 1);
    });
  }
}
