import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionService } from './inscripcion.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.css']
})
export class InscripcionComponent {
  registro: number | null = null;
  estudiante: any = null;
  oferta: any[] = [];
  selectedMaterias: { [materiaId: number]: number } = {};
  error = '';
  success = '';

  isLoading = false;
  isSubmitting = false;

  constructor(private inscripcionService: InscripcionService) {}

async buscarEstudiante() {
  this.error = '';
  this.success = '';
  this.isLoading = true;
  this.estudiante = null;
  this.oferta = [];
  this.selectedMaterias = {};

  try {
    // 1. Enviar tarea de búsqueda del estudiante y obtener el shortId
    const taskResponse = await this.inscripcionService.getEstudianteConOferta(this.registro!);
    const shortId = taskResponse.shortId;

    // 2. Esperar resultado con polling
    const result = await this.pollForResult(shortId);

    // 3. Procesar resultado
    if (result && result.returnvalue?.estudiante) {
      const estudianteWrapper = result.returnvalue.estudiante;
      this.estudiante = estudianteWrapper?.estudiante;
      this.oferta = estudianteWrapper?.maestroOferta || [];

      if (!this.estudiante) {
        this.error = 'Estudiante no encontrado.';
      }
    } else {
      this.error = 'Error al obtener los datos del estudiante.';
    }

  } catch (e) {
    this.error = 'Error al buscar estudiante.';
    console.error(e);
  }

  this.isLoading = false;
}

async inscribirMaterias() {
  this.error = '';
  this.success = '';
  this.isSubmitting = true;

  const grupoMateriasIds = Object.values(this.selectedMaterias);

  if (!this.estudiante?.id) {
    this.error = 'No se encontró ID del estudiante.';
    this.isSubmitting = false;
    return;
  }

  try {
    // 1. Enviar tarea de inscripción de materias y obtener el shortId
    const taskResponse = await this.inscripcionService.inscribirMaterias(
      this.estudiante.id,
      grupoMateriasIds
    );
    const shortId = taskResponse.shortId;

    // 2. Esperar resultado con polling
    const result = await this.pollForResult(shortId);

    // 3. Procesar resultado
    if (result && result.returnvalue?.success) {
      this.success = 'Inscripción exitosa ✅';
    } else {
      this.error = 'Inscripción fallida ❌';
    }

  } catch (e) {
    this.error = 'Inscripción exitosa ✅';
    console.error(e);
  }

  this.isSubmitting = false;
}

// Función genérica de polling para ambos casos (buscar y inscribir)
private async pollForResult(shortId: number, retries = 10, delayMs = 1500): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const task = await this.inscripcionService.getTask(shortId);
      if (task.job.state === 'completed') {
        return task.job;
      } else if (task.job.state === 'failed') {
        throw new Error('La tarea falló en el servidor.');
      }
    } catch (error) {
      console.error('Error al obtener tarea:', error);
    }
    // Esperar antes de siguiente intento
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error('Tiempo de espera agotado al obtener resultado.');
}


  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  seleccionarGrupo(materiaId: number, grupoId: number) {
    this.selectedMaterias[materiaId] = grupoId;
  }

  get materiasSeleccionadasCount(): number {
    return Object.keys(this.selectedMaterias).length;
  }

  
}
