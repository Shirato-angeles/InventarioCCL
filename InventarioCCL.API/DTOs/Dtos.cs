namespace InventarioCCL.API.DTOs;

public record LoginRequest(string Usuario, string Password);

public record LoginResponse(string Token, string Usuario);

public record MovimientoRequest(int ProductoId, string Tipo, int Cantidad);
// Tipo: "entrada" | "salida"

public record MovimientoResponse(bool Exito, string Mensaje, int StockActual);

public record ProductoInventarioDto(int Id, string Nombre, int Cantidad);
