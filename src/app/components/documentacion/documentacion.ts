import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './documentacion.html',
  styleUrl: './documentacion.css'
})
export class DocumentacionComponent {
  bloques = [
    {
      icono: 'shield',
      etiqueta: 'Security',
      titulo: 'JWT, BCrypt y permisos por rol',
      texto: 'El backend protege las rutas con Spring Security, token JWT sin sesion en servidor y contrasenas encriptadas con BCrypt.',
      items: ['ROLE_ADMIN administra usuarios y reportes', 'ROLE_VETERINARIO atiende historial clinico', 'ROLE_RECEPCIONISTA gestiona citas y clientes', 'ROLE_CLIENTE consulta su informacion']
    },
    {
      icono: 'file',
      etiqueta: 'SOAP/CXF',
      titulo: 'Inventario conectado por XML',
      texto: 'Apache CXF publica el servicio de productos en /soap/productos?wsdl con UsernameToken Digest y procesamiento XML limitado.',
      items: ['Endpoint ProductoSoapEndpoint', 'DTO ProductoSoapResponse y StockUpdateResponse', 'Pruebas con archivos XML', 'Proteccion contra XXE y expansion de entidades']
    },
    {
      icono: 'users',
      etiqueta: 'Roles ID',
      titulo: 'Usuarios reales y aprobaciones',
      texto: 'El administrador puede crear usuarios, revisar solicitudes y aprobar recepcionistas o veterinarios registrados.',
      items: ['Rol con id y nombre', 'Usuario con conjunto de roles', 'Registro con codigo por correo', 'Recuperacion de contrasena por codigo']
    },
    {
      icono: 'download',
      etiqueta: 'Documento F',
      titulo: 'Reportes y evidencia',
      texto: 'La exposicion puede mostrar PDF de historial, Excel financiero, comprobantes de pago y documentacion del flujo clinico.',
      items: ['PDF de historial clinico profesional', 'Excel de farmacia e inventario', 'Comprobante de factura', 'Dashboard administrativo']
    }
  ];

  xmlEjemplo = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:prod="http://soap.vetsphere.com/productos">
  <soapenv:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>vetsphere-soap</wsse:Username>
        <wsse:Password Type="PasswordDigest">***</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <prod:actualizarStock>
      <codigo>MED-028</codigo>
      <stock>30</stock>
    </prod:actualizarStock>
  </soapenv:Body>
</soapenv:Envelope>`;
}
