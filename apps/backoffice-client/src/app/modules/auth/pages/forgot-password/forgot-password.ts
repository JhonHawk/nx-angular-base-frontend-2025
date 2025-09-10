import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {}
