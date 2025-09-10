import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  imports: [ButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  icon = input<string>('tsunami');
  iconSeverity = input<'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'>('secondary');
  title = input<string>('No se encontraron elementos');
  message = input<string>('');
  showActionButton = input<boolean>(false);
  actionButtonLabel = input<string>('Crear Nuevo');
  actionButtonIcon = input<string>('pi pi-plus');
  actionButtonSeverity = input<'primary' | 'secondary' | 'success' | 'info' | 'help' | 'danger' | 'contrast'>('primary');
  context = input<'default' | 'error' | 'success' | 'info'>('default');
  loading = input<boolean>(false);
  
  actionClick = output<void>();

  onActionClick() {
    this.actionClick.emit();
  }

  isMateriIcon() {
    const icon = this.icon();
    // Check if it's a Material Icon (doesn't start with 'pi pi-' or contain class prefixes)
    return !icon.includes('pi pi-') && !icon.includes('fa-') && !icon.includes('class');
  }

  getIconClasses() {
    const icon = this.icon();
    const severityClass = `text-${this.iconSeverity()}`;
    
    if (this.isMateriIcon()) {
      // For Material Icons, use material-icons class
      return `material-icons empty-state-icon ${severityClass}`;
    } else {
      // For PrimeNG/FontAwesome icons, use the full icon string
      return `${icon} empty-state-icon ${severityClass}`;
    }
  }

  getContainerClasses() {
    let classes = 'empty-state-container';
    if (this.context() !== 'default') {
      classes += ` context-${this.context()}`;
    }
    if (this.loading()) {
      classes += ' loading';
    }
    return classes;
  }
}
