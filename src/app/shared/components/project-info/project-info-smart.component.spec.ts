/**
 * PROJECT INFO SMART COMPONENT TESTS
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectInfoSmartComponent } from './project-info-smart.component';
import { UIStoreService, Commands } from '../../../core/state/ui-store.contract';
import { UIReadAdapter, UIWriteAdapter } from '../../../core/adapters';

describe('ProjectInfoSmartComponent', () => {
  let component: ProjectInfoSmartComponent;
  let fixture: ComponentFixture<ProjectInfoSmartComponent>;
  let store: UIStoreService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectInfoSmartComponent],
      providers: [UIStoreService, UIReadAdapter, UIWriteAdapter]
    }).compileComponents();

    store = TestBed.inject(UIStoreService);
    store.reset();
    
    fixture = TestBed.createComponent(ProjectInfoSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display project name from store', () => {
    store.dispatch(Commands.setProjectName('Test Project'));
    fixture.detectChanges();
    
    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('Test Project');
  });

  it('should update store when project name changes', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'New Project';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(store.getSnapshot().metadata.projectName).toBe('New Project');
  });

  it('should display consultora from store', () => {
    store.dispatch(Commands.setConsultora('Test Consultora'));
    fixture.detectChanges();
    
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs[1].value).toBe('Test Consultora');
  });

  it('should show dirty state', () => {
    // Initially not dirty (fresh state)
    const statusSpan = fixture.nativeElement.querySelector('.project-status span');
    expect(statusSpan.textContent).toContain('Guardado');
  });

  it('should reset state', () => {
    store.dispatch(Commands.setProjectName('To Reset'));
    fixture.detectChanges();
    
    const resetButton = fixture.nativeElement.querySelectorAll('button')[1];
    resetButton.click();
    fixture.detectChanges();
    
    expect(store.getSnapshot().metadata.projectName).toBe('');
  });
});
