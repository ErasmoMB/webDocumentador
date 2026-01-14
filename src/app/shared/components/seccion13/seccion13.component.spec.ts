import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Seccion13Component } from './seccion13.component';
import { FormularioService } from 'src/app/core/services/formulario.service';

describe('Seccion13Component', () => {
  let component: Seccion13Component;
  let fixture: ComponentFixture<Seccion13Component>;
  let formularioService: jasmine.SpyObj<FormularioService>;

  beforeEach(async () => {
    const formularioServiceSpy = jasmine.createSpyObj('FormularioService', ['obtenerDatos']);
    await TestBed.configureTestingModule({
      declarations: [Seccion13Component],
      providers: [{ provide: FormularioService, useValue: formularioServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    formularioService = TestBed.inject(FormularioService) as jasmine.SpyObj<FormularioService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Seccion13Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have FormularioService injected', () => {
    expect(formularioService).toBeDefined();
  });

  it('should call ngOnInit without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should have ngDoCheck method', () => {
    expect(typeof component.ngDoCheck).toBe('function');
  });

  it('should have actualizarDatos method', () => {
    expect(typeof component.actualizarDatos).toBe('function');
  });
});