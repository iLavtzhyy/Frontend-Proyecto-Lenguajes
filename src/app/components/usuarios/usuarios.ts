import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
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
  esNuevo = true;
  form = this.formularioVacio();
  menuAbiertoId: number | null = null;

  @HostListener('document:click')
  cerrarMenus() {
    this.menuAbiertoId = null;
  }

  toggleMenu(id: number | null) {
    this.menuAbiertoId = this.menuAbiertoId === id ? null : id;
  }

  constructor(private api: ApiService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.api.usuarios().subscribe(r => this.usuarios = r.data);
    this.api.solicitudesPendientes().subscribe(r => this.solicitudes = r.data);
  }

  nuevo() {
    this.esNuevo = true;
    this.form = this.formularioVacio();
    this.rol = 'ROLE_VETERINARIO';
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  editar(usuario: Usuario) {
    this.esNuevo = false;
    this.rol = this.rolPrincipal(usuario);
    this.form = {
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono || '',
      password: '',
      fotoUrl: usuario.fotoUrl || '',
      especialidad: usuario.especialidad || '',
      cedulaProfesional: usuario.cedulaProfesional || '',
      biografia: usuario.biografia || '',
      activo: usuario.activo ?? true
    } as any;
    this.formularioAbierto = true;
    this.mensaje = '';
  }

  guardar() {
    const payload = { ...this.form, roles: [this.rol] };
    if (this.esNuevo) {
      this.api.crearUsuario(payload).subscribe({
        next: () => {
          this.mensaje = 'Usuario creado correctamente.';
          this.cargar();
          this.cerrar();
        },
        error: (err) => {
          alert(err.error?.mensaje || 'Error al crear el usuario.');
        }
      });
    } else {
      this.api.actualizarUsuario((this.form as any).id, payload).subscribe({
        next: () => {
          this.mensaje = 'Usuario actualizado correctamente.';
          this.cargar();
          this.cerrar();
        },
        error: (err) => {
          alert(err.error?.mensaje || 'Error al actualizar el usuario.');
        }
      });
    }
  }

  aprobar(id: number) {
    this.api.aprobarUsuario(id).subscribe(() => this.cargar());
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.api.eliminarUsuario(id).subscribe({
        next: () => {
          this.cargar();
        },
        error: (err) => {
          alert(err.error?.mensaje || 'Error al eliminar el usuario. Puede tener registros asociados (como mascotas, cirugías, o facturas).');
        }
      });
    }
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
      biografia: '',
      activo: true
    };
  }

  rolSeleccionado = 'TODOS';

  rolPrincipal(usuario: Usuario) {
    return usuario.roles?.[0]?.nombre || 'Sin rol';
  }

  porRol(rol: string) {
    return this.usuarios.filter(u => u.roles?.some(r => r.nombre === rol)).length;
  }

  get filtrados() {
    const q = this.busqueda.toLowerCase();
    let res = this.usuarios;
    if (this.rolSeleccionado !== 'TODOS') {
      res = res.filter(u => u.roles?.some(r => r.nombre === this.rolSeleccionado));
    }
    return res.filter(u => `${u.nombres} ${u.apellidos} ${u.email} ${u.telefono} ${this.rolPrincipal(u)}`.toLowerCase().includes(q));
  }
}
