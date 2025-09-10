import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);

  show(severity: ToastSeverity, summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
    });
  }

  showSuccess(summary: string, detail: string) {
    this.show('success', summary, detail);
  }

  showError(summary: string, detail: string) {
    this.show('error', summary, detail);
  }

  showInfo(summary: string, detail: string) {
    this.show('info', summary, detail);
  }

  showWarn(summary: string, detail: string) {
    this.show('warn', summary, detail);
  }
}
