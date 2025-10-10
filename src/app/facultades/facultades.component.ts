// ...existing code...
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FacultadesService } from './facultades.service';
import { Facultad } from './facultad.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-facultades',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './facultades.component.html',
  styleUrls: ['./facultades.component.css']
})
export class FacultadesComponent {
  facultades: Facultad[] = [];
  cargando = false;
  error = '';

  constructor(private facultadesService: FacultadesService, private router: Router) {
    this.obtenerFacultades();
  }

  obtenerFacultades() {
    this.cargando = true;
    this.facultadesService.getFacultades().subscribe({
      next: (data) => {
        this.facultades = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar facultades';
        this.cargando = false;
      }
    });
  }

  irANuevo() {
    this.router.navigate(['/facultades/nuevo']);
  }

  eliminarFacultad(id: number) {
    if (!confirm('¿Seguro que deseas eliminar esta facultad?')) return;
    this.facultadesService.eliminarFacultad(id).subscribe({
      next: () => this.obtenerFacultades(),
      error: () => alert('Error al eliminar facultad')
    });
  }
  irAEditar(id: number | undefined) {
    if (id === undefined) return;
    this.router.navigate(['/facultades/editar', id]);
  }
}
