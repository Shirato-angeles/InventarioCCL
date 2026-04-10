import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { InventarioService } from '../../core/services/inventario.service';
import { Producto } from '../../shared/models/models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar />

      <div class="content">
        <!-- Page header -->
        <div class="page-header">
          <div class="header-left">
            <div class="page-path">
              <span class="path-sep">//</span>
              <span class="path-item">sistema</span>
              <span class="path-sep">/</span>
              <span class="path-item active">inventario</span>
            </div>
            <h1 class="page-title">Estado del Inventario</h1>
          </div>
          <div class="header-right">
            <button class="refresh-btn" (click)="cargar()" [class.spinning]="loading()">
              <span class="refresh-icon">↻</span>
              ACTUALIZAR
            </button>
            <a routerLink="/movimiento" class="primary-btn">
              <span>+</span> NUEVO MOVIMIENTO
            </a>
          </div>
        </div>

        <!-- Stats row -->
        <div class="stats-row" *ngIf="!loading() && productos().length > 0">
          <div class="stat-card" style="animation-delay: 0ms">
            <span class="stat-label">TOTAL PRODUCTOS</span>
            <span class="stat-value">{{ productos().length }}</span>
            <span class="stat-icon">⬡</span>
          </div>
          <div class="stat-card" style="animation-delay: 60ms">
            <span class="stat-label">UNIDADES TOTALES</span>
            <span class="stat-value">{{ totalUnidades() }}</span>
            <span class="stat-icon">◈</span>
          </div>
          <div class="stat-card warning" style="animation-delay: 120ms">
            <span class="stat-label">STOCK BAJO (≤10)</span>
            <span class="stat-value">{{ stockBajo() }}</span>
            <span class="stat-icon">⚠</span>
          </div>
          <div class="stat-card success" style="animation-delay: 180ms">
            <span class="stat-label">STOCK ALTO (≥50)</span>
            <span class="stat-value">{{ stockAlto() }}</span>
            <span class="stat-icon">✓</span>
          </div>
        </div>

        <!-- Search + filter -->
        <div class="toolbar" *ngIf="productos().length > 0">
          <div class="search-box">
            <span class="search-icon">⌕</span>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="buscar producto..."
              class="search-input"
            />
            <span class="search-count">{{ productosFiltrados().length }}/{{ productos().length }}</span>
          </div>
          <div class="filter-group">
            <button class="filter-btn" [class.active]="filtro === 'todos'" (click)="filtro = 'todos'">TODOS</button>
            <button class="filter-btn warning" [class.active]="filtro === 'bajo'" (click)="filtro = 'bajo'">BAJO</button>
            <button class="filter-btn success" [class.active]="filtro === 'alto'" (click)="filtro = 'alto'">ALTO</button>
          </div>
        </div>

        <!-- Loading state -->
        <div class="loading-state" *ngIf="loading()">
          <div class="loading-grid">
            <div class="loading-row" *ngFor="let i of [1,2,3,4,5]"></div>
          </div>
        </div>

        <!-- Error state -->
        <div class="error-state" *ngIf="error() && !loading()">
          <span class="error-icon">⊗</span>
          <p>{{ error() }}</p>
          <button (click)="cargar()" class="retry-btn">REINTENTAR</button>
        </div>

        <!-- Table -->
        <div class="table-container" *ngIf="!loading() && !error()">
          <table class="data-table" *ngIf="productosFiltrados().length > 0">
            <thead>
              <tr>
                <th class="col-id">ID</th>
                <th class="col-name">PRODUCTO</th>
                <th class="col-qty">CANTIDAD</th>
                <th class="col-bar">NIVEL DE STOCK</th>
                <th class="col-status">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let p of productosFiltrados(); let i = index; trackBy: trackById"
                class="data-row"
                [style.animationDelay]="i * 40 + 'ms'"
                [class.row-low]="p.cantidad <= 10"
                [class.row-zero]="p.cantidad === 0"
              >
                <td class="col-id">
                  <span class="id-badge">#{{ p.id.toString().padStart(3, '0') }}</span>
                </td>
                <td class="col-name">
                  <span class="product-name">{{ p.nombre }}</span>
                </td>
                <td class="col-qty">
                  <span class="qty-value" [class.qty-zero]="p.cantidad === 0" [class.qty-low]="p.cantidad > 0 && p.cantidad <= 10">
                    {{ p.cantidad }}
                  </span>
                  <span class="qty-label">uds</span>
                </td>
                <td class="col-bar">
                  <div class="stock-bar">
                    <div
                      class="stock-fill"
                      [style.width.%]="getBarWidth(p.cantidad)"
                      [class.fill-low]="p.cantidad <= 10"
                      [class.fill-ok]="p.cantidad > 10 && p.cantidad < 50"
                      [class.fill-high]="p.cantidad >= 50"
                    ></div>
                    <span class="bar-value">{{ getBarWidth(p.cantidad) | number:'1.0-0' }}%</span>
                  </div>
                </td>
                <td class="col-status">
                  <span class="status-badge" [class]="getStatusClass(p.cantidad)">
                    {{ getStatusLabel(p.cantidad) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty filtered -->
          <div class="empty-state" *ngIf="productosFiltrados().length === 0 && productos().length > 0">
            <span class="empty-icon">⬡</span>
            <p>Sin resultados para "{{ searchTerm }}"</p>
          </div>

          <!-- Empty total -->
          <div class="empty-state" *ngIf="productos().length === 0">
            <span class="empty-icon">⬡</span>
            <p>No hay productos registrados</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: var(--bg-void); }

    .content { padding: 32px; max-width: 1200px; margin: 0 auto; }

    /* Header */
    .page-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 28px;
      animation: fadeInUp 0.4s ease both;
    }
    .page-path {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: var(--text-muted);
      letter-spacing: 0.1em; margin-bottom: 6px;
    }
    .path-sep { color: var(--border-bright); }
    .path-item.active { color: var(--neon); }
    .page-title {
      font-family: var(--font-display);
      font-size: 28px; font-weight: 800;
      color: var(--text-primary);
      letter-spacing: 0.02em;
    }

    .header-right { display: flex; gap: 10px; align-items: center; }

    .refresh-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 11px; letter-spacing: 0.1em; font-weight: 700;
      cursor: pointer;
      transition: all var(--transition);
    }
    .refresh-btn:hover { border-color: var(--neon); color: var(--neon); }
    .refresh-icon { font-size: 16px; display: inline-block; transition: transform 0.5s; }
    .refresh-btn.spinning .refresh-icon { animation: spin 0.7s linear infinite; }

    .primary-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px;
      background: var(--neon);
      border: none; border-radius: var(--radius);
      color: var(--bg-void);
      font-family: var(--font-mono);
      font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
      text-decoration: none;
      cursor: pointer;
      transition: all var(--transition);
    }
    .primary-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px var(--neon-dim);
    }

    /* Stats */
    .stats-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 12px; margin-bottom: 20px;
    }
    .stat-card {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px 20px 16px;
      overflow: hidden;
      animation: fadeInUp 0.4s ease both;
      transition: border-color var(--transition);
    }
    .stat-card:hover { border-color: var(--border-bright); }
    .stat-card::before {
      content: ''; position: absolute;
      top: 0; left: 0; right: 0; height: 2px;
      background: var(--neon);
    }
    .stat-card.warning::before { background: var(--accent-amber); }
    .stat-card.success::before { background: #00ff87; }

    .stat-label {
      display: block; font-size: 9px; letter-spacing: 0.2em;
      color: var(--text-muted); margin-bottom: 8px;
    }
    .stat-value {
      display: block;
      font-family: var(--font-display);
      font-size: 36px; font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      animation: countUp 0.4s ease both;
    }
    .stat-icon {
      position: absolute; right: 16px; top: 50%;
      transform: translateY(-50%);
      font-size: 28px; opacity: 0.06; color: var(--text-primary);
    }
    .stat-card.warning .stat-value { color: var(--accent-amber); }
    .stat-card.success .stat-value { color: var(--neon); }

    /* Toolbar */
    .toolbar {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 16px;
      animation: fadeInUp 0.4s 0.1s ease both;
    }
    .search-box {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0 14px;
      flex: 1; max-width: 380px;
      transition: border-color var(--transition);
    }
    .search-box:focus-within { border-color: var(--neon); }
    .search-icon { color: var(--text-secondary); font-size: 16px; }
    .search-input {
      flex: 1; background: transparent; border: none; outline: none;
      color: var(--text-primary); font-family: var(--font-mono);
      font-size: 12px; padding: 11px 0;
      caret-color: var(--neon);
    }
    .search-input::placeholder { color: var(--text-muted); }
    .search-count { font-size: 10px; color: var(--text-muted); white-space: nowrap; }

    .filter-group { display: flex; gap: 4px; }
    .filter-btn {
      padding: 8px 12px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px; letter-spacing: 0.1em;
      cursor: pointer; transition: all var(--transition);
    }
    .filter-btn.active, .filter-btn:hover { border-color: var(--neon); color: var(--neon); background: var(--neon-glow); }
    .filter-btn.warning.active { border-color: var(--accent-amber); color: var(--accent-amber); background: rgba(255,184,59,0.08); }
    .filter-btn.success.active { border-color: var(--neon); color: var(--neon); }

    /* Loading skeleton */
    .loading-grid { display: flex; flex-direction: column; gap: 2px; }
    .loading-row {
      height: 52px;
      background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 50%, var(--bg-card) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius);
    }
    .loading-row:nth-child(1) { animation-delay: 0ms; }
    .loading-row:nth-child(2) { animation-delay: 80ms; }
    .loading-row:nth-child(3) { animation-delay: 160ms; }
    .loading-row:nth-child(4) { animation-delay: 240ms; }
    .loading-row:nth-child(5) { animation-delay: 320ms; }
    @keyframes shimmer {
      to { background-position: -200% 0; }
    }

    /* Error */
    .error-state {
      text-align: center; padding: 60px 20px;
      color: var(--accent-red);
    }
    .error-icon { font-size: 48px; display: block; margin-bottom: 12px; opacity: 0.5; }
    .error-state p { font-size: 13px; margin-bottom: 16px; }
    .retry-btn {
      padding: 10px 20px;
      background: var(--accent-red-dim);
      border: 1px solid var(--accent-red);
      border-radius: var(--radius);
      color: var(--accent-red);
      font-family: var(--font-mono); font-size: 11px;
      cursor: pointer; transition: all var(--transition);
    }

    /* Table */
    .table-container {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      animation: fadeInUp 0.4s 0.15s ease both;
    }

    .data-table { width: 100%; border-collapse: collapse; }

    thead tr {
      background: var(--bg-elevated);
      border-bottom: 1px solid var(--border);
    }
    th {
      padding: 12px 20px;
      font-size: 9px; letter-spacing: 0.2em;
      color: var(--text-muted); text-align: left;
      font-weight: 700;
    }

    .data-row {
      border-bottom: 1px solid var(--border);
      animation: fadeInUp 0.3s ease both;
      transition: background var(--transition);
    }
    .data-row:last-child { border-bottom: none; }
    .data-row:hover { background: var(--bg-hover); }
    .data-row.row-low { border-left: 2px solid var(--accent-amber); }
    .data-row.row-zero { border-left: 2px solid var(--accent-red); }

    td { padding: 14px 20px; }

    .col-id { width: 80px; }
    .id-badge {
      font-size: 11px; color: var(--text-muted);
      background: var(--bg-elevated);
      padding: 3px 8px; border-radius: 3px;
    }

    .product-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }

    .col-qty { width: 120px; }
    .qty-value {
      font-family: var(--font-display);
      font-size: 18px; font-weight: 800;
      color: var(--neon);
    }
    .qty-value.qty-low { color: var(--accent-amber); }
    .qty-value.qty-zero { color: var(--accent-red); }
    .qty-label { font-size: 10px; color: var(--text-muted); margin-left: 4px; }

    .col-bar { width: 200px; }
    .stock-bar {
      display: flex; align-items: center; gap: 10px;
      height: 6px; background: var(--bg-elevated);
      border-radius: 3px; position: relative; flex: 1;
    }
    .stock-fill {
      height: 100%; border-radius: 3px;
      background: var(--neon);
      transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
      min-width: 2px;
    }
    .stock-fill.fill-low { background: var(--accent-red); }
    .stock-fill.fill-ok { background: var(--accent-amber); }
    .stock-fill.fill-high { background: var(--neon); }
    .bar-value { font-size: 10px; color: var(--text-muted); white-space: nowrap; }

    .col-status { width: 120px; }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 3px;
      font-size: 9px; letter-spacing: 0.15em; font-weight: 700;
    }
    .badge-ok { background: var(--neon-glow); color: var(--neon); border: 1px solid var(--neon-dim); }
    .badge-low { background: rgba(255,184,59,0.08); color: var(--accent-amber); border: 1px solid rgba(255,184,59,0.3); }
    .badge-zero { background: var(--accent-red-dim); color: var(--accent-red); border: 1px solid rgba(255,59,92,0.3); }

    .empty-state {
      text-align: center; padding: 80px 20px;
      color: var(--text-muted);
    }
    .empty-icon { display: block; font-size: 40px; margin-bottom: 12px; opacity: 0.3; }
    .empty-state p { font-size: 13px; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class InventarioComponent implements OnInit {
  productos = signal<Producto[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = '';
  filtro: 'todos' | 'bajo' | 'alto' = 'todos';

  totalUnidades = computed(() => this.productos().reduce((s, p) => s + p.cantidad, 0));
  stockBajo = computed(() => this.productos().filter(p => p.cantidad <= 10).length);
  stockAlto = computed(() => this.productos().filter(p => p.cantidad >= 50).length);

  productosFiltrados = computed(() => {
    let list = this.productos();
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(p => p.nombre.toLowerCase().includes(q));
    }
    if (this.filtro === 'bajo') list = list.filter(p => p.cantidad <= 10);
    if (this.filtro === 'alto') list = list.filter(p => p.cantidad >= 50);
    return list;
  });

  constructor(private inventarioSvc: InventarioService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.error.set('');
    this.inventarioSvc.getInventario().subscribe({
      next: (data) => { this.productos.set(data); this.loading.set(false); },
      error: (err) => {
        this.error.set(`Error al cargar inventario (${err.status})`);
        this.loading.set(false);
      }
    });
  }

  trackById(_: number, p: Producto) { return p.id; }

  getBarWidth(cantidad: number): number {
    const max = Math.max(...this.productos().map(p => p.cantidad), 1);
    return Math.min((cantidad / max) * 100, 100);
  }

  getStatusClass(cantidad: number): string {
    if (cantidad === 0) return 'status-badge badge-zero';
    if (cantidad <= 10) return 'status-badge badge-low';
    return 'status-badge badge-ok';
  }

  getStatusLabel(cantidad: number): string {
    if (cantidad === 0) return 'SIN STOCK';
    if (cantidad <= 10) return 'STOCK BAJO';
    return 'DISPONIBLE';
  }
}
