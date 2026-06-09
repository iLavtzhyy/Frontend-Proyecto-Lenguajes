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
  templateUrl: './veterinarios.html',
  styleUrl: './veterinarios.css'
})
export class VeterinariosComponent implements OnInit {
  veterinarios: Usuario[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.veterinarios().subscribe(r => this.veterinarios = r.data); }
}
