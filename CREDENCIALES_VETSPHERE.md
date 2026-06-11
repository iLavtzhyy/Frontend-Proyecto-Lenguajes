# Credenciales VetSphere

Usuarios listos para probar el sistema en la exposicion.

> Todas estas cuentas pertenecen a los datos iniciales del backend. La contrasena esta guardada en la base de datos con BCrypt.

| Rol | Nombre | Correo | Contrasena | Uso recomendado |
|---|---|---|---|---|
| Administrador | Valeria Mendoza | `admin1@vetsphere.com` | `Vet2026!` | Dashboard, usuarios, reportes, facturacion, administracion |
| Veterinario | Lucia Carrion | `lucia.carrion@vetsphere.com` | `Vet2026!` | Consultas, cirugias, laboratorio, historial clinico |
| Recepcionista | Ana Molina | `recepcion1@vetsphere.com` | `Vet2026!` | Recepcion, citas, clientes, admisiones |
| Cliente | Martin Alvarez | `cliente1@mail.com` | `Vet2026!` | Perfil de tutor, mascotas e historial |

## Nota de seguridad

- No publiques estas credenciales como si fueran reales de produccion.
- Para la exposicion estan bien porque son cuentas de prueba sembradas en SQL Server.
- Si cambias la contrasena desde la app, actualiza este archivo.

## Inicio rapido

1. Backend: `http://localhost:8080`
2. Frontend: `http://localhost:4200`
3. Pantalla de login: `http://localhost:4200/login`
