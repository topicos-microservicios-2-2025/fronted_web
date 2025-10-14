import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  private baseUrl = 'http://localhost:3000/api/inscripcion';

  constructor(private http: HttpClient) {}

  getEstudianteConOferta(registro: number) {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/tasks`, {
        task: 'get_estudiante_with_maestro_oferta',
        data: {
          registro
        },
        callback: 'http://localhost:5000/callback'
      })
    );
  }

  inscribirMaterias(estudianteId: number, grupoMateriasIds: number[]) {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/tasks`, {
        task: 'create_inscripcion_materias',
        data: {
          estudianteId,
          grupoMateriasIds
        },
        callback: 'http://localhost:5000/callback'
      })
    );
  }

  getTask(shortId: number) {
    return firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/tasks/gettask/${shortId}`)
    );
  }
}
