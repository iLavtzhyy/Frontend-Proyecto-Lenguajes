import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { fadeInUp } from '../../shared/animations/fade-in-up';

@Component({
  selector: 'app-recepcion',
  standalone: true,
  imports: [CommonModule],
  animations: [fadeInUp],
  templateUrl: './agendar-cita.html',
  styleUrl: './agendar-cita.css'
})
export class RecepcionComponent implements OnInit {
  panel: Record<string, number> = {};
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.recepcion().subscribe(r => this.panel = r.data); }
}
