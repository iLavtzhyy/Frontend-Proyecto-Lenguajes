import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Factura } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './facturacion.html',
  styleUrl: './facturacion.css'
})
export class FacturacionComponent implements OnInit {
  facturas: Factura[] = [];
  facturaSeleccionada?: Factura;
  facturaPago?: Factura;
  estadoPago = 'Pendiente';
  metodoPago = 'Efectivo';
  mensajePago = '';
  fechaEmision = new Date();

  clientes: any[] = [];
  mascotas: any[] = [];
  todasConsultas: any[] = [];
  todasCirugias: any[] = [];
  todosLabs: any[] = [];
  todasHosp: any[] = [];

  mostrarFormFactura = false;
  tipoFacturacion = 'automatica';
  mascotasFiltradas: any[] = [];
  serviciosPaciente: any[] = [];
  nuevaFactura = this.facturaVacia();

  facturaVacia() {
    return {
      numero: '',
      fecha: new Date().toISOString().slice(0, 16),
      clienteId: null as number | null,
      mascotaId: null as number | null,
      clienteNombre: '',
      mascotaNombre: '',
      concepto: '',
      subtotal: 0,
      impuestos: 0,
      total: 0,
      estadoPago: 'Pendiente',
      metodoPago: 'Efectivo'
    };
  }

  abrirNuevaFactura() {
    this.nuevaFactura = this.facturaVacia();
    const nextNum = this.facturas.length + 1;
    this.nuevaFactura.numero = `FAC-2026-${String(nextNum).padStart(4, '0')}`;
    this.tipoFacturacion = 'automatica';
    this.serviciosPaciente = [];
    this.mascotasFiltradas = [];

    this.api.clientes().subscribe(r => this.clientes = r.data);
    this.api.mascotas().subscribe(r => this.mascotas = r.data);
    this.api.consultas().subscribe(r => this.todasConsultas = r.data);
    this.api.cirugias().subscribe(r => this.todasCirugias = r.data);
    this.api.laboratorio().subscribe(r => this.todosLabs = r.data);
    this.api.hospitalizaciones().subscribe(r => this.todasHosp = r.data);

    this.mostrarFormFactura = true;
  }

  cerrarNuevaFactura() {
    this.mostrarFormFactura = false;
  }

  cambiarTipoFacturacion(tipo: string) {
    this.tipoFacturacion = tipo;
    this.calcularTotalesAutomaticos();
  }

  onClienteChange() {
    this.nuevaFactura.mascotaId = null;
    this.serviciosPaciente = [];
    this.mascotasFiltradas = this.mascotas.filter(m => m.propietario?.id === this.nuevaFactura.clienteId);
    this.calcularTotalesAutomaticos();
  }

  onMascotaChange() {
    this.serviciosPaciente = [];
    if (!this.nuevaFactura.mascotaId) {
      this.calcularTotalesAutomaticos();
      return;
    }
    const mascotaId = this.nuevaFactura.mascotaId;
    const petObj = this.mascotas.find(m => m.id === mascotaId);
    if (!petObj) return;

    if (petObj.historiales) {
      petObj.historiales.forEach((h: any) => {
        if (!h.facturaId) {
          this.serviciosPaciente.push({
            tipo: 'Consulta',
            id: h.id,
            descripcion: `${h.tipoEvento || 'Consulta'} - ${h.motivo}`,
            fecha: h.fecha,
            precio: h.precio || 45.00,
            seleccionado: false
          });
        }
      });
    }

    if (petObj.cirugias) {
      petObj.cirugias.forEach((c: any) => {
        if (!c.facturaId) {
          this.serviciosPaciente.push({
            tipo: 'Cirugía',
            id: c.id,
            descripcion: c.procedimiento,
            fecha: c.fechaProgramada,
            precio: c.precio || 280.00,
            seleccionado: false
          });
        }
      });
    }

    const labOrders = this.todosLabs.filter(o => o.mascota?.id === mascotaId);
    labOrders.forEach((l: any) => {
      if (!l.facturaId) {
        this.serviciosPaciente.push({
          tipo: 'Laboratorio',
          id: l.id,
          descripcion: l.tipoPrueba,
          fecha: l.fecha,
          precio: l.precio || 35.00,
          seleccionado: false
        });
      }
    });

    const hospOrders = this.todasHosp.filter(h => h.mascota?.id === mascotaId);
    hospOrders.forEach((hp: any) => {
      if (!hp.facturaId) {
        this.serviciosPaciente.push({
          tipo: 'Hospitalización',
          id: hp.id,
          descripcion: hp.motivo,
          fecha: hp.ingreso,
          precio: hp.precio || 45.00,
          seleccionado: false
        });
      }
    });

    this.calcularTotalesAutomaticos();
  }

