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
  sinCuposInfo: any[] = [];

  isLoading = false;
  isSubmitting = false;

  // Estados del modal
  showInscripcionModal = false;
  inscripcionEstado: 'iniciando' | 'enviando' | 'waiting' | 'procesando' | 'exitoso' | 'error' | 'sin-cupos' = 'iniciando';
  inscripcionMensaje = '';
  inscripcionProgreso = 0;
  inscripcionCompleta = false;

  constructor(private inscripcionService: InscripcionService) {}

async buscarEstudiante() {
  this.error = '';
  this.success = '';
  this.sinCuposInfo = [];
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
  this.sinCuposInfo = [];

  const grupoMateriasIds = Object.values(this.selectedMaterias);

  if (!this.estudiante?.id) {
    this.error = 'No se encontró ID del estudiante.';
    return;
  }

  // Mostrar modal y inicializar estados
  this.showInscripcionModal = true;
  this.inscripcionEstado = 'iniciando';
  this.inscripcionMensaje = 'Iniciando proceso de inscripción...';
  this.inscripcionProgreso = 10;
  this.inscripcionCompleta = false;

  try {
    // 1. Enviar tarea de inscripción de materias y obtener el shortId
    this.inscripcionEstado = 'enviando';
    this.inscripcionMensaje = 'Enviando solicitud de inscripción...';
    this.inscripcionProgreso = 25;

    const taskResponse = await this.inscripcionService.inscribirMaterias(
      this.estudiante.id,
      grupoMateriasIds
    );
    const shortId = taskResponse.shortId;

    // 2. Esperar resultado con polling mejorado
    this.inscripcionEstado = 'procesando';
    this.inscripcionMensaje = 'Procesando inscripción en el servidor...';
    this.inscripcionProgreso = 50;

    const result = await this.pollForResultWithProgress(shortId);

    // 3. Procesar resultado final
    this.inscripcionProgreso = 90;
    await this.delay(500); // Pequeña pausa para mejor UX

    if (result && result.returnvalue) {
      const responseData = result.returnvalue;
      
      console.log('Respuesta completa del servidor:', responseData);
      
      // Verificar si hay respuesta anidada (success.result)
      let actualResult = responseData;
      
      // Si hay una estructura anidada success.result, navegar hasta el resultado real
      if (responseData.success && responseData.result) {
        actualResult = responseData.result;
        console.log('Resultado anidado encontrado:', actualResult);
        
        // Si hay otra capa de anidamiento
        if (actualResult.success && actualResult.result) {
          actualResult = actualResult.result;
          console.log('Resultado doblemente anidado encontrado:', actualResult);
        }
      }
      
      console.log('Resultado final a evaluar:', actualResult);
      
      // Evaluar el resultado final
      if (actualResult.success === true) {
        this.inscripcionEstado = 'exitoso';
        this.inscripcionMensaje = '¡Inscripción completada exitosamente! ✅';
        this.inscripcionProgreso = 100;
        this.success = 'Inscripción exitosa ✅';
      } else {
        // Verificar si es error por falta de cupos
        if (actualResult.grupoSinCupo && actualResult.grupoSinCupo.length > 0) {
          this.sinCuposInfo = actualResult.grupoSinCupo;
          this.inscripcionEstado = 'sin-cupos';
          this.inscripcionMensaje = actualResult.message || 'No se puede inscribir por falta de cupos';
          this.error = actualResult.message || 'No se puede inscribir por falta de cupos';
        } else {
          this.inscripcionEstado = 'error';
          this.inscripcionMensaje = actualResult.message || 'Error en la inscripción';
          this.error = actualResult.message || 'Inscripción fallida ❌';
        }
        this.inscripcionProgreso = 100;
      }
    } else {
      this.inscripcionEstado = 'error';
      this.inscripcionMensaje = 'Error en la respuesta del servidor';
      this.inscripcionProgreso = 100;
      this.error = 'Inscripción fallida ❌';
    }

  } catch (e) {
    this.inscripcionEstado = 'error';
    this.inscripcionMensaje = 'Error de conexión o tiempo agotado';
    this.inscripcionProgreso = 100;
    this.error = 'Error al inscribir materias.';
    console.error(e);
  }

  this.inscripcionCompleta = true;
}

// Función genérica de polling para buscar estudiante
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

// Función de polling con progreso visual para inscripción
private async pollForResultWithProgress(shortId: number, retries = 20, delayMs = 1000): Promise<any> {
  const progressIncrement = 40 / retries; // 40% del progreso disponible para polling
  
  for (let i = 0; i < retries; i++) {
    try {
      const task = await this.inscripcionService.getTask(shortId);
      
      // Actualizar progreso
      this.inscripcionProgreso = Math.min(50 + (i * progressIncrement), 85);
      
      // Manejar diferentes estados de la tarea
      if (task.job.state === 'completed') {
        return task.job;
      } else if (task.job.state === 'failed') {
        throw new Error('La tarea falló en el servidor.');
      } else if (task.job.state === 'waiting') {
        this.inscripcionEstado = 'waiting';
        this.inscripcionMensaje = 'Esperando en cola del servidor...';
      } else if (task.job.state === 'active') {
        this.inscripcionEstado = 'procesando';
        this.inscripcionMensaje = 'Validando inscripción y verificando cupos...';
      }
      
      // Actualizar mensaje según el progreso si seguimos procesando
      if (i > retries / 2 && this.inscripcionEstado === 'procesando') {
        this.inscripcionMensaje = 'Finalizando proceso de inscripción...';
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

  // Verificar si una materia tiene grupos con cupos disponibles
  tieneGruposConCupo(materia: any): boolean {
    return materia.Grupo_Materia?.some((grupo: any) => grupo.cupo > 0) || false;
  }

  // Obtener grupos disponibles (con cupo) para una materia
  getGruposDisponibles(materia: any): any[] {
    return materia.Grupo_Materia?.filter((grupo: any) => grupo.cupo > 0) || [];
  }

  // Obtener grupos con cupo para mostrar el contador
  getGruposConCupo(materia: any): any[] {
    return materia.Grupo_Materia?.filter((grupo: any) => grupo.cupo > 0) || [];
  }

  // Métodos para manejar el modal
  cerrarModal() {
    this.showInscripcionModal = false;
    this.inscripcionCompleta = false;
  }

  cerrarModalSiCompleto() {
    if (this.inscripcionCompleta) {
      this.cerrarModal();
    }
  }
}
