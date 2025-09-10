import { afterNextRender, ChangeDetectionStrategy, Component, input, effect, inject, DestroyRef } from '@angular/core';

declare const particlesJS: any;

@Component({
  standalone: true,
  selector: 'orca-particles-background',
  templateUrl: './particles-background.component.html',
  styleUrl: './particles-background.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticlesBackgroundComponent {
  private destroyRef = inject(DestroyRef);
  private particlesInitialized = false;
  private timeoutIds: number[] = [];
  private resizeListener?: () => void;

  // Configuración personalizable
  particleCount = input<number>(100);
  particleColor = input<string>('#2d2d2d');
  backgroundColor = input<string>('#ffffff');
  particleSpeed = input<number>(1.2);
  linkDistance = input<number>(150);
  linkOpacity = input<number>(0.4);

  constructor() {
    // Initialize particles on first render
    afterNextRender(() => {
      this.scheduleParticleInitialization(150);
      this.setupResizeListener();
    });

    // React to input changes
    effect(() => {
      // Listen to changes in inputs
      this.particleColor();
      this.backgroundColor();
      this.particleCount();
      this.particleSpeed();
      this.linkDistance();
      this.linkOpacity();
      
      // Reinitialize particles if they were already initialized
      if (this.particlesInitialized) {
        this.scheduleParticleInitialization(50);
      }
    });

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.clearAllTimeouts();
      this.destroyParticles();
      this.removeResizeListener();
    });
  }

  private scheduleParticleInitialization(delay: number): void {
    // Clear any existing initialization timeout to prevent overlap
    this.clearAllTimeouts();

    const timeoutId = window.setTimeout(() => {
      this.initParticles();
      this.removeTimeoutId(timeoutId);
    }, delay);

    this.timeoutIds.push(timeoutId);
  }

  private clearAllTimeouts(): void {
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  }

  private removeTimeoutId(timeoutId: number): void {
    this.timeoutIds = this.timeoutIds.filter(id => id !== timeoutId);
  }

  private setupResizeListener(): void {
    if (typeof window !== 'undefined') {
      this.resizeListener = () => {
        // Debounced resize handling - reinitialize particles after resize
        this.scheduleParticleInitialization(100);
      };
      window.addEventListener('resize', this.resizeListener);
    }
  }

  private removeResizeListener(): void {
    if (typeof window !== 'undefined' && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = undefined;
    }
  }

  private initParticles() {
    // Destroy existing particles first
    this.destroyParticles();
    
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: this.particleCount(),
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: this.particleColor(),
          },
          shape: {
            type: 'circle',
            stroke: {
              width: 0,
              color: '#000000',
            },
            polygon: {
              nb_sides: 5,
            },
          },
          opacity: {
            value: 0.5,
            random: false,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: false,
              speed: 40,
              size_min: 0.1,
              sync: false,
            },
          },
          line_linked: {
            enable: true,
            distance: this.linkDistance(),
            color: this.particleColor(),
            opacity: this.linkOpacity(),
            width: 1,
          },
          move: {
            enable: true,
            speed: this.particleSpeed(),
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200,
            },
          },
        },
        interactivity: {
          detect_on: 'window',
          events: {
            onhover: {
              enable: true,
              mode: 'grab',
            },
            onclick: {
              enable: true,
              mode: 'push',
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 200,
              line_linked: {
                opacity: 0.8,
              },
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
            push: {
              particles_nb: 4,
            },
            remove: {
              particles_nb: 2,
            },
          },
        },
        retina_detect: true,
      });
      this.particlesInitialized = true;
    } else {
      console.warn('particlesJS is not loaded yet, retrying...');
      // Retry after a longer delay if library not loaded
      this.scheduleParticleInitialization(500);
    }
  }

  private destroyParticles() {
    if (typeof window !== 'undefined' && (window as any).pJSDom && (window as any).pJSDom.length > 0) {
      try {
        (window as any).pJSDom[0].pJS.fn.vendors.destroypJS();
        (window as any).pJSDom = [];
        this.particlesInitialized = false;
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  }
}