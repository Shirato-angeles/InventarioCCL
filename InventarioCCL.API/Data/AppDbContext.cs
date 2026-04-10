using InventarioCCL.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InventarioCCL.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Producto> Productos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("productos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").IsRequired().HasMaxLength(200);
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
        });
    }
}
