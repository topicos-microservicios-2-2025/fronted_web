import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EstudiantesService } from '../estudiantes.service';
import { Estudiante } from '../estudiante.model';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-estudiante-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './estudiantes-form.component.html',
  styleUrls: ['./estudiantes-form.component.css']
})
export class EstudianteFormComponent implements OnInit {
  estudiante: Estudiante = {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    ci: '',
    fechaNacimiento: '',
    nacionalidad: ''
  };

  esEdicion = false;
  estudianteId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private estudiantesService: EstudiantesService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.estudianteId = +idParam;

      this.estudiantesService.getEstudiantePorId(this.estudianteId).subscribe({
        next: (res) => {
          this.estudiante = res;
        },
        error: (err) => {
          console.error('Error al obtener estudiante:', err);
          alert('No se pudo cargar el estudiante');
        }
      });
    }
  }

  guardar() {
    // Formatea la fecha
    this.estudiante.fechaNacimiento = new Date(this.estudiante.fechaNacimiento).toISOString();

    if (this.esEdicion && this.estudianteId) {
      this.estudiantesService.actualizarEstudiante(this.estudianteId, this.estudiante).subscribe({
        next: () => {
          alert('Estudiante actualizado correctamente');
          this.router.navigate(['/estudiantes']);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert(`Error al actualizar estudiante: ${err.message}`);
        }
      });
    } else {
      this.estudiantesService.crearEstudiante(this.estudiante).subscribe({
        next: () => {
          alert('Estudiante guardado correctamente');
          this.router.navigate(['/estudiantes']);
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert(`Error al guardar estudiante: ${err.message}`);
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/estudiantes']);
  }
}
