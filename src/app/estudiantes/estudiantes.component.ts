import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EstudiantesService } from './estudiantes.service';
import { Estudiante } from './estudiante.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule,NavbarComponent],
  templateUrl: './estudiantes.component.html',
  styleUrls: ['./estudiantes.component.css']
})
export class EstudiantesComponent implements OnInit {
  estudiantes: Estudiante[] = [];

  constructor(
    private estudiantesService: EstudiantesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  cargarEstudiantes() {
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data) => (this.estudiantes = data),
      error: (err) => console.error('Error al cargar estudiantes:', err)
    });
  }

  irANuevo() {
    this.router.navigate(['/estudiantes/nuevo']);
  }

 editarEstudiante(id: number | undefined) {
  if (id === undefined) return;
  this.router.navigate(['/estudiantes/editar', id]);
}

eliminarEstudiante(id: number) {
  const confirmar = confirm('¿Estás seguro de eliminar este estudiante?');

  if (confirmar) {
    this.estudiantesService.eliminarEstudiante(id).subscribe({
      next: () => {
        alert('Estudiante eliminado correctamente');
        this.cargarEstudiantes(); // Recarga la lista
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert(`Error al eliminar estudiante: ${err.message}`);
      }
    });
  }
}


}
