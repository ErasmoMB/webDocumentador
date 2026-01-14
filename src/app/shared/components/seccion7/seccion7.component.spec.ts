import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Seccion7Component } from './seccion7.component';
import { FormularioService } from 'src/app/core/services/formulario.service';

describe('Seccion7Component', () => {
  let component: Seccion7Component;
  let fixture: ComponentFixture<Seccion7Component>;
  let formularioService: jasmine.SpyObj<FormularioService>;

  beforeEach(async () => {
    const formularioServiceSpy = jasmine.createSpyObj('FormularioService', ['obtenerDatos']);
    await TestBed.configureTestingModule({
      declarations: [Seccion7Component],
      providers: [{ provide: FormularioService, useValue: formularioServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    formularioService = TestBed.inject(FormularioService) as jasmine.SpyObj<FormularioService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Seccion7Component);
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