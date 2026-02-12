import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent, FotoItem } from './image-upload.component';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ImageBackendService } from 'src/app/core/services/image/image-backend.service';
import { ChangeDetectorRef } from '@angular/core';

describe('ImageUploadComponent (integration important flow)', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;
  let imageFacadeSpy: jasmine.SpyObj<ImageManagementFacade>;
  let formChangeSpy: jasmine.SpyObj<FormChangeService>;
  let projectFacadeSpy: jasmine.SpyObj<ProjectStateFacade>;

  beforeEach(async () => {
    imageFacadeSpy = jasmine.createSpyObj('ImageManagementFacade', ['saveImages', 'getGroupPrefix']);
    imageFacadeSpy.getGroupPrefix.and.returnValue('_A1');
    formChangeSpy = jasmine.createSpyObj('FormChangeService', ['persistFields']);
    projectFacadeSpy = jasmine.createSpyObj('ProjectStateFacade', ['obtenerDatos']);
    projectFacadeSpy.obtenerDatos.and.returnValue({ projectName: 'P' });

    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent],
      providers: [
        { provide: ImageManagementFacade, useValue: imageFacadeSpy },
        { provide: FormChangeService, useValue: formChangeSpy },
        { provide: ProjectStateFacade, useValue: projectFacadeSpy },
        { provide: ImageBackendService, useValue: {} },
        // Mock ChangeDetectorRef para evitar NullInjectorError
        { provide: ChangeDetectorRef, useValue: { markForCheck: () => {}, detectChanges: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    component.sectionId = '3.1.12';
    component.photoPrefix = 'pf';
    fixture.detectChanges();
  });

  it('should call saveImages when applying image locally for multiples', () => {
    component.permitirMultiples = true;
    component._fotografias = [component.createEmptyFoto()];

    component.aplicarImagenLocalmente('data:image', 'G1', 'id-123', 0);

    expect(imageFacadeSpy.getGroupPrefix).toHaveBeenCalledWith('3.1.12');
    expect(imageFacadeSpy.saveImages).toHaveBeenCalled();
    const args = imageFacadeSpy.saveImages.calls.mostRecent().args;
    expect(args[0]).toBe('3.1.12');
    expect(args[1]).toBe('pf');
    expect(Array.isArray(args[2])).toBeTrue();
    expect(args[3]).toBe('_A1');
  });

  it('should call saveImages when title changes', () => {
    component.permitirMultiples = true;
    component._fotografias = [component.createEmptyFoto()];

    component.onTituloChange('Nuevo Título', 0);

    expect(imageFacadeSpy.saveImages).toHaveBeenCalled();
  });

  it('should call saveImages when deleting an image', () => {
    component.permitirMultiples = true;
    const foto: FotoItem = { titulo: 'T', fuente: 'F', imagen: 'im-1', id: 'abc' };
    component._fotografias = [foto];

    component.eliminarImagen(0);

    expect(imageFacadeSpy.saveImages).toHaveBeenCalled();
  });
});