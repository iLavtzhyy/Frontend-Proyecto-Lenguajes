import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Usuario } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';

@Component({
  selector: 'app-veterinarios',
  standalone: true,
  imports: [CommonModule],
  animations: [fadeInUp],
  template: `
    <section class="page-shell" @fadeInUp>
      <div class="page-header">
        <div>
          <p class="page-eyebrow">Equipo medico</p>
          <h1 class="page-title">Veterinarios y especialistas</h1>
          <p class="page-subtitle">Informacion profesional, especialidad, biografia y contacto del equipo clinico.</p>
        </div>
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article class="panel overflow-hidden" *ngFor="let vet of veterinarios">
          <div class="relative h-64">
            <img class="h-full w-full object-cover" [src]="vet.fotoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700'" [alt]="vet.nombres">
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5 text-white">
              <p class="text-xs font-black uppercase text-cyan-100">{{ vet.especialidad }}</p>
              <h2 class="mt-1 text-2xl font-black">{{ vet.nombres }} {{ vet.apellidos }}</h2>
            </div>
          </div>
          <div class="p-5">
            <p class="text-sm text-slate-500 dark:text-slate-400">Cedula profesional: <b class="text-slate-800 dark:text-slate-200">{{ vet.cedulaProfesional }}</b></p>
            <p class="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ vet.biografia }}</p>
            <div class="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              {{ vet.email }} - {{ vet.telefono }}
            </div>
          </div>
        </article>
      </div>
    </section>
  `
})
export class VeterinariosComponent implements OnInit {
  veterinarios: Usuario[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.veterinarios().subscribe(r => this.veterinarios = r.data); }
}
