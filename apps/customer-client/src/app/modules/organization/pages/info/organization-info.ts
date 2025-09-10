import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-organization-info',
  template: `
    <div class="p-6">
      <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
          Información de la Organización
        </h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre de la Organización
              </label>
              <div class="text-zinc-900 dark:text-white">ACME Corporation</div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo de Organización
              </label>
              <div class="text-zinc-900 dark:text-white">Empresa Privada</div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                RUT/NIT
              </label>
              <div class="text-zinc-900 dark:text-white">12.345.678-9</div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Dirección
              </label>
              <div class="text-zinc-900 dark:text-white">
                Av. Principal 123, Ciudad, País
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Teléfono
              </label>
              <div class="text-zinc-900 dark:text-white">+56 2 1234 5678</div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email
              </label>
              <div class="text-zinc-900 dark:text-white">contacto@acme.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationInfoComponent {}