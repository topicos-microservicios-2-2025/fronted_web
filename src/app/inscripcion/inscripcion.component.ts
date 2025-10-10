import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FAKE_JSON } from './fake-json'; // Asegúrate de importar bien la ruta
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavbarComponent],
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.css']
})
export class InscripcionComponent implements OnInit {
  estudianteId: number = 1;
  materias: any[] = [];
  grupoMateriasIds: number[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Consumir datos del fake-json
    const response = FAKE_JSON;
    if (response.success && response.result.success) {
      this.estudianteId = response.result.estudiante.estudiante.id;
      // Listar todos los grupos de todas las materias ofertadas
      this.materias = response.result.estudiante.maestroOferta.flatMap((materia: any) =>
        materia.Grupo_Materia.map((grupo: any) => ({
          id: grupo.id,
          nombre: materia.nombre,
          sigla: grupo.sigla,
          docente: grupo.Docente ? grupo.Docente.nombre + ' ' + grupo.Docente.apellidoPaterno : '',
          cupo: grupo.cupo
        }))
      );
    }
  }

  toggleMateria(id: number): void {
    const idx = this.grupoMateriasIds.indexOf(id);
    if (idx === -1) {
      this.grupoMateriasIds.push(id);
    } else {
      this.grupoMateriasIds.splice(idx, 1);
    }
  }

  inscribir(): void {
    const payload = {
      task: 'create_inscripcion_materias',
      data: {
        estudianteId: this.estudianteId,
        grupoMateriasIds: this.grupoMateriasIds
      },
      callback: 'http://localhost:5000/callback'
    };
    this.http.post('http://localhost:3000/api/inscripcion/tasks', payload).subscribe({
      next: (response) => {
        alert('Inscripción realizada con éxito.');
        console.log('Respuesta del servidor:', response);
      },
      error: (error) => {
        alert('Error al realizar la inscripción.');
        console.error('Error en la inscripción:', error);
      }
    });
  }
}
