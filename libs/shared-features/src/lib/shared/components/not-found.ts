import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DarkModeService } from '../utils/dark-mode.service';
import { ParticlesBackgroundComponent } from './particles-background/particles-background.component';

@Component({
  selector: 'app-not-found',
  imports: [ParticlesBackgroundComponent],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {
  private router = inject(Router);
  private location = inject(Location);
  private darkModeService = inject(DarkModeService);
  
  // Dark mode reactive properties
  isDarkMode = this.darkModeService.isDarkMode;
  
  // Computed properties for particle theming
  backgroundColor = computed(() => 
    this.isDarkMode() ? '#0f0f0f' : '#ffffff'
  );
  
  particleColor = computed(() => 
    this.isDarkMode() ? '#ffffff' : '#2d2d2d'
  );

  goBack(): void {
    // Try to go back in history, fallback to home if no history
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.goHome();
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