  calcularTotalesAutomaticos() {
    if (this.tipoFacturacion === 'directa') {
      this.onSubtotalDirectoChange();
      return;
    }

    const seleccionados = this.serviciosPaciente.filter(s => s.seleccionado);
    const subtotal = seleccionados.reduce((sum, s) => sum + s.precio, 0);
    this.nuevaFactura.subtotal = subtotal;
    this.nuevaFactura.impuestos = Number((subtotal * 0.12).toFixed(2));
    this.nuevaFactura.total = Number((subtotal * 1.12).toFixed(2));

    if (seleccionados.length > 0) {
      this.nuevaFactura.concepto = seleccionados.map(s => `${s.tipo}: ${s.descripcion}`).join(' + ');
    } else {
      this.nuevaFactura.concepto = '';
    }
  }

  onSubtotalDirectoChange() {
    const sub = Number(this.nuevaFactura.subtotal || 0);
    this.nuevaFactura.impuestos = Number((sub * 0.12).toFixed(2));
    this.nuevaFactura.total = Number((sub * 1.12).toFixed(2));
  }

  guardarNuevaFactura() {
    if (this.tipoFacturacion === 'automatica' && (!this.nuevaFactura.clienteId || !this.nuevaFactura.mascotaId)) {
      alert('Por favor, selecciona un cliente y una mascota.');
      return;
    }
    if (!this.nuevaFactura.concepto || this.nuevaFactura.total <= 0) {
      alert('El concepto no puede estar vacío y el total debe ser mayor a 0.');
      return;
    }

    const seleccionados = this.serviciosPaciente.filter(s => s.seleccionado);

    const payload = {
      numero: this.nuevaFactura.numero,
      fecha: new Date(this.nuevaFactura.fecha).toISOString().slice(0, 19),
      concepto: this.nuevaFactura.concepto,
      subtotal: this.nuevaFactura.subtotal,
      impuestos: this.nuevaFactura.impuestos,
      total: this.nuevaFactura.total,
      estadoPago: this.nuevaFactura.estadoPago,
      metodoPago: this.nuevaFactura.estadoPago === 'Pagado' ? this.nuevaFactura.metodoPago : '',
      cliente: this.tipoFacturacion === 'automatica' ? { id: this.nuevaFactura.clienteId } : null,
      mascota: this.tipoFacturacion === 'automatica' ? { id: this.nuevaFactura.mascotaId } : null,
      consultaIds: seleccionados.filter(s => s.tipo === 'Consulta').map(s => s.id),
      cirugiaIds: seleccionados.filter(s => s.tipo === 'Cirugía').map(s => s.id),
      laboratorioIds: seleccionados.filter(s => s.tipo === 'Laboratorio').map(s => s.id),
      hospitalizacionIds: seleccionados.filter(s => s.tipo === 'Hospitalización').map(s => s.id)
    };

    this.api.crearFactura(payload).subscribe(() => {
      this.mostrarFormFactura = false;
      this.api.facturas().subscribe(r => this.facturas = r.data);
    });
  }

