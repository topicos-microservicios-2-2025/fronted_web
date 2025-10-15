import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { API_CONFIG } from '../config/api.config';

export interface Estudiante {
  id: number;
  registro: number;  // Cambio a number según la respuesta del API
  ci: string;
  nombre: string;
  apellidoPaterno: string;  // Cambio según la estructura real
  apellidoMaterno: string;  // Cambio según la estructura real
  fechaNacimiento: string;
  nacionalidad: string;
  // Campos opcionales que pueden venir en la respuesta
  correo?: string;
  telefono?: string;
  createdAt?: string;
  updatedAt?: string;
  Detalle_carrera_cursadas?: any[];
  Boleta_Inscripcions?: any[];
}

export interface TaskResponse {
  message: string;
  shortId: number;
  queue: string;
  estado: string;
}

export interface TaskResult {
  id?: string;
  state?: string;
  queue?: string;
  shortId: number;
  data?: any; // Añadimos esta propiedad para manejar datos directos
  returnvalue?: {
    success: boolean;
    estudiantes: Estudiante[];
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
  failedReason?: any;
  job?: any; // Añadimos esta propiedad para manejar la estructura {shortId, job}
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<Estudiante | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar si hay un usuario logueado al inicializar el servicio
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    // Solo ejecutar en el navegador, no en el servidor
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('currentUser');
        }
      }
    }
  }

  private async waitForTaskResult(shortId: number, maxRetries: number = 15): Promise<TaskResult | null> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Consultando resultado de tarea ${shortId}, intento ${i + 1}/${maxRetries}`);
        
        const result = await firstValueFrom(
          this.http.get<any>(`${API_CONFIG.BASE_URL}/tasks/gettask/${shortId}`)
        );
        
        console.log('Resultado completo de la tarea:', result);
        console.log('Estructura del job:', result?.job);
        console.log('Todas las propiedades del resultado:', Object.keys(result || {}));
        
        // Verificar diferentes posibles estructuras de respuesta
        const estado = result?.state || result?.job?.state || result?.status || 'desconocido';
        console.log('Estado detectado:', estado);
        
        // Si hay datos disponibles, independientemente del estado, intentemos usarlos
        if (result?.job?.data || result?.data || result?.result) {
          const data = result?.job?.data || result?.data || result?.result;
          console.log('✅ Datos encontrados en la tarea:', data);
          
          // Verificar si los datos contienen estudiantes
          if (data.estudiantes || (Array.isArray(data) && data.length > 0)) {
            console.log('✅ Estudiantes encontrados en los datos');
            
            // Crear un resultado con la estructura esperada
            const taskResult: TaskResult = {
              shortId: result.shortId,
              state: 'completed',
              data: data,
              queue: result?.queue || result?.job?.queue,
              failedReason: null
            };
            
            return taskResult;
          }
        }
        
        // Si no tenemos datos pero hay returnvalue
        if (result?.job?.returnvalue || result?.returnvalue) {
          const returnvalue = result?.job?.returnvalue || result?.returnvalue;
          console.log('✅ ReturnValue encontrado:', returnvalue);
          
          if (returnvalue.estudiantes) {
            console.log('✅ Estudiantes encontrados en returnvalue');
            
            const taskResult: TaskResult = {
              shortId: result.shortId,
              state: 'completed',
              returnvalue: returnvalue,
              queue: result?.queue || result?.job?.queue,
              failedReason: null
            };
            
            return taskResult;
          }
        }
        
        if (estado === 'completed') {
          console.log('✅ Tarea marcada como completada:', result);
          return result as TaskResult;
        } else if (estado === 'failed') {
          console.error('❌ Tarea falló:', result?.failedReason || result?.job?.failedReason);
          return null;
        } else {
          console.log(`⏳ Tarea en estado: ${estado}, esperando...`);
          // Si ya llevamos varios intentos y no hay estado definido, 
          // pero sí hay datos, intentemos procesarlos directamente
          if (i >= 3 && (result?.job || result?.data)) {
            console.log('🔄 Intentando procesar datos disponibles después de varios intentos...');
            // Continuar el bucle para buscar datos
          }
          // Esperar 2 segundos antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.error(`Error consultando tarea ${shortId}:`, error);
        
        // Si es un error 500, puede que el endpoint no exista o tenga problemas
        if (error.status === 500) {
          console.error('❌ Error 500 del servidor. El endpoint puede no estar disponible.');
          // Esperar más tiempo en caso de error del servidor
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else if (error.status === 404) {
          console.error('❌ Error 404: El endpoint no existe o la tarea no se encontró.');
          return null;
        } else {
          // Para otros errores, esperar un poco antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    console.error(`❌ Timeout: La tarea ${shortId} no se completó después de ${maxRetries} intentos`);
    return null;
  }

  async getEstudiantes(): Promise<Estudiante[]> {
    const payload = {
      task: 'get_estudiante',
      data: {},
      callback: API_CONFIG.CALLBACK_URL
    };

    try {
      console.log('Enviando payload:', payload);
      console.log('URL:', `${API_CONFIG.BASE_URL}/tasks`);
      
      // Paso 1: Enviar la tarea
      const taskResponse = await firstValueFrom(
        this.http.post<TaskResponse>(`${API_CONFIG.BASE_URL}/tasks`, payload)
      );
      
      console.log('Respuesta inicial de la tarea:', taskResponse);
      
      if (!taskResponse.shortId) {
        console.error('No se recibió shortId de la tarea');
        return [];
      }
      
      // Paso 2: Esperar y obtener el resultado
      const taskResult = await this.waitForTaskResult(taskResponse.shortId);
      
      if (!taskResult) {
        console.error('No se pudo obtener el resultado de la tarea');
        return [];
      }
      
      // Intentar extraer estudiantes de diferentes ubicaciones posibles
      let estudiantes: Estudiante[] = [];
      
      if (taskResult.returnvalue?.estudiantes) {
        estudiantes = taskResult.returnvalue.estudiantes;
      } else if (taskResult.data?.estudiantes) {
        estudiantes = taskResult.data.estudiantes;
      } else if (taskResult.data && Array.isArray(taskResult.data)) {
        estudiantes = taskResult.data;
      } else if (taskResult.job?.data?.estudiantes) {
        estudiantes = taskResult.job.data.estudiantes;
      } else if (taskResult.job?.returnvalue?.estudiantes) {
        estudiantes = taskResult.job.returnvalue.estudiantes;
      } else {
        console.warn('Estructura de datos no reconocida:', taskResult);
        estudiantes = [];
      }
      
      console.log('Estudiantes obtenidos:', estudiantes);
      console.log('Cantidad de estudiantes:', estudiantes.length);
      
      return estudiantes;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  }

  async login(registro: string, ci: string): Promise<boolean> {
    try {
      console.log('=== INICIO LOGIN ===');
      console.log('Datos de entrada - Registro:', registro, '(tipo:', typeof registro, ')');
      console.log('Datos de entrada - CI:', ci, '(tipo:', typeof ci, ')');
      
      const estudiantes = await this.getEstudiantes();
      console.log('Total estudiantes obtenidos:', estudiantes.length);
      
      // Mostrar todos los estudiantes disponibles
      estudiantes.forEach((est, index) => {
        console.log(`Estudiante ${index + 1}:`, {
          id: est.id,
          registro: est.registro,
          tipoRegistro: typeof est.registro,
          ci: est.ci,
          tipoCi: typeof est.ci,
          nombre: est.nombre,
          apellidoPaterno: est.apellidoPaterno
        });
      });
      
      console.log('Buscando estudiante con registro:', registro, 'y CI:', ci);
      
      // Normalizar los datos de entrada
      const registroNormalizado = registro.toString().trim();
      const ciNormalizado = ci.toString().trim();
      
      console.log('Datos normalizados - Registro:', `"${registroNormalizado}"`, 'CI:', `"${ciNormalizado}"`);
      console.log('Longitud registro:', registroNormalizado.length, 'Longitud CI:', ciNormalizado.length);
      console.log('Caracteres registro:', Array.from(registroNormalizado).map(c => c.charCodeAt(0)));
      console.log('Caracteres CI:', Array.from(ciNormalizado).map(c => c.charCodeAt(0)));
      
      const estudiante = estudiantes.find(e => {
        const registroString = e.registro.toString().trim();
        const ciString = e.ci.toString().trim();
        const registroMatch = registroString === registroNormalizado;
        const ciMatch = ciString === ciNormalizado;
        
        console.log(`Comparando estudiante ${e.nombre}:`);
        console.log(`  - Registro estudiante: "${registroString}" (longitud: ${registroString.length})`);
        console.log(`  - Registro buscado: "${registroNormalizado}" (longitud: ${registroNormalizado.length})`);
        console.log(`  - Caracteres registro estudiante:`, Array.from(registroString).map(c => c.charCodeAt(0)));
        console.log(`  - Caracteres registro buscado:`, Array.from(registroNormalizado).map(c => c.charCodeAt(0)));
        console.log(`  - Registro match: ${registroMatch}`);
        console.log(`  - CI estudiante: "${ciString}" vs CI buscado: "${ciNormalizado}"`);
        console.log(`  - CI match: ${ciMatch}`);
        console.log(`  - Match general: ${registroMatch && ciMatch}`);
        
        return registroMatch && ciMatch;
      });

      if (estudiante) {
        console.log('✅ Estudiante encontrado:', estudiante);
        // Guardar información del usuario solo en el navegador
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(estudiante));
        }
        this.currentUserSubject.next(estudiante);
        this.isAuthenticatedSubject.next(true);
        return true;
      } else {
        console.log('❌ Estudiante NO encontrado');
        return false;
      }
    } catch (error) {
      console.error('💥 Error en el login:', error);
      throw error;
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): Estudiante | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}