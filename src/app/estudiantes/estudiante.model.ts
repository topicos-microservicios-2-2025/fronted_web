export interface Estudiante {
  id?: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  ci: string;
  fechaNacimiento: string;
  nacionalidad?: string;
}
