import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto, MovimientoRequest, MovimientoResponse } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly API = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getInventario() {
    return this.http.get<Producto[]>(`${this.API}/productos/inventario`);
  }

  registrarMovimiento(req: MovimientoRequest) {
    return this.http.post<MovimientoResponse>(`${this.API}/productos/movimiento`, req);
  }
}
