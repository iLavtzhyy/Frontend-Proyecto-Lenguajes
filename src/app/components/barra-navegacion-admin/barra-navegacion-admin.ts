import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IconoComponent],
  templateUrl: './barra-navegacion-admin.html',
  styleUrl: './barra-navegacion-admin.css'
})
export class LayoutComponent {
  constructor(public theme: ThemeService) {}

  menuAbierto = false;
  grupos = [
    { titulo: 'Principal', items: [
      { nombre: 'Dashboard', ruta: '/dashboard', icono: 'dashboard' },
      { nombre: 'Reportes', ruta: '/reportes', icono: 'file' }
    ] },
    { titulo: 'Gestion', items: [
      { nombre: 'Clientes', ruta: '/clientes', icono: 'users' },
      { nombre: 'Mascotas', ruta: '/mascotas', icono: 'heart' },
      { nombre: 'Recepcion', ruta: '/recepcion', icono: 'calendar' },
      { nombre: 'Veterinarios', ruta: '/veterinarios', icono: 'stethoscope' }
    ] },
    { titulo: 'Clinica', items: [
      { nombre: 'Consultas', ruta: '/consultas', icono: 'stethoscope' },
      { nombre: 'Cirugias', ruta: '/cirugias', icono: 'surgery' },
      { nombre: 'Laboratorio', ruta: '/laboratorio', icono: 'lab' },
      { nombre: 'Farmacia', ruta: '/farmacia', icono: 'pill' },
      { nombre: 'Hospitalizacion', ruta: '/hospitalizacion', icono: 'shield' }
    ] },
    { titulo: 'Administracion', items: [
      { nombre: 'Facturacion', ruta: '/facturacion', icono: 'file' },
      { nombre: 'Admin', ruta: '/administracion', icono: 'shield' },
      { nombre: 'Usuarios', ruta: '/usuarios', icono: 'users' }
    ] }
  ];

  cerrarMenu() {
    this.menuAbierto = false;
  }
}
