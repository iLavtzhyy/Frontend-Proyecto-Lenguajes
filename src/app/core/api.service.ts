import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, Cirugia, Cliente, ConsultaMedica, Dashboard, Factura, Hospitalizacion, Mascota, OrdenLaboratorio, Producto, Usuario } from './modelos';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  login(datos: { email: string; password: string }) {
    return this.http.post<ApiResponse<any>>(`${this.api}/auth/login`, datos);
  }
  registrar(datos: any) { return this.http.post<ApiResponse<Usuario>>(`${this.api}/auth/registro`, datos); }
  verificar(datos: { email: string; codigo: string }) { return this.http.post<ApiResponse<any>>(`${this.api}/auth/verificar-2fa`, datos); }
  reenviarCodigo(email: string) { return this.http.post<ApiResponse<void>>(`${this.api}/auth/reenviar-codigo`, { email }); }
  solicitarRecuperacion(email: string) { return this.http.post<ApiResponse<void>>(`${this.api}/auth/solicitar-recuperacion`, { email }); }
  restablecerPassword(datos: { email: string; codigo: string; nuevaPassword: string }) { return this.http.post<ApiResponse<void>>(`${this.api}/auth/restablecer-password`, datos); }
  dashboard() { return this.http.get<ApiResponse<Dashboard>>(`${this.api}/dashboard`); }
  mascotas() { return this.http.get<ApiResponse<Mascota[]>>(`${this.api}/mascotas`); }
  crearMascota(datos: any, foto?: File | null) {
    const formData = new FormData();
    formData.append('mascota', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
    if (foto) formData.append('foto', foto);
    return this.http.post<ApiResponse<Mascota>>(`${this.api}/mascotas`, formData);
  }
  actualizarMascota(id: number, datos: any) {
    return this.http.put<ApiResponse<Mascota>>(`${this.api}/mascotas/${id}`, datos);
  }
  eliminarMascota(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/mascotas/${id}`);
  }
  veterinarios() { return this.http.get<ApiResponse<Usuario[]>>(`${this.api}/veterinarios/publico`); }
  clientes() { return this.http.get<ApiResponse<Cliente[]>>(`${this.api}/clientes`); }
  consultas() { return this.http.get<ApiResponse<ConsultaMedica[]>>(`${this.api}/consultas`); }
  crearConsulta(datos: any) { return this.http.post<ApiResponse<any>>(`${this.api}/consultas`, datos); }
  actualizarConsulta(id: number, datos: any) { return this.http.put<ApiResponse<any>>(`${this.api}/consultas/${id}`, datos); }
  eliminarConsulta(id: number) { return this.http.delete<ApiResponse<void>>(`${this.api}/consultas/${id}`); }
  facturas() { return this.http.get<ApiResponse<Factura[]>>(`${this.api}/facturacion`); }
  productosCriticos() { return this.http.get<ApiResponse<Producto[]>>(`${this.api}/farmacia/criticos`); }
  productos() { return this.http.get<ApiResponse<Producto[]>>(`${this.api}/farmacia/inventario`); }
  crearProducto(datos: Producto) { return this.http.post<ApiResponse<Producto>>(`${this.api}/farmacia/inventario`, datos); }
  actualizarProducto(codigo: string, datos: Producto) { return this.http.put<ApiResponse<Producto>>(`${this.api}/farmacia/inventario/${codigo}`, datos); }
  actualizarStock(codigo: string, stock: number) { return this.http.put<ApiResponse<Producto>>(`${this.api}/farmacia/inventario/${codigo}/stock`, { stock }); }
  agregarStock(codigo: string, cantidad: number) { return this.http.post<ApiResponse<Producto>>(`${this.api}/farmacia/inventario/${codigo}/movimiento`, { cantidad }); }
  cirugias() { return this.http.get<ApiResponse<Cirugia[]>>(`${this.api}/cirugias`); }
  crearCirugia(datos: any) { return this.http.post<ApiResponse<Cirugia>>(`${this.api}/cirugias`, datos); }
  actualizarCirugia(id: number, datos: any) { return this.http.put<ApiResponse<Cirugia>>(`${this.api}/cirugias/${id}`, datos); }
  eliminarCirugia(id: number) { return this.http.delete<ApiResponse<void>>(`${this.api}/cirugias/${id}`); }
  laboratorio() { return this.http.get<ApiResponse<OrdenLaboratorio[]>>(`${this.api}/laboratorio`); }
  crearOrdenLaboratorio(datos: any) { return this.http.post<ApiResponse<OrdenLaboratorio>>(`${this.api}/laboratorio`, datos); }
  actualizarOrdenLaboratorio(id: number, datos: any) { return this.http.put<ApiResponse<OrdenLaboratorio>>(`${this.api}/laboratorio/${id}`, datos); }
  eliminarOrdenLaboratorio(id: number) { return this.http.delete<ApiResponse<void>>(`${this.api}/laboratorio/${id}`); }
  hospitalizaciones() { return this.http.get<ApiResponse<Hospitalizacion[]>>(`${this.api}/hospitalizaciones`); }
  crearHospitalizacion(datos: any) { return this.http.post<ApiResponse<Hospitalizacion>>(`${this.api}/hospitalizaciones`, datos); }
  actualizarHospitalizacion(id: number, datos: any) { return this.http.put<ApiResponse<Hospitalizacion>>(`${this.api}/hospitalizaciones/${id}`, datos); }
  eliminarHospitalizacion(id: number) { return this.http.delete<ApiResponse<void>>(`${this.api}/hospitalizaciones/${id}`); }
  administracion() { return this.http.get<ApiResponse<Record<string, number>>>(`${this.api}/administracion/indicadores`); }
  recepcion() { return this.http.get<ApiResponse<Record<string, number>>>(`${this.api}/recepcion/panel`); }
  usuarios() { return this.http.get<ApiResponse<Usuario[]>>(`${this.api}/admin/usuarios`); }
  crearUsuario(datos: any) { return this.http.post<ApiResponse<Usuario>>(`${this.api}/admin/usuarios`, datos); }
  solicitudesPendientes() { return this.http.get<ApiResponse<Usuario[]>>(`${this.api}/admin/usuarios/solicitudes-pendientes`); }
  aprobarUsuario(id: number) { return this.http.put<ApiResponse<Usuario>>(`${this.api}/admin/usuarios/${id}/aprobar`, {}); }

  subirArchivo(archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ApiResponse<string>>(`${this.api}/archivos`, formData);
  }

  descargar(url: string, nombre: string) {
    this.http.get(`${this.api}${url}`, { responseType: 'blob' }).subscribe(blob => {
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(blob);
      enlace.download = nombre;
      enlace.click();
      URL.revokeObjectURL(enlace.href);
    });
  }

}
