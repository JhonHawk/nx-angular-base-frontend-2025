import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { DarkModeService } from '../../../utils/dark-mode.service';

@Component({
  standalone: true,
  selector: 'app-unauthenticated-layout',
  imports: [RouterOutlet, NgClass],
  templateUrl: './unauthenticated-layout.html',
  styleUrl: './unauthenticated-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthenticatedLayout {
  private darkModeService = inject(DarkModeService);

  // Computed properties for reactive theme support
  isDarkMode = this.darkModeService.isDarkMode;
  
  // CSS classes computed from dark mode state
  layoutClasses = computed(() => ({
    'unauthenticated-layout': true,
    'unauthenticated-layout--dark': this.isDarkMode()
  }));
}
