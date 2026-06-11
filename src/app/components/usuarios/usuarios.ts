import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  solicitudes: Usuario[] = [];
  busqueda = '';
  formularioAbierto = false;
  mensaje = '';
  rol = 'ROLE_VETERINARIO';
  rolesDisponibles = ['ROLE_ADMIN', 'ROLE_RECEPCIONISTA', 'ROLE_VETERINARIO', 'ROLE_CLIENTE'];
  form = this.formularioVacio();

  constructor(private api: ApiService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.api.usuarios().subscribe(r => this.usuarios = r.data);
    this.api.solicitudesPendientes().subscribe(r => this.solicitudes = r.data);
  }

  nuevo() {
    this.form = this.formularioVacio();
    this.rol = 'ROLE_VETERINARIO';
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    this.api.crearUsuario({ ...this.form, roles: [this.rol] }).subscribe(() => {
      this.mensaje = 'Usuario creado correctamente.';
      this.cargar();
      this.cerrar();
    });
  }

  aprobar(id: number) {
    this.api.aprobarUsuario(id).subscribe(() => this.cargar());
  }

  cambiarRol(usuario: Usuario, rol: string) {
    this.api.actualizarRolesUsuario(usuario.id, [rol]).subscribe(r => {
      this.usuarios = this.usuarios.map(u => u.id === r.data.id ? r.data : u);
    });
  }

  cerrar() {
    this.formularioAbierto = false;
    this.mensaje = '';
  }

  formularioVacio() {
    return {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      password: '',
      fotoUrl: '',
      especialidad: '',
      cedulaProfesional: '',
      biografia: ''
    };
  }

  rolPrincipal(usuario: Usuario) {
    return usuario.roles?.[0]?.nombre || 'Sin rol';
  }

  porRol(rol: string) {
    return this.usuarios.filter(u => u.roles?.some(r => r.nombre === rol)).length;
  }

  get filtrados() {
    const q = this.busqueda.toLowerCase();
    return this.usuarios.filter(u => `${u.nombres} ${u.apellidos} ${u.email} ${u.telefono} ${this.rolPrincipal(u)}`.toLowerCase().includes(q));
  }
}
