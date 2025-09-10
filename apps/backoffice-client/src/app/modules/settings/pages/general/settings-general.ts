import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-settings-general',
  template: `
    <div class="page-container">
      <h1>System Settings</h1>
      <p>
        Esta página está en construcción. Aquí podrás configurar todos los aspectos del sistema.
      </p>

      <div class="placeholder-content">
        <div class="placeholder-section">
          <h2>Próximas funcionalidades:</h2>
          <ul>
            <li>Configuración general del sistema</li>
            <li>Configuración de notificaciones</li>
            <li>Gestión de permisos globales</li>
            <li>Configuración de integración APIs</li>
            <li>Configuración de backup y seguridad</li>
            <li>Configuración de temas y personalización</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .placeholder-content {
        background: var(--surface-card);
        border: 2px dashed var(--surface-border);
        border-radius: 8px;
        padding: 2rem;
        margin: 2rem 0;
        text-align: center;
      }

      .placeholder-section {
        max-width: 600px;
        margin: 0 auto;
      }

      .placeholder-section h2 {
        color: var(--primary-color);
        margin-bottom: 1rem;
      }

      .placeholder-section ul {
        text-align: left;
        color: var(--text-color-secondary);
      }

      .placeholder-section li {
        margin: 0.5rem 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsGeneral {}
