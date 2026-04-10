using InventarioCCL.API.Data;
using InventarioCCL.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioCCL.API.Controllers;

[ApiController]
[Route("productos")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductosController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>Registrar entrada o salida de productos.</summary>
    [HttpPost("movimiento")]
    public async Task<IActionResult> RegistrarMovimiento([FromBody] MovimientoRequest request)
    {
        if (request.Cantidad <= 0)
            return BadRequest(new { mensaje = "La cantidad debe ser mayor a 0." });

        var tipoNormalizado = request.Tipo?.Trim().ToLower();
        if (tipoNormalizado != "entrada" && tipoNormalizado != "salida")
            return BadRequest(new { mensaje = "El tipo debe ser 'entrada' o 'salida'." });

        var producto = await _db.Productos.FindAsync(request.ProductoId);
        if (producto == null)
            return NotFound(new { mensaje = $"Producto con ID {request.ProductoId} no encontrado." });

        if (tipoNormalizado == "entrada")
        {
            producto.Cantidad += request.Cantidad;
        }
        else // salida
        {
            if (producto.Cantidad < request.Cantidad)
                return BadRequest(new MovimientoResponse(
                    false,
                    $"Stock insuficiente. Disponible: {producto.Cantidad}, solicitado: {request.Cantidad}.",
                    producto.Cantidad
                ));

            producto.Cantidad -= request.Cantidad;
        }

        await _db.SaveChangesAsync();

        return Ok(new MovimientoResponse(
            true,
            $"{char.ToUpper(tipoNormalizado[0])}{tipoNormalizado[1..]} de {request.Cantidad} unidad(es) registrada correctamente.",
            producto.Cantidad
        ));
    }

    /// <summary>Consultar el estado actual del inventario.</summary>
    [HttpGet("inventario")]
    public async Task<IActionResult> ObtenerInventario()
    {
        var productos = await _db.Productos
            .OrderBy(p => p.Nombre)
            .Select(p => new ProductoInventarioDto(p.Id, p.Nombre, p.Cantidad))
            .ToListAsync();

        return Ok(productos);
    }
}
