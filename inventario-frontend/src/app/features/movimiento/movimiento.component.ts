import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { InventarioService } from '../../core/services/inventario.service';
import { Producto, MovimientoResponse } from '../../shared/models/models';

@Component({
  selector: 'app-movimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar />

      <div class="content">
        <!-- Header -->
        <div class="page-header">
          <div>
            <div class="page-path">
              <span class="path-sep">//</span>
              <span class="path-item">sistema</span>
              <span class="path-sep">/</span>
              <span class="path-item active">movimiento</span>
            </div>
            <h1 class="page-title">Registrar Movimiento</h1>
          </div>
          <a routerLink="/inventario" class="back-btn">
            <span>←</span> VER INVENTARIO
          </a>
        </div>

        <div class="layout">
          <!-- Form panel -->
          <div class="form-panel">
            <div class="panel-header">
              <span class="panel-label">DATOS DEL MOVIMIENTO</span>
              <span class="panel-tag">[FORM_001]</span>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mov-form">

              <!-- Tipo selector -->
              <div class="field-group">
                <label class="field-label"><span class="lbl-pre">[01]</span> TIPO DE MOVIMIENTO</label>
                <div class="tipo-selector">
                  <button
                    type="button"
                    class="tipo-btn entrada"
                    [class.active]="form.get('tipo')?.value === 'entrada'"
                    (click)="setTipo('entrada')"
                  >
                    <span class="tipo-icon">↓</span>
                    <span class="tipo-name">ENTRADA</span>
                    <span class="tipo-desc">Agregar stock</span>
                  </button>
                  <button
                    type="button"
                    class="tipo-btn salida"
                    [class.active]="form.get('tipo')?.value === 'salida'"
                    (click)="setTipo('salida')"
                  >
                    <span class="tipo-icon">↑</span>
                    <span class="tipo-name">SALIDA</span>
                    <span class="tipo-desc">Retirar stock</span>
                  </button>
                </div>
              </div>

              <!-- Producto selector -->
              <div class="field-group">
                <label class="field-label"><span class="lbl-pre">[02]</span> PRODUCTO</label>
                <div class="select-wrapper" [class.has-error]="showError('productoId')">
                  <span class="select-icon">▸</span>
                  <select formControlName="productoId" (change)="onProductoChange()" class="custom-select">
                    <option value="">-- seleccionar producto --</option>
                    <option *ngFor="let p of productos()" [value]="p.id">
                      #{{ p.id.toString().padStart(3,'0') }} · {{ p.nombre }} ({{ p.cantidad }} uds)
                    </option>
                  </select>
                  <span class="select-arrow">⌄</span>
                </div>
                <span class="field-error" *ngIf="showError('productoId')">
                  <span class="err-pre">ERR_</span>PRODUCTO_REQUERIDO
                </span>
              </div>

              <!-- Cantidad -->
              <div class="field-group">
                <label class="field-label"><span class="lbl-pre">[03]</span> CANTIDAD</label>
                <div class="input-wrapper" [class.focused]="focused === 'cantidad'" [class.has-error]="showError('cantidad')">
                  <span class="input-icon">▸</span>
                  <input
                    type="number"
                    formControlName="cantidad"
                    placeholder="0"
                    min="1"
                    (focus)="focused = 'cantidad'"
                    (blur)="focused = ''"
                  />
                  <span class="input-suffix">uds</span>
                </div>
                <span class="field-error" *ngIf="showError('cantidad')">
                  <span class="err-pre">ERR_</span>{{ getErrorCantidad() }}
                </span>
                <!-- Stock insuficiente warning -->
                <span class="field-warning" *ngIf="mostrarWarningStock()">
                  <span>⚠</span> Stock disponible: {{ productoSeleccionado()?.cantidad }} uds
                </span>
              </div>

              <!-- Submit -->
              <button type="submit" class="submit-btn" [class.loading]="loading()" [disabled]="loading()">
                <span class="btn-inner" *ngIf="!loading()">
                  <span class="btn-ico" [class.entrada-ico]="tipoActual === 'entrada'" [class.salida-ico]="tipoActual === 'salida'">
                    {{ tipoActual === 'entrada' ? '↓' : '↑' }}
                  </span>
                  REGISTRAR {{ tipoActual === 'entrada' ? 'ENTRADA' : 'SALIDA' }}
                </span>
                <span class="btn-inner" *ngIf="loading()">
                  <span class="spinner"></span>
                  PROCESANDO...
                </span>
              </button>

            </form>
          </div>

          <!-- Preview panel -->
          <div class="preview-panel">
            <!-- Preview card -->
            <div class="panel-header">
              <span class="panel-label">VISTA PREVIA</span>
              <span class="panel-tag">[PREVIEW]</span>
            </div>

            <div class="preview-card" [class.preview-entrada]="tipoActual === 'entrada'" [class.preview-salida]="tipoActual === 'salida'" [class.preview-empty]="!productoSeleccionado()">
              <div class="preview-empty-state" *ngIf="!productoSeleccionado()">
                <span class="empty-ico">⬡</span>
                <p>Selecciona un producto para ver la vista previa</p>
              </div>

              <div class="preview-content" *ngIf="productoSeleccionado()">
                <div class="preview-row">
                  <span class="prev-label">PRODUCTO</span>
                  <span class="prev-value">{{ productoSeleccionado()?.nombre }}</span>
                </div>
                <div class="preview-row">
                  <span class="prev-label">OPERACIÓN</span>
                  <span class="prev-value tipo-tag" [class.tag-entrada]="tipoActual === 'entrada'" [class.tag-salida]="tipoActual === 'salida'">
                    {{ tipoActual === 'entrada' ? '↓ ENTRADA' : '↑ SALIDA' }}
                  </span>
                </div>
                <div class="preview-divider"></div>
                <div class="stock-preview">
                  <div class="stock-col">
                    <span class="stock-label">STOCK ACTUAL</span>
                    <span class="stock-num current">{{ productoSeleccionado()?.cantidad }}</span>
                  </div>
                  <div class="stock-arrow" [class.arrow-down]="tipoActual === 'salida'">→</div>
                  <div class="stock-col">
                    <span class="stock-label">STOCK FINAL</span>
                    <span class="stock-num" [class.final-ok]="stockFinal() >= 0" [class.final-bad]="stockFinal() < 0">
                      {{ stockFinal() < 0 ? 'INSUF.' : stockFinal() }}
                    </span>
                  </div>
                </div>
                <div class="delta-row" *ngIf="form.get('cantidad')?.value > 0">
                  <span class="delta-label">VARIACIÓN</span>
                  <span class="delta-value" [class.delta-pos]="tipoActual === 'entrada'" [class.delta-neg]="tipoActual === 'salida'">
                    {{ tipoActual === 'entrada' ? '+' : '-' }}{{ form.get('cantidad')?.value }} uds
                  </span>
                </div>
              </div>
            </div>

            <!-- Historial de operaciones en sesión -->
            <div class="history-panel" *ngIf="historial().length > 0">
              <div class="panel-header" style="margin-top: 20px;">
                <span class="panel-label">HISTORIAL SESIÓN</span>
                <span class="panel-tag">[{{ historial().length }}]</span>
              </div>
              <div class="history-list">
                <div class="history-item" *ngFor="let h of historial(); let i = index" [style.animationDelay]="i * 30 + 'ms'">
                  <span class="hist-badge" [class.hb-entrada]="h.tipo === 'entrada'" [class.hb-salida]="h.tipo === 'salida'">
                    {{ h.tipo === 'entrada' ? '↓' : '↑' }}
                  </span>
                  <span class="hist-name">{{ h.nombre }}</span>
                  <span class="hist-qty" [class.hq-entrada]="h.tipo === 'entrada'" [class.hq-salida]="h.tipo === 'salida'">
                    {{ h.tipo === 'entrada' ? '+' : '-' }}{{ h.cantidad }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Toast notification -->
        <div class="toast" [class.show]="toast().visible" [class.toast-ok]="toast().tipo === 'ok'" [class.toast-err]="toast().tipo === 'error'">
          <span class="toast-icon">{{ toast().tipo === 'ok' ? '✓' : '⊗' }}</span>
          <span class="toast-msg">{{ toast().mensaje }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: var(--bg-void); }
    .content { padding: 32px; max-width: 1100px; margin: 0 auto; position: relative; }

    .page-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 32px;
      animation: fadeInUp 0.4s ease both;
    }
    .page-path {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: var(--text-muted); letter-spacing: 0.1em; margin-bottom: 6px;
    }
    .path-sep { color: var(--border-bright); }
    .path-item.active { color: var(--neon); }
    .page-title {
      font-family: var(--font-display);
      font-size: 28px; font-weight: 800; color: var(--text-primary);
    }
    .back-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 11px; letter-spacing: 0.1em; font-weight: 700;
      text-decoration: none;
      transition: all var(--transition);
    }
    .back-btn:hover { border-color: var(--neon); color: var(--neon); }

    /* Layout */
    .layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 20px;
      align-items: start;
    }

    /* Panels */
    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 20px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-bottom: none;
      border-radius: var(--radius) var(--radius) 0 0;
    }
    .panel-label {
      font-size: 9px; letter-spacing: 0.2em; color: var(--text-muted); font-weight: 700;
    }
    .panel-tag { font-size: 9px; color: var(--neon); letter-spacing: 0.1em; }

    .form-panel {
      animation: fadeInUp 0.4s 0.05s ease both;
    }
    .mov-form {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      padding: 28px;
    }

    .field-group { margin-bottom: 24px; }
    .field-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 10px; letter-spacing: 0.18em; color: var(--text-secondary);
      margin-bottom: 10px;
    }
    .lbl-pre { color: var(--neon); }

    /* Tipo selector */
    .tipo-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .tipo-btn {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 4px; padding: 18px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      cursor: pointer; transition: all var(--transition);
    }
    .tipo-btn:hover { border-color: var(--border-bright); background: var(--bg-hover); }
    .tipo-btn.active.entrada {
      border-color: var(--neon);
      background: var(--neon-glow);
      box-shadow: 0 0 20px var(--neon-glow);
    }
    .tipo-btn.active.salida {
      border-color: var(--accent-red);
      background: var(--accent-red-dim);
      box-shadow: 0 0 20px rgba(255,59,92,0.08);
    }
    .tipo-icon {
      font-size: 24px;
      color: var(--text-muted);
      transition: all var(--transition);
      line-height: 1;
    }
    .tipo-btn.active.entrada .tipo-icon { color: var(--neon); }
    .tipo-btn.active.salida .tipo-icon { color: var(--accent-red); }
    .tipo-name {
      font-size: 12px; font-weight: 700; letter-spacing: 0.15em;
      color: var(--text-secondary); transition: color var(--transition);
    }
    .tipo-btn.active.entrada .tipo-name { color: var(--neon); }
    .tipo-btn.active.salida .tipo-name { color: var(--accent-red); }
    .tipo-desc { font-size: 10px; color: var(--text-muted); }

    /* Select */
    .select-wrapper {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0 14px;
      transition: all var(--transition);
    }
    .select-wrapper:focus-within { border-color: var(--neon); box-shadow: 0 0 0 2px var(--neon-glow); }
    .select-wrapper.has-error { border-color: var(--accent-red); }
    .select-icon { color: var(--neon); font-size: 12px; }
    .custom-select {
      flex: 1; background: transparent; border: none; outline: none;
      color: var(--text-primary);
      font-family: var(--font-mono); font-size: 12px;
      padding: 13px 0; cursor: pointer;
      appearance: none;
    }
    .custom-select option { background: var(--bg-card); color: var(--text-primary); }
    .select-arrow { color: var(--text-muted); font-size: 16px; pointer-events: none; }

    /* Input */
    .input-wrapper {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0 14px;
      transition: all var(--transition);
    }
    .input-wrapper.focused { border-color: var(--neon); box-shadow: 0 0 0 2px var(--neon-glow); }
    .input-wrapper.has-error { border-color: var(--accent-red); }
    .input-icon { color: var(--neon); font-size: 12px; }
    input[type=number] {
      flex: 1; background: transparent; border: none; outline: none;
      color: var(--text-primary); font-family: var(--font-mono);
      font-size: 20px; font-weight: 700; padding: 12px 0;
      caret-color: var(--neon);
    }
    input[type=number]::placeholder { color: var(--text-muted); font-size: 14px; font-weight: 400; }
    input[type=number]::-webkit-inner-spin-button { display: none; }
    .input-suffix { font-size: 11px; color: var(--text-muted); letter-spacing: 0.1em; }

    .field-error {
      display: block; margin-top: 6px; font-size: 10px; color: var(--accent-red); letter-spacing: 0.1em;
    }
    .err-pre { font-weight: 700; opacity: 0.7; }
    .field-warning {
      display: flex; align-items: center; gap: 6px;
      margin-top: 6px; font-size: 11px; color: var(--accent-amber);
    }

    /* Submit */
    .submit-btn {
      width: 100%; padding: 16px;
      border: none; border-radius: var(--radius);
      font-family: var(--font-mono); font-size: 13px;
      font-weight: 700; letter-spacing: 0.15em;
      cursor: pointer; transition: all var(--transition);
      background: var(--neon); color: var(--bg-void);
      position: relative; overflow: hidden;
    }
    .submit-btn::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 24px var(--neon-dim);
    }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-inner { display: flex; align-items: center; justify-content: center; gap: 10px; }
    .entrada-ico { color: var(--bg-void); font-size: 18px; }
    .salida-ico { color: var(--bg-void); font-size: 18px; }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(0,0,0,0.3);
      border-top-color: var(--bg-void);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Preview panel */
    .preview-panel { animation: fadeInUp 0.4s 0.1s ease both; }
    .preview-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      padding: 24px;
      min-height: 220px;
      display: flex; align-items: center; justify-content: center;
      transition: border-color var(--transition), box-shadow var(--transition);
    }
    .preview-card.preview-entrada { border-color: var(--neon-dim); box-shadow: 0 0 30px var(--neon-glow); }
    .preview-card.preview-salida { border-color: rgba(255,59,92,0.2); box-shadow: 0 0 30px rgba(255,59,92,0.05); }

    .preview-empty-state { text-align: center; color: var(--text-muted); }
    .empty-ico { display: block; font-size: 36px; margin-bottom: 10px; opacity: 0.3; }
    .preview-empty-state p { font-size: 12px; line-height: 1.6; }

    .preview-content { width: 100%; }
    .preview-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid var(--border);
    }
    .prev-label { font-size: 9px; letter-spacing: 0.18em; color: var(--text-muted); }
    .prev-value { font-size: 12px; font-weight: 700; color: var(--text-primary); text-align: right; max-width: 60%; }

    .tipo-tag {
      padding: 3px 10px; border-radius: 3px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    }
    .tag-entrada { background: var(--neon-glow); color: var(--neon); border: 1px solid var(--neon-dim); }
    .tag-salida { background: var(--accent-red-dim); color: var(--accent-red); border: 1px solid rgba(255,59,92,0.3); }

    .preview-divider { height: 1px; background: var(--border); margin: 16px 0; }

    .stock-preview {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; padding: 12px 0;
    }
    .stock-col { flex: 1; text-align: center; }
    .stock-label { display: block; font-size: 9px; letter-spacing: 0.15em; color: var(--text-muted); margin-bottom: 8px; }
    .stock-num {
      font-family: var(--font-display); font-size: 32px; font-weight: 800;
      color: var(--text-secondary);
    }
    .stock-num.current { color: var(--text-primary); }
    .stock-num.final-ok { color: var(--neon); }
    .stock-num.final-bad { color: var(--accent-red); font-size: 18px; }

    .stock-arrow {
      font-size: 20px; color: var(--neon);
      transition: transform var(--transition);
    }
    .stock-arrow.arrow-down { color: var(--accent-red); transform: rotate(180deg); }

    .delta-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 12px;
      background: var(--bg-elevated);
      border-radius: var(--radius);
      margin-top: 8px;
    }
    .delta-label { font-size: 9px; letter-spacing: 0.15em; color: var(--text-muted); }
    .delta-value { font-size: 14px; font-weight: 700; }
    .delta-pos { color: var(--neon); }
    .delta-neg { color: var(--accent-red); }

    /* History */
    .history-list {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      overflow: hidden;
    }
    .history-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      animation: fadeInUp 0.3s ease both;
    }
    .history-item:last-child { border-bottom: none; }
    .hist-badge {
      width: 22px; height: 22px;
      border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; flex-shrink: 0;
    }
    .hb-entrada { background: var(--neon-glow); color: var(--neon); border: 1px solid var(--neon-dim); }
    .hb-salida { background: var(--accent-red-dim); color: var(--accent-red); border: 1px solid rgba(255,59,92,0.3); }
    .hist-name { flex: 1; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hist-qty { font-weight: 700; white-space: nowrap; }
    .hq-entrada { color: var(--neon); }
    .hq-salida { color: var(--accent-red); }

    /* Toast */
    .toast {
      position: fixed; bottom: 32px; right: 32px;
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      font-size: 13px;
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      z-index: 1000;
      max-width: 380px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    .toast.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
    .toast.toast-ok { border-color: var(--neon-dim); box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px var(--neon-glow); }
    .toast.toast-err { border-color: rgba(255,59,92,0.4); }
    .toast-icon { font-size: 16px; flex-shrink: 0; }
    .toast.toast-ok .toast-icon { color: var(--neon); }
    .toast.toast-err .toast-icon { color: var(--accent-red); }
    .toast-msg { color: var(--text-primary); line-height: 1.4; }
  `]
})
export class MovimientoComponent implements OnInit {
  form;
  focused = '';
  loading = signal(false);
  productos = signal<Producto[]>([]);
  productoSeleccionado = signal<Producto | null>(null);
  tipoActual: 'entrada' | 'salida' = 'entrada';
  historial = signal<{ tipo: string; nombre: string; cantidad: number }[]>([]);
  toast = signal<{ visible: boolean; tipo: 'ok' | 'error'; mensaje: string }>({
    visible: false, tipo: 'ok', mensaje: ''
  });

  stockFinal = computed(() => {
    const p = this.productoSeleccionado();
    const qty = Number(this.form?.get('cantidad')?.value) || 0;
    if (!p) return 0;
    return this.tipoActual === 'entrada' ? p.cantidad + qty : p.cantidad - qty;
  });

  constructor(private fb: FormBuilder, private inventarioSvc: InventarioService) {
    this.form = this.fb.group({
      productoId: ['', Validators.required],
      tipo: ['entrada', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.inventarioSvc.getInventario().subscribe({
      next: (data) => this.productos.set(data)
    });
  }

  setTipo(tipo: 'entrada' | 'salida') {
    this.tipoActual = tipo;
    this.form.get('tipo')?.setValue(tipo);
  }

  onProductoChange() {
    const id = Number(this.form.get('productoId')?.value);
    const p = this.productos().find(x => x.id === id) ?? null;
    this.productoSeleccionado.set(p);
  }

  mostrarWarningStock(): boolean {
    const p = this.productoSeleccionado();
    const qty = Number(this.form.get('cantidad')?.value) || 0;
    return this.tipoActual === 'salida' && !!p && qty > p.cantidad;
  }

  showError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  getErrorCantidad(): string {
    const ctrl = this.form.get('cantidad');
    if (ctrl?.errors?.['required']) return 'CANTIDAD_REQUERIDA';
    if (ctrl?.errors?.['min']) return 'DEBE_SER_MAYOR_A_CERO';
    return 'INVALIDO';
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const { productoId, tipo, cantidad } = this.form.value;
    this.inventarioSvc.registrarMovimiento({
      productoId: Number(productoId),
      tipo: tipo as 'entrada' | 'salida',
      cantidad: Number(cantidad)
    }).subscribe({
      next: (res: MovimientoResponse) => {
        this.loading.set(false);
        const p = this.productoSeleccionado();
        if (p) {
          this.historial.update(h => [{
            tipo, nombre: p.nombre, cantidad: Number(cantidad)
          }, ...h].slice(0, 8));
          // Update local stock
          this.productos.update(list => list.map(x =>
            x.id === p.id ? { ...x, cantidad: res.stockActual } : x
          ));
          this.productoSeleccionado.set({ ...p, cantidad: res.stockActual });
        }
        this.mostrarToast('ok', res.mensaje);
        this.form.get('cantidad')?.reset();
        this.form.get('productoId')?.reset();
        this.productoSeleccionado.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.mensaje ?? `Error ${err.status}`;
        this.mostrarToast('error', msg);
      }
    });
  }

  private mostrarToast(tipo: 'ok' | 'error', mensaje: string) {
    this.toast.set({ visible: true, tipo, mensaje });
    setTimeout(() => this.toast.update(t => ({ ...t, visible: false })), 4000);
  }
}
