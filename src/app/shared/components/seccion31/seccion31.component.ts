import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FormularioDatos } from 'src/app/core/models/formulario.model';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion31',
  templateUrl: './seccion31.component.html',
  styleUrls: ['./seccion31.component.css']
})
export class Seccion31Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: FormularioDatos | null = null;
  private datosAnteriores: any = {};

  constructor(
    private formularioService: FormularioService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seccionId']) {
      this.actualizarDatos();
    }
  }

  ngDoCheck() {
    const datosActuales = this.formularioService.obtenerDatos();
    const centroPobladoAISIActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'centroPobladoAISI', this.seccionId);
    const centroPobladoAISIAnterior = this.datosAnteriores.centroPobladoAISI || null;
    const centroPobladoAISIEnDatos = (this.datos as any)?.centroPobladoAISI || null;
    
    if (centroPobladoAISIActual !== centroPobladoAISIAnterior || centroPobladoAISIActual !== centroPobladoAISIEnDatos) {
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = datosNuevos;
    this.actualizarValoresConPrefijo();
    this.cdRef.detectChanges();
  }

  actualizarValoresConPrefijo() {
    if (this.datos) {
      const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
      (this.datos as any).centroPobladoAISI = centroPobladoAISI || null;
      this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
    }
  }

  getFotografiasAspectosCulturalesParaImageUpload(): FotoItem[] {
    const fotografias = this.datos?.['fotografiasAspectosCulturales'] || [];
    return fotografias.map((f: any) => ({
      titulo: f.titulo || '',
      fuente: f.fuente || '',
      imagen: f.ruta || f.imagen || ''
    })).filter((f: FotoItem) => f.imagen && f.imagen.trim() !== '');
  }
}

