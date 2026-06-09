import { Routes } from '@angular/router';
import { LayoutComponent } from './components/barra-navegacion-admin/barra-navegacion-admin';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { VerificacionComponent } from './components/verificar-codigo/verificar-codigo';
import { DashboardComponent } from './components/dashboard/dashboard';
import { MascotasComponent } from './components/mascotas/mascotas';
import { VeterinariosComponent } from './components/veterinarios/veterinarios';
import { AdministracionComponent } from './components/administracion/administracion';
import { RecepcionComponent } from './components/agendar-cita/agendar-cita';
import { FarmaciaComponent } from './components/farmacia/farmacia';
import { ReportesComponent } from './components/reportes/reportes';
import { authGuard } from './core/auth.guard';
import { HomeComponent } from './components/inicio/inicio';
import { ClientesComponent } from './components/clientes/clientes';
import { ConsultasComponent } from './components/consultas/consultas';
import { FacturacionComponent } from './components/facturacion/facturacion';
import { CirugiasComponent } from './components/cirugias/cirugias';
import { LaboratorioComponent } from './components/laboratorio/laboratorio';
import { HospitalizacionComponent } from './components/hospitalizacion/hospitalizacion';
import { UsuariosComponent } from './components/usuarios/usuarios';

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