  constructor(private api: ApiService) {}

  ngOnInit() { this.api.facturas().subscribe(r => this.facturas = r.data); }

  get total() { return this.facturas.reduce((s, f) => s + Number(f.total || 0), 0); }
  get pendientes() { return this.facturas.filter(f => f.estadoPago === 'Pendiente').length; }
  get pagadas() { return this.facturas.filter(f => f.estadoPago === 'Pagado').length; }

  seleccionar(factura: Factura) {
    this.facturaSeleccionada = factura;
  }

  cerrarVistaPrevia() {
    this.facturaSeleccionada = undefined;
  }

  descargarComprobante(factura: Factura) {
    const contenido = this.crearComprobanteHtml(factura);
    const blob = new Blob([contenido], { type: 'text/html;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `comprobante-${factura.numero}.html`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  imprimirComprobante(factura: Factura) {
    const ventana = window.open('', '_blank', 'width=920,height=720');
    if (!ventana) return;
    ventana.document.write(this.crearComprobanteHtml(factura, true));
    ventana.document.close();
  }

  estadoClase(factura: Factura) {
    return factura.estadoPago === 'Pagado' ? 'badge-ok' : 'badge-warn';
  }

  abrirPago(factura: Factura) {
    this.facturaPago = factura;
    this.estadoPago = factura.estadoPago || 'Pendiente';
    this.metodoPago = factura.metodoPago || 'Efectivo';
    this.mensajePago = '';
  }

  cerrarPago() {
    this.facturaPago = undefined;
  }

  guardarPago() {
    if (!this.facturaPago) return;
    this.api.actualizarEstadoFactura(this.facturaPago.id, this.estadoPago, this.estadoPago === 'Pagado' ? this.metodoPago : '').subscribe(r => {
      const actualizada = { ...this.facturaPago!, estadoPago: r.data.estadoPago || this.estadoPago, metodoPago: r.data.metodoPago || '' };
      this.facturas = this.facturas.map(f => f.id === actualizada.id ? actualizada : f);
      if (this.facturaSeleccionada?.id === actualizada.id) this.facturaSeleccionada = actualizada;
      this.mensajePago = 'Estado de pago actualizado.';
      this.cerrarPago();
    });
  }

  private crearComprobanteHtml(factura: Factura, imprimir = false) {
    const fechaFactura = this.formatearFecha(factura.fecha);
    const subtotal = Number(factura.total || 0);
    const iva = 0;
    const total = subtotal + iva;
    const estado = factura.estadoPago === 'Pagado' ? 'PAGO CONFIRMADO' : 'PENDIENTE DE PAGO';
    const imprimirScript = imprimir ? '<script>window.onload = () => setTimeout(() => window.print(), 350);</script>' : '';
    const metodoPagoDiv = factura.metodoPago ? `<div class="box"><div class="label">Método de Pago</div><div class="value">${this.escapar(factura.metodoPago)}</div></div>` : '';

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Comprobante ${this.escapar(factura.numero)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #eef5f8; color: #0f172a; font-family: Arial, Helvetica, sans-serif; }
    .page { max-width: 860px; margin: 34px auto; padding: 24px; }
    .receipt { overflow: hidden; border: 1px solid #d9e7ee; border-radius: 18px; background: #fff; box-shadow: 0 24px 70px rgba(15, 23, 42, .14); }
    .hero { display: flex; justify-content: space-between; gap: 24px; padding: 30px; color: white; background: linear-gradient(135deg, #075985, #0891b2 58%, #14b8a6); }
    .brand { display: flex; gap: 14px; align-items: center; }
    .logo { display: grid; width: 58px; height: 58px; place-items: center; border-radius: 16px; background: rgba(255,255,255,.18); font-weight: 900; letter-spacing: .03em; }
    .brand h1 { margin: 0; font-size: 26px; line-height: 1; }
    .brand p, .hero-meta p { margin: 5px 0 0; opacity: .88; font-size: 13px; }
    .hero-meta { text-align: right; }
    .hero-meta strong { display: block; font-size: 18px; margin-top: 4px; }
    .status { display: inline-flex; margin-top: 12px; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,.2); font-size: 12px; font-weight: 900; }
    .content { padding: 30px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .box { border: 1px solid #e2edf3; border-radius: 14px; padding: 18px; background: #f8fbfd; }
    .label { color: #64748b; font-size: 11px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
    .value { margin-top: 7px; color: #0f172a; font-size: 16px; font-weight: 900; }
    table { width: 100%; margin-top: 24px; border-collapse: collapse; overflow: hidden; border-radius: 14px; }
    th { padding: 14px; background: #0f172a; color: #e0f2fe; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; }
    td { padding: 16px 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .amount { text-align: right; font-weight: 900; color: #0f766e; }
    .totals { display: flex; justify-content: flex-end; margin-top: 22px; }
    .totals-card { width: 320px; border: 1px solid #d9e7ee; border-radius: 16px; padding: 18px; background: #f8fbfd; }
    .line { display: flex; justify-content: space-between; padding: 8px 0; color: #475569; }
    .line.total { margin-top: 8px; border-top: 1px solid #cbd5e1; color: #0f172a; font-size: 22px; font-weight: 900; }
    .footer { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; padding: 0 30px 30px; }
    .note { border-radius: 14px; background: #ecfeff; padding: 16px; color: #155e75; font-size: 13px; line-height: 1.55; }
    .signature { display: flex; align-items: flex-end; justify-content: center; border-bottom: 1px solid #94a3b8; color: #64748b; font-size: 12px; min-height: 74px; }
    @media print { body { background: white; } .page { margin: 0; max-width: none; } .receipt { box-shadow: none; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="receipt">
      <header class="hero">
        <div class="brand">
          <div class="logo">VS</div>
          <div>
            <h1>VetSphere</h1>
            <p>Clinica veterinaria integral</p>
            <p>Av. Cristobal Colon y 12 de Octubre, Quito</p>
          </div>
        </div>
        <div class="hero-meta">
          <p>Comprobante de pago</p>
          <strong>${this.escapar(factura.numero)}</strong>
          <span class="status">${estado}</span>
        </div>
      </header>

      <div class="content">
        <div class="grid">
          <div class="box"><div class="label">Cliente</div><div class="value">${this.escapar(factura.cliente)}</div></div>
          <div class="box"><div class="label">Fecha</div><div class="value">${fechaFactura}</div></div>
          <div class="box"><div class="label">Paciente</div><div class="value">${this.escapar(factura.mascota)}</div></div>
          <div class="box"><div class="label">Estado</div><div class="value">${this.escapar(factura.estadoPago)}</div></div>
          ${metodoPagoDiv}
        </div>

        <table>
          <thead><tr><th>Detalle</th><th>Paciente</th><th class="amount">Valor</th></tr></thead>
          <tbody>
            <tr>
              <td>${this.escapar(factura.concepto)}</td>
              <td>${this.escapar(factura.mascota)}</td>
              <td class="amount">$${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-card">
            <div class="line"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></div>
            <div class="line"><span>IVA</span><strong>$${iva.toFixed(2)}</strong></div>
            <div class="line total"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>
          </div>
        </div>
      </div>

      <footer class="footer">
        <div class="note">Gracias por confiar en VetSphere. Conserva este comprobante como respaldo del servicio clinico registrado en el historial de tu mascota.</div>
        <div class="signature">Firma autorizada VetSphere</div>
      </footer>
    </section>
  </main>
  ${imprimirScript}
</body>
</html>`;
  }

  private formatearFecha(fecha?: string) {
    if (!fecha) return this.fechaEmision.toLocaleDateString('es-EC');
    return new Date(fecha).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: '2-digit' });
  }

  private escapar(valor?: string | number) {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
