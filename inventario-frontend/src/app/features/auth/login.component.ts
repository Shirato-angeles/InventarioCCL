import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-shell">
      <!-- Background grid -->
      <div class="grid-bg"></div>
      <!-- Scanline -->
      <div class="scanline"></div>

      <!-- Floating particles -->
      <div class="particle" *ngFor="let p of particles" [style.left.%]="p.x" [style.top.%]="p.y" [style.animationDelay]="p.delay" [style.animationDuration]="p.duration"></div>

      <div class="login-container">
        <!-- Header -->
        <div class="brand">
          <div class="brand-icon">
            <span class="icon-inner">C</span>
            <div class="icon-ring"></div>
          </div>
          <div class="brand-text">
            <span class="brand-name">CCL SYSTEMS</span>
            <span class="brand-sub">INVENTORY MANAGEMENT v2.4</span>
          </div>
        </div>

        <!-- Status bar -->
        <div class="status-bar">
          <span class="status-dot" [class.active]="!loading()"></span>
          <span class="status-text">{{ loading() ? 'AUTHENTICATING...' : 'SYSTEM READY' }}</span>
          <span class="status-time">{{ currentTime }}</span>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form" autocomplete="off">
          <div class="field-group">
            <label class="field-label">
              <span class="label-prefix">[01]</span> USUARIO
            </label>
            <div class="field-wrapper" [class.focused]="focused === 'usuario'" [class.has-error]="showError('usuario')">
              <span class="field-icon">▸</span>
              <input
                type="text"
                formControlName="usuario"
                placeholder="ingrese usuario..."
                (focus)="focused = 'usuario'"
                (blur)="focused = ''"
                autocomplete="username"
              />
              <span class="field-status" *ngIf="form.get('usuario')?.valid && form.get('usuario')?.dirty">✓</span>
            </div>
            <span class="field-error" *ngIf="showError('usuario')">
              <span class="err-prefix">ERR_</span>{{ getError('usuario') }}
            </span>
          </div>

          <div class="field-group">
            <label class="field-label">
              <span class="label-prefix">[02]</span> CONTRASEÑA
            </label>
            <div class="field-wrapper" [class.focused]="focused === 'password'" [class.has-error]="showError('password')">
              <span class="field-icon">▸</span>
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="ingrese contraseña..."
                (focus)="focused = 'password'"
                (blur)="focused = ''"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                {{ showPassword ? '◉' : '◎' }}
              </button>
            </div>
            <span class="field-error" *ngIf="showError('password')">
              <span class="err-prefix">ERR_</span>{{ getError('password') }}
            </span>
          </div>

          <!-- Server error -->
          <div class="server-error" *ngIf="serverError()">
            <span class="err-badge">!</span>
            {{ serverError() }}
          </div>

          <button type="submit" class="submit-btn" [class.loading]="loading()" [disabled]="loading()">
            <span class="btn-content" *ngIf="!loading()">
              <span class="btn-icon">⬢</span>
              INICIAR SESIÓN
              <span class="btn-arrow">→</span>
            </span>
            <span class="btn-loading" *ngIf="loading()">
              <span class="loader"></span>
              VERIFICANDO CREDENCIALES
            </span>
          </button>

          <div class="credentials-hint">
            <span class="hint-title">// credenciales de demo</span>
            <div class="hint-row"><span class="hint-key">admin</span><span class="hint-sep">/</span><span class="hint-val">admin</span></div>
            <div class="hint-row"><span class="hint-key">ccl_user</span><span class="hint-sep">/</span><span class="hint-val">Admin123!</span></div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-void);
      position: relative;
      overflow: hidden;
    }

    .grid-bg {
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    .scanline {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--neon), transparent);
      animation: scanline 8s linear infinite;
      opacity: 0.4;
      pointer-events: none;
      z-index: 0;
    }

    .particle {
      position: fixed;
      width: 2px;
      height: 2px;
      background: var(--neon);
      border-radius: 50%;
      opacity: 0;
      animation: particleFade var(--dur, 4s) var(--del, 0s) infinite;
      pointer-events: none;
    }
    @keyframes particleFade {
      0% { opacity: 0; transform: translateY(0); }
      20% { opacity: 0.6; }
      100% { opacity: 0; transform: translateY(-60px); }
    }

    .login-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 460px;
      padding: 0 20px;
      animation: fadeInUp 0.6s cubic-bezier(0.4,0,0.2,1) both;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }
    .brand-icon {
      position: relative;
      width: 52px; height: 52px;
      display: flex; align-items: center; justify-content: center;
    }
    .icon-inner {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 800;
      color: var(--neon);
      z-index: 1;
      position: relative;
    }
    .icon-ring {
      position: absolute;
      inset: 0;
      border: 2px solid var(--neon);
      border-radius: 8px;
      animation: pulse-neon 3s ease-in-out infinite;
    }
    .brand-name {
      display: block;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: 0.15em;
    }
    .brand-sub {
      display: block;
      font-size: 10px;
      color: var(--text-secondary);
      letter-spacing: 0.2em;
      margin-top: 2px;
    }

    /* Status bar */
    .status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-bottom: none;
      border-radius: var(--radius) var(--radius) 0 0;
      font-size: 10px;
      color: var(--text-secondary);
      letter-spacing: 0.12em;
    }
    .status-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
      flex-shrink: 0;
    }
    .status-dot.active {
      background: var(--neon);
      box-shadow: 0 0 6px var(--neon);
      animation: blink 2s ease-in-out infinite;
    }
    .status-time {
      margin-left: auto;
      font-variant-numeric: tabular-nums;
    }
    .status-text { color: var(--neon); }

    /* Form card */
    .login-form {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      padding: 32px;
    }

    .field-group {
      margin-bottom: 24px;
    }
    .field-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .label-prefix {
      color: var(--neon);
    }

    .field-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0 14px;
      transition: border-color var(--transition), box-shadow var(--transition);
    }
    .field-wrapper.focused {
      border-color: var(--neon);
      box-shadow: 0 0 0 2px var(--neon-glow), inset 0 0 20px rgba(0,255,135,0.02);
    }
    .field-wrapper.has-error {
      border-color: var(--accent-red);
      box-shadow: 0 0 0 2px var(--accent-red-dim);
    }
    .field-icon {
      color: var(--neon);
      font-size: 12px;
      flex-shrink: 0;
      transition: transform var(--transition);
    }
    .field-wrapper.focused .field-icon {
      transform: translateX(3px);
    }

    input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 13px;
      padding: 14px 0;
      caret-color: var(--neon);
    }
    input::placeholder { color: var(--text-muted); }

    .field-status {
      color: var(--neon);
      font-size: 13px;
    }
    .toggle-pw {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
      transition: color var(--transition);
      line-height: 1;
    }
    .toggle-pw:hover { color: var(--neon); }

    .field-error {
      display: block;
      margin-top: 6px;
      font-size: 10px;
      color: var(--accent-red);
      letter-spacing: 0.1em;
    }
    .err-prefix { font-weight: 700; opacity: 0.7; }

    .server-error {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: var(--accent-red-dim);
      border: 1px solid var(--accent-red);
      border-radius: var(--radius);
      color: var(--accent-red);
      font-size: 12px;
      margin-bottom: 20px;
      animation: fadeInUp 0.3s ease both;
    }
    .err-badge {
      width: 18px; height: 18px;
      background: var(--accent-red);
      color: var(--bg-void);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* Button */
    .submit-btn {
      width: 100%;
      padding: 16px;
      background: var(--neon);
      border: none;
      border-radius: var(--radius);
      color: var(--bg-void);
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.15em;
      cursor: pointer;
      transition: all var(--transition);
      position: relative;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .submit-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px var(--neon-dim), 0 8px 40px var(--neon-glow);
    }
    .submit-btn:active:not(:disabled) { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

    .btn-content, .btn-loading {
      display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .btn-icon { font-size: 16px; }
    .btn-arrow { margin-left: auto; }

    .loader {
      width: 14px; height: 14px;
      border: 2px solid rgba(0,0,0,0.3);
      border-top-color: var(--bg-void);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Hint */
    .credentials-hint {
      border-top: 1px solid var(--border);
      padding-top: 16px;
    }
    .hint-title {
      display: block;
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }
    .hint-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .hint-key { color: var(--accent-blue); }
    .hint-sep { color: var(--text-muted); }
    .hint-val { color: var(--text-secondary); }
  `]
})
export class LoginComponent {
  form;
  focused = '';
  showPassword = false;
  loading = signal(false);
  serverError = signal('');
  currentTime = new Date().toLocaleTimeString('es-CO', { hour12: false });

  particles = Array.from({ length: 20 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 4}s`
  }));

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('es-CO', { hour12: false });
    }, 1000);
  }

  showError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (ctrl?.errors?.['required']) return 'CAMPO_REQUERIDO';
    if (ctrl?.errors?.['minlength']) return 'LONGITUD_INSUFICIENTE';
    return 'INVALIDO';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.serverError.set('');
    const { usuario, password } = this.form.value;

    this.auth.login({ usuario: usuario!, password: password! }).subscribe({
      next: () => this.router.navigate(['/inventario']),
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.serverError.set('CREDENCIALES_INVALIDAS — verifique usuario y contraseña');
        } else {
          this.serverError.set(`CONNECTION_ERROR — ${err.status || 'sin respuesta del servidor'}`);
        }
      }
    });
  }
}
