using InventarioCCL.API.DTOs;
using InventarioCCL.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventarioCCL.API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    // Credenciales fijas en memoria según spec
    private static readonly Dictionary<string, string> _usuarios = new()
    {
        { "admin", "Admin123!" },
        { "ccl_user", "CCL2024#" }
    };

    private readonly IJwtService _jwtService;

    public AuthController(IJwtService jwtService)
    {
        _jwtService = jwtService;
    }

    /// <summary>Autenticación de usuario. Retorna JWT Bearer Token.</summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Usuario) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { mensaje = "Usuario y contraseña son requeridos." });

        if (!_usuarios.TryGetValue(request.Usuario, out var passwordCorrecto) ||
            passwordCorrecto != request.Password)
            return Unauthorized(new { mensaje = "Credenciales inválidas." });

        var token = _jwtService.GenerarToken(request.Usuario);

        return Ok(new LoginResponse(token, request.Usuario));
    }
}
