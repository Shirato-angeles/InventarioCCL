export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: string;
}

export interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface MovimientoRequest {
  productoId: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
}

export interface MovimientoResponse {
  exito: boolean;
  mensaje: string;
  stockActual: number;
}
