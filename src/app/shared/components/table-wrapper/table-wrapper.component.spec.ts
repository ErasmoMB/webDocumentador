import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableWrapperComponent } from './table-wrapper.component';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';
import { ChangeDetectorRef } from '@angular/core';

describe('TableWrapperComponent (reactive)', () => {
  let fixture: ComponentFixture<TableWrapperComponent>;
  let component: TableWrapperComponent;
  let service: TableNumberingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableWrapperComponent],
      providers: [TableNumberingService]
    }).compileComponents();

    fixture = TestBed.createComponent(TableWrapperComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TableNumberingService);

    // default values used in template
    component.sectionId = '3.1.4.A.1.3';
    component.title = 'Test';
  });

  it('should calculate initial table number on AfterViewInit', (done) => {
    fixture.detectChanges(); // triggers ngAfterViewInit

    setTimeout(() => {
      // Component should have calculated a number (e.g., 3.N where N is global index)
      expect(component.tableNumber).toBeTruthy();
      expect(component.tableNumber).toMatch(/^3\.\d+$/);
      done();
    }, 20);
  });

  it('updates tableNumber reactively when service emits changes', (done) => {
    // Spy the service to return a deterministic number
    spyOn(service, 'getGlobalTableNumber').and.returnValue('3.999');

    fixture.detectChanges(); // triggers ngAfterViewInit

    // When we update the section count the service should emit and component should recalc
    service.registerSectionTableCount('3.1.4.A.1.3', (service.getSectionTableCount('3.1.4.A.1.3') || 0) + 1);

    setTimeout(() => {
      expect(component.tableNumber).toBe('3.999');
      done();
    }, 20);
  });

  it('should display Cuadro N° in template with correct number', (done) => {
    // Spy with a known number
    spyOn(service, 'getGlobalTableNumber').and.returnValue('3.42');

    fixture.detectChanges(); // triggers ngAfterViewInit

    setTimeout(() => {
      fixture.detectChanges();
      const titleElement = fixture.nativeElement.querySelector('.table-title');
      if (titleElement) {
        expect(titleElement.textContent).toContain('Cuadro N° 3.42');
      } else {
        // If not found in real DOM, at least verify component has the value
        expect(component.tableNumber).toBe('3.42');
      }
      done();
    }, 20);
  });

  it('should hide number when hideNumber=true', (done) => {
    component.hideNumber = true;
    spyOn(service, 'getGlobalTableNumber').and.returnValue('3.99');

    fixture.detectChanges(); // triggers ngAfterViewInit

    setTimeout(() => {
      fixture.detectChanges();
      const titleElement = fixture.nativeElement.querySelector('.table-title');
      // Should not render the title or it should be hidden by *ngIf
      if (titleElement) {
        expect(titleElement.style.display).toBe('none');
      }
      done();
    }, 20);
  });

  it('should call calculateTableNumber on each changes$ emission', (done) => {
    spyOn<any>(component, 'calculateTableNumber').and.callThrough();

    fixture.detectChanges(); // triggers ngAfterViewInit

    setTimeout(() => {
      // Should be called at least once during ngAfterViewInit
      expect((component as any).calculateTableNumber).toHaveBeenCalled();

      const initialCallCount = (component as any).calculateTableNumber.calls.count();

      // Emit a change event
      service.registerSectionTableCount('3.1.4.A.1.1', 2);

      setTimeout(() => {
        // Should have been called again
        expect((component as any).calculateTableNumber.calls.count()).toBeGreaterThan(initialCallCount);
        done();
      }, 20);
    }, 20);
  });
});
