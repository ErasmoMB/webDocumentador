import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TableContent, SectionsContentState, Section, SectionContent } from '../state/section.model';
import { SectionReferenceValidationService } from './section-reference-validation.service';
import { UIStoreService } from '../state/ui-store.contract';
import { ProjectStateFacade } from '../state/project-state.facade';

class MockProjectStateFacade {
  private _sections = signal<SectionsContentState>({
    byId: {},
    sectionOrder: [],
    activeSectionId: null,
    lastModified: Date.now()
  });

  readonly sectionsContent = this._sections.asReadonly();

  setSections(state: SectionsContentState): void {
    this._sections.set(state);
  }
}

describe('SectionReferenceValidationService', () => {
  let service: SectionReferenceValidationService;
  let facade: MockProjectStateFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UIStoreService,
        { provide: ProjectStateFacade, useClass: MockProjectStateFacade },
        SectionReferenceValidationService
      ]
    });

    service = TestBed.inject(SectionReferenceValidationService);
    facade = TestBed.inject(ProjectStateFacade) as unknown as MockProjectStateFacade;
  });

  it('marks invalid references as errors', () => {
    const table: TableContent = {
      id: 'tbl-1',
      type: 'TABLE',
      titulo: 'Tabla 1',
      fuente: 'Test',
      rows: [
        {
          id: 'row-1',
          orden: 0,
          data: {
            groupReferenceId: 'missing-group',
            groupReferenceType: 'AISD'
          }
        }
      ],
      columns: ['groupReferenceId'],
      totalKey: null,
      campoTotal: null,
      orden: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const section: Section = {
      id: 'sec-1',
      title: 'Sección 1',
      sectionType: 'STATIC',
      groupId: null,
      parentId: null,
      contents: [table as SectionContent],
      orden: 0,
      isLocked: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const sectionsState: SectionsContentState = {
      sectionOrder: ['sec-1'],
      byId: {
        'sec-1': section
      },
      activeSectionId: 'sec-1',
      lastModified: Date.now()
    };

    facade.setSections(sectionsState);

    const validation = service.validationState();
    expect(validation.isValid).toBeFalse();
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors[0].field).toBe('groupReference');
  });
});
