import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  loading = false;
  errorMsg = '';

  form = this.fb.group({
    registro: ['', [Validators.required, Validators.pattern(/^\d+$/)]],  // Solo números
    ci: ['', [Validators.required, Validators.minLength(6)]],  // Mínimo 6 caracteres
  });

  ngOnInit() {
    // Si ya está logueado, redirigir
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inscripcion']); 
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      console.log('Formulario inválido:', this.form.errors);
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const registro = this.form.value.registro!;
    const ci = this.form.value.ci!;

    console.log('Intentando login con:', { registro, ci });

    try {
      const loginSuccess = await this.authService.login(registro, ci);
      
      if (loginSuccess) {
        const currentUser = this.authService.getCurrentUser();
        console.log(`Login exitoso para: ${currentUser?.nombre} ${currentUser?.apellidoPaterno}`);
        this.router.navigate(['/inscripcion']);
      } else {
        this.errorMsg = 'Registro o CI incorrecto';
        console.log('Login fallido: credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      this.errorMsg = 'Error al conectar con el servidor. Intente nuevamente.';
    } finally {
      this.loading = false;
    }
  }
}
