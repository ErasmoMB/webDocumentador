import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { SeccionComponent } from './pages/seccion/seccion.component';
import { PlantillaViewComponent } from './pages/plantilla/plantilla-view.component';
import { ResumenComponent } from './pages/plantilla/plantilla.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { FotoInfoComponent } from './shared/components/foto-info/foto-info.component';
import { Seccion1Component } from './shared/components/seccion1/seccion1.component';
import { Seccion2Component } from './shared/components/seccion2/seccion2.component';
import { Seccion3Component } from './shared/components/seccion3/seccion3.component';
import { Seccion4Component } from './shared/components/seccion4/seccion4.component';
import { Seccion5Component } from './shared/components/seccion5/seccion5.component';
import { Seccion6Component } from './shared/components/seccion6/seccion6.component';
import { Seccion7Component } from './shared/components/seccion7/seccion7.component';
import { Seccion8Component } from './shared/components/seccion8/seccion8.component';
import { Seccion9Component } from './shared/components/seccion9/seccion9.component';
import { Seccion10Component } from './shared/components/seccion10/seccion10.component';
import { Seccion11Component } from './shared/components/seccion11/seccion11.component';
import { Seccion12Component } from './shared/components/seccion12/seccion12.component';
import { Seccion13Component } from './shared/components/seccion13/seccion13.component';
import { Seccion14Component } from './shared/components/seccion14/seccion14.component';
import { Seccion15Component } from './shared/components/seccion15/seccion15.component';
import { Seccion16Component } from './shared/components/seccion16/seccion16.component';
import { Seccion17Component } from './shared/components/seccion17/seccion17.component';
import { Seccion18Component } from './shared/components/seccion18/seccion18.component';
import { Seccion19Component } from './shared/components/seccion19/seccion19.component';
import { Seccion20Component } from './shared/components/seccion20/seccion20.component';
import { Seccion21Component } from './shared/components/seccion21/seccion21.component';
import { Seccion22Component } from './shared/components/seccion22/seccion22.component';
import { Seccion23Component } from './shared/components/seccion23/seccion23.component';
import { Seccion24Component } from './shared/components/seccion24/seccion24.component';
import { Seccion25Component } from './shared/components/seccion25/seccion25.component';
import { Seccion26Component } from './shared/components/seccion26/seccion26.component';
import { Seccion27Component } from './shared/components/seccion27/seccion27.component';
import { Seccion28Component } from './shared/components/seccion28/seccion28.component';
import { Seccion29Component } from './shared/components/seccion29/seccion29.component';
import { Seccion30Component } from './shared/components/seccion30/seccion30.component';
import { ImageUploadComponent } from './shared/components/image-upload/image-upload.component';

import { FormularioService } from './core/services/formulario.service';
import { DataService } from './core/services/data.service';
import { ConfigService } from './core/services/config.service';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    SeccionComponent,
    PlantillaViewComponent,
    ResumenComponent,
    SidebarComponent,
    FotoInfoComponent,
    Seccion1Component,
    Seccion2Component,
    Seccion3Component,
    Seccion4Component,
    Seccion5Component,
    Seccion6Component,
    Seccion7Component,
    Seccion8Component,
    Seccion9Component,
    Seccion10Component,
    Seccion11Component,
    Seccion12Component,
    Seccion13Component,
    Seccion14Component,
    Seccion15Component,
    Seccion16Component,
    Seccion17Component,
    Seccion18Component,
    Seccion19Component,
    Seccion20Component,
    Seccion21Component,
    Seccion22Component,
    Seccion23Component,
    Seccion24Component,
    Seccion25Component,
    Seccion26Component,
    Seccion27Component,
    Seccion28Component,
    Seccion29Component,
    Seccion30Component,
    ImageUploadComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    FormularioService,
    DataService,
    ConfigService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

