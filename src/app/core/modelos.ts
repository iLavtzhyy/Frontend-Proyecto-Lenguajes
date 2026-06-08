export interface ApiResponse<T> { ok: boolean; mensaje: string; data: T; }
export interface Rol { id: number; nombre: string; }
export interface Usuario {
  id: number; nombres: string; apellidos: string; email: string; telefono: string;
  fotoUrl?: string; especialidad?: string; cedulaProfesional?: string; biografia?: string; roles: Rol[];
}
export interface Mascota {
  id: number; nombre: string; especie: string; raza: string; sexo: string; color: string; pesoKg: number;
  fechaNacimiento: string; fotoUrl?: string; estado: string; propietario: Usuario;
  historiales: HistorialClinico[]; cirugias: Cirugia[];
}
export interface HistorialClinico {
  id: number; fecha: string; tipoEvento: string; motivo: string; diagnostico: string; tratamiento: string;
  vacunas?: string; archivosUrl?: string; temperatura: number; frecuenciaCardiaca: number; frecuenciaRespiratoria: number;
}
export interface Cirugia {
  id: number; fechaProgramada: string; procedimiento: string; tipoAnestesia: string; cirujanoPrincipal?: string; estadoPostoperatorio: string; estado: string; constantesVitales: string; notas?: string; mascota?: Mascota; cirujano?: Usuario;
}
export interface Producto { id?: number; codigo: string; nombre: string; categoria: string; stock: number; stockCritico: number; precio: number; prioridadAlta: boolean; }
export interface Dashboard { totalMascotas: number; mascotasInternadas: number; cirugiasHoy: number; consultasRecientes: number; stockCritico: Producto[]; }
export interface Cliente extends Usuario { ciudad?: string; documento?: string; mascotas?: Mascota[]; totalGastado?: number; estado?: string; fechaRegistro?: string; }
export interface ConsultaMedica {
  id: number; mascota: string; cliente: string; veterinario: string; tipo: string; fecha: string;
  diagnostico: string; tratamiento: string; pesoKg: number; temperatura: number; precio: number;
}
export interface Factura {
  id: number; numero: string; cliente: string; mascota: string; concepto: string; total: number; estadoPago: string; fecha: string;
}
export interface OrdenLaboratorio {
  id: number; fecha: string; tipoPrueba: string; resultado: string; estado: string; archivoResultadoUrl?: string; mascota?: Mascota; veterinarioSolicitante?: Usuario;
}
export interface Hospitalizacion {
  id: number; ingreso: string; alta?: string; jaula: string; motivo: string; planCuidados: string; estado: string; mascota?: Mascota; veterinarioResponsable?: Usuario;
}
