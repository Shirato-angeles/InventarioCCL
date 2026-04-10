import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <div class="nav-logo">C</div>
        <div>
          <span class="nav-title">CCL SYSTEMS</span>
          <span class="nav-version">v2.4.0</span>
        </div>
      </div>

      <div class="nav-links">
        <a routerLink="/inventario" routerLinkActive="active" class="nav-link">
          <span class="link-icon">⬡</span>
          <span>INVENTARIO</span>
        </a>
        <a routerLink="/movimiento" routerLinkActive="active" class="nav-link">
          <span class="link-icon">⇅</span>
          <span>MOVIMIENTO</span>
        </a>
      </div>

      <div class="nav-right">
        <div class="user-badge">
          <span class="user-icon">◈</span>
          <span class="user-name">{{ auth.currentUser() }}</span>
        </div>
        <button class="logout-btn" (click)="auth.logout()">
          <span>⏻</span> SALIR
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 0 32px;
      height: 64px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-brand {
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .nav-logo {
      width: 36px; height: 36px;
      background: var(--neon);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 18px;
      color: var(--bg-void);
    }
    .nav-title {
      display: block;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: var(--text-primary);
    }
    .nav-version {
      display: block;
      font-size: 9px;
      color: var(--text-muted);
      letter-spacing: 0.1em;
    }

    .nav-links {
      display: flex;
      gap: 4px;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius);
      border: 1px solid transparent;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 11px;
      letter-spacing: 0.15em;
      font-weight: 700;
      transition: all var(--transition);
    }
    .nav-link:hover {
      color: var(--text-primary);
      background: var(--bg-elevated);
      border-color: var(--border);
    }
    .nav-link.active {
      color: var(--neon);
      background: var(--neon-glow);
      border-color: var(--neon-dim);
    }
    .link-icon { font-size: 14px; }

    .nav-right {
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .user-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 11px;
      color: var(--text-secondary);
    }
    .user-icon { color: var(--neon); font-size: 12px; }
    .user-name { color: var(--text-primary); font-weight: 700; letter-spacing: 0.05em; }

    .logout-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.15em;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition);
    }
    .logout-btn:hover {
      border-color: var(--accent-red);
      color: var(--accent-red);
      background: var(--accent-red-dim);
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
