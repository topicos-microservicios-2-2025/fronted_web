import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './login/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'fronted-topicos';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Verificar si hay un usuario logueado al iniciar la aplicación
    this.authService.checkAutomaticLogin();
  }
}
