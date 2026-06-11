import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';
import { AutorizacionService } from '../../core/autorizacion.service';

@Component({
  selector: 'app-veterinarios',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './veterinarios.html',
  styleUrl: './veterinarios.css'
})
export class VeterinariosComponent implements OnInit {
  veterinarios: Usuario[] = [];
  editando?: Usuario;
  mensaje = '';
  constructor(private api: ApiService, public autorizacion: AutorizacionService) {}
  ngOnInit() { this.api.veterinarios().subscribe(r => this.veterinarios = r.data); }

  puedeEditar() {
    return this.autorizacion.tieneRol(['ROLE_ADMIN']);
  }

  editar(veterinario: Usuario) {
    this.editando = { ...veterinario, roles: veterinario.roles || [] };
    this.mensaje = '';
  }

  cerrar() {
    this.editando = undefined;
  }

  guardar() {
    if (!this.editando) return;
    this.api.actualizarVeterinario(this.editando.id, this.editando).subscribe(r => {
      this.mensaje = 'Veterinario actualizado.';
      this.veterinarios = this.veterinarios.map(v => v.id === r.data.id ? r.data : v);
      this.cerrar();
    });
  }
}
