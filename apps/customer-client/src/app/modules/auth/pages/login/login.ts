import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { DarkModeService, LoginRequest, ParticlesBackgroundComponent } from 'customer-features';
import { ToastService } from '../../../../core/services/toast.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    ParticlesBackgroundComponent,
    CardModule,
    DividerModule,
    ImageModule,
    IconFieldModule,
    InputIconModule,
    PasswordModule,
    InputMaskModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private darkModeService = inject(DarkModeService);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  isLoading = this.authService.isLoading;
  isDarkMode = this.darkModeService.isDarkMode;

  // Reactive computed properties for particles
  backgroundColor = computed(() => (this.isDarkMode() ? '#0f0f0f' : '#ffffff'));
  particleColor = computed(() => (this.isDarkMode() ? '#ffffff' : '#2d2d2d'));
  logoSrc = computed(() =>
    this.isDarkMode() ? 'assets/images/orca-logo-white.svg' : 'assets/images/orca-logo-black.svg',
  );

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value as LoginRequest;

      this.authService.login(credentials).subscribe({
        error: (error) => {
          this.toastService.showError(
            'Error de autenticación',
            error.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.',
          );
        },
      });
    }
  }
}
