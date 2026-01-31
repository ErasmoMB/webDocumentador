import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenericTableComponent, TableConfig, TableColumn } from './generic-table.component';

describe('GenericTableComponent', () => {
  let component: GenericTableComponent;
  let fixture: ComponentFixture<GenericTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should initialize with default config', () => {
      expect(component.config).toBeDefined();
      expect(component.config.showHeader).toBe(true);
      expect(component.config.showFooter).toBe(false);
      expect(component.config.striped).toBe(true);
      expect(component.config.hover).toBe(true);
    });

    it('should accept custom config', () => {
      const customConfig: TableConfig = {
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' }
        ],
        showHeader: false,
        showFooter: true,
        striped: false,
        hover: false
      };

      component.config = customConfig;
      fixture.detectChanges();

      expect(component.config.showHeader).toBe(false);
      expect(component.config.showFooter).toBe(true);
    });

    it('should accept data array', () => {
      const testData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      component.data = testData;
      fixture.detectChanges();

      expect(component.data).toEqual(testData);
      expect(component.data.length).toBe(2);
    });

    it('should handle empty data array', () => {
      component.data = [];
      fixture.detectChanges();

      expect(component.data).toEqual([]);
      expect(component.data.length).toBe(0);
    });
  });

  describe('getColumnLabels', () => {
    it('should return comma-separated column headers', () => {
      component.config = {
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status' }
        ]
      };

      const labels = component.getColumnLabels();
      expect(labels).toBe('ID,Name,Status');
    });

    it('should return empty string for no columns', () => {
      component.config = { columns: [] };
      const labels = component.getColumnLabels();
      expect(labels).toBe('');
    });

    it('should handle single column', () => {
      component.config = {
        columns: [{ key: 'id', header: 'ID' }]
      };

      const labels = component.getColumnLabels();
      expect(labels).toBe('ID');
    });
  });

  describe('ngOnInit', () => {
    it('should not warn if columns are empty', () => {
      spyOn(console, 'warn');
      component.config = { columns: [] };
      
      component.ngOnInit();
      
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should not warn if columns exist', () => {
      spyOn(console, 'warn');
      component.config = {
        columns: [{ key: 'id', header: 'ID' }]
      };
      
      component.ngOnInit();
      
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('should render table with headers when showHeader is true', () => {
      component.config = {
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' }
        ],
        showHeader: true
      };
      component.data = [
        { id: 1, name: 'Item 1' }
      ];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const headers = compiled.querySelectorAll('th');
      expect(headers.length).toBe(2);
      expect(headers[0].textContent.trim()).toBe('ID');
      expect(headers[1].textContent.trim()).toBe('Name');
    });

    it('should not render headers when showHeader is false', () => {
      component.config = {
        columns: [{ key: 'id', header: 'ID' }],
        showHeader: false
      };
      component.data = [{ id: 1 }];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const headers = compiled.querySelectorAll('th');
      expect(headers.length).toBe(0);
    });

    it('should render data rows', () => {
      component.config = {
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' }
        ]
      };
      component.data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const rows = compiled.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should apply format function if provided', () => {
      component.config = {
        columns: [
          {
            key: 'price',
            header: 'Price',
            format: (value: number) => `$${value.toFixed(2)}`
          }
        ]
      };
      component.data = [{ price: 10.5 }];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const cell = compiled.querySelector('tbody td');
      expect(cell.textContent.trim()).toBe('$10.50');
    });

    it('should render footer when showFooter is true and totalRow exists', () => {
      component.config = {
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'total', header: 'Total' }
        ],
        showFooter: true,
        totalRow: { id: 'Total', total: '100' }
      };
      component.data = [{ id: 1, total: 50 }];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const footer = compiled.querySelector('tfoot');
      expect(footer).toBeTruthy();
      expect(footer.classList.contains('total-row')).toBe(true);
    });

    it('should apply data-label attribute for mobile responsive', () => {
      component.config = {
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' }
        ]
      };
      component.data = [{ id: 1, name: 'Item 1' }];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const cells = compiled.querySelectorAll('tbody td');
      expect(cells[0].getAttribute('data-label')).toBe('ID');
      expect(cells[1].getAttribute('data-label')).toBe('Name');
    });

    it('should apply column alignment', () => {
      component.config = {
        columns: [
          { key: 'id', header: 'ID', align: 'center' },
          { key: 'name', header: 'Name', align: 'right' }
        ]
      };
      component.data = [{ id: 1, name: 'Item 1' }];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const cells = compiled.querySelectorAll('tbody td');
      expect(cells[0].style.textAlign).toBe('center');
      expect(cells[1].style.textAlign).toBe('right');
    });

    it('should apply striped class when configured', () => {
      component.config = {
        columns: [{ key: 'id', header: 'ID' }],
        striped: true
      };
      component.data = [{ id: 1 }];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const table = compiled.querySelector('table');
      expect(table.classList.contains('table--striped')).toBe(true);
    });

    it('should apply borderless class when configured', () => {
      component.config = {
        columns: [{ key: 'id', header: 'ID' }],
        borderless: true
      };
      component.data = [{ id: 1 }];

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const wrapper = compiled.querySelector('.table-wrapper');
      expect(wrapper.classList.contains('borderless')).toBe(true);
    });
  });
});
