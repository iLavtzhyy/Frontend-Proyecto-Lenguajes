import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Factura } from '../../core/modelos';
import { fadeInUp } from '../../shared/animations/fade-in-up';
import { IconoComponent } from '../../shared/components/icono/icono';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  animations: [fadeInUp],
  templateUrl: './facturacion.html',
  styleUrl: './facturacion.css'
})
export class FacturacionComponent implements OnInit {
  facturas: Factura[] = [];
  facturaSeleccionada?: Factura;
  fechaEmision = new Date();

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

  private crearComprobanteHtml(factura: Factura, imprimir = false) {
    const fechaFactura = this.formatearFecha(factura.fecha);
    const subtotal = Number(factura.total || 0);
    const iva = 0;
    const total = subtotal + iva;
    const estado = factura.estadoPago === 'Pagado' ? 'PAGO CONFIRMADO' : 'PENDIENTE DE PAGO';
    const imprimirScript = imprimir ? '<script>window.onload = () => setTimeout(() => window.print(), 350);</script>' : '';

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
