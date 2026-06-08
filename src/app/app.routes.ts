import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegistroComponent } from './features/auth/registro.component';
import { VerificacionComponent } from './features/auth/verificacion.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MascotasComponent } from './features/mascotas/mascotas.component';
import { VeterinariosComponent } from './features/veterinarios/veterinarios.component';
import { AdministracionComponent } from './features/administracion/administracion.component';
import { RecepcionComponent } from './features/recepcion/recepcion.component';
import { FarmaciaComponent } from './features/farmacia/farmacia.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { authGuard } from './core/auth.guard';
import { HomeComponent } from './features/home/home.component';
import { ClientesComponent } from './features/clientes/clientes.component';
import { ConsultasComponent } from './features/consultas/consultas.component';
import { FacturacionComponent } from './features/facturacion/facturacion.component';
import { CirugiasComponent } from './features/cirugias/cirugias.component';
import { LaboratorioComponent } from './features/laboratorio/laboratorio.component';
import { HospitalizacionComponent } from './features/hospitalizacion/hospitalizacion.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'verificacion', component: VerificacionComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'consultas', component: ConsultasComponent },
      { path: 'cirugias', component: CirugiasComponent },
      { path: 'laboratorio', component: LaboratorioComponent },
      { path: 'hospitalizacion', component: HospitalizacionComponent },
      { path: 'mascotas', component: MascotasComponent },
      { path: 'veterinarios', component: VeterinariosComponent },
      { path: 'administracion', component: AdministracionComponent },
      { path: 'recepcion', component: RecepcionComponent },
      { path: 'farmacia', component: FarmaciaComponent },
      { path: 'facturacion', component: FacturacionComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
