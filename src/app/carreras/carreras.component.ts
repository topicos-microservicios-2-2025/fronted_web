import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarrerasService } from './carreras.service';
import { Carrera } from './carrera.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './carreras.component.html',
  styleUrls: ['./carreras.component.css']
})
export class CarrerasComponent {
  carreras: Carrera[] = [];
  cargando = false;
  error = '';

  constructor(private carrerasService: CarrerasService, private router: Router) {
    this.obtenerCarreras();
  }

  obtenerCarreras() {
    this.cargando = true;
    this.carrerasService.getCarreras().subscribe({
      next: (data) => {
        this.carreras = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar carreras';
        this.cargando = false;
      }
    });
  }

  irANuevo() {
    this.router.navigate(['/carreras/nuevo']);
  }

  irAEditar(id: number | undefined) {
    if (id === undefined) return;
    this.router.navigate(['/carreras/editar', id]);
  }

  eliminarCarrera(id: number) {
    if (!confirm('¿Seguro que deseas eliminar esta carrera?')) return;
    this.carrerasService.eliminarCarrera(id).subscribe({
      next: () => this.obtenerCarreras(),
      error: () => alert('Error al eliminar carrera')
    });
  }
}
