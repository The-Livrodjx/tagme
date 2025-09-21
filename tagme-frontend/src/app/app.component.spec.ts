// item-table.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemsTableComponent } from './features/items/components/item-table/item-table.component';
import { ApiService } from './core/services/api.service';

interface Item {
  _id: string;
  titulo?: string;
  descricao?: string;
  photo: string;
  __v: number;
}

interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

interface ApiResponse {
  items: Item[];
  meta: PaginationMeta;
}

describe('ItemsTableComponent', () => {
  let component: ItemsTableComponent;
  let fixture: ComponentFixture<ItemsTableComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockItems: Item[] = [
    {
      _id: '1',
      titulo: 'Item 1',
      descricao: 'Descrição 1',
      photo: 'photo1.jpg',
      __v: 0
    },
    {
      _id: '2',
      titulo: 'Item 2',
      descricao: 'Descrição 2',
      photo: 'photo2.jpg',
      __v: 0
    }
  ];

  const mockMeta: PaginationMeta = {
    totalItems: 10,
    itemCount: 2,
    itemsPerPage: 5,
    totalPages: 2,
    currentPage: 1
  };

  const mockApiResponse: ApiResponse = {
    items: mockItems,
    meta: mockMeta
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'delete']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ItemsTableComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsTableComponent);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Inicialização do Componente', () => {
    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve carregar items na inicialização', () => {
      mockApiService.get.and.returnValue(of(mockApiResponse));

      component.ngOnInit();

      expect(mockApiService.get).toHaveBeenCalledWith('items/pagination?page=1&limit=5');
    });

    it('deve inicializar signals com valores padrão', () => {
      expect(component.showDeleteModal()).toBe(false);
      expect(component.itemToDelete()).toBeNull();
      expect(component.deleting()).toBeNull();
    });
  });

  describe('Carregamento de Items', () => {
    it('deve carregar items com sucesso', () => {
      mockApiService.get.and.returnValue(of(mockApiResponse));

      component.loadItems(1);

      expect(component.loading).toBe(true);

      setTimeout(() => {
        expect(component.items).toEqual(mockItems);
        expect(component.meta).toEqual(mockMeta);
        expect(component.loading).toBe(false);
      }, 10);
    });

    it('deve tratar erro no carregamento', () => {
      const error = { status: 500, error: { message: 'Erro do servidor' } };
      mockApiService.get.and.returnValue(throwError(() => error));

      component.loadItems(1);

      setTimeout(() => {
        expect(component.loading).toBe(false);
      }, 10);
    });

    it('deve tratar erro de conexão', () => {
      const error = { status: 0 };
      mockApiService.get.and.returnValue(throwError(() => error));

      component.loadItems(1);

    });

    it('deve definir items vazio quando response.items é undefined', () => {
      const responseWithoutItems = { meta: mockMeta } as any;
      mockApiService.get.and.returnValue(of(responseWithoutItems));

      component.loadItems(1);

      setTimeout(() => {
        expect(component.items).toEqual([]);
      }, 10);
    });
  });

  describe('Paginação', () => {
    beforeEach(() => {
      component.meta = mockMeta;
    });

    it('deve mudar página corretamente', () => {
      spyOn(component, 'loadItems');

      component.changePage(2);

      expect(component.loadItems).toHaveBeenCalledWith(2);
    });

    it('deve gerar números de página corretamente', () => {
      component.meta = {
        ...mockMeta,
        totalPages: 10,
        currentPage: 5
      };

      const pageNumbers = component.getPageNumbers();

      expect(pageNumbers).toEqual([3, 4, 5, 6, 7]);
    });

    it('deve retornar array vazio quando há apenas 1 página', () => {
      component.meta = {
        ...mockMeta,
        totalPages: 1
      };

      const pageNumbers = component.getPageNumbers();

      expect(pageNumbers).toEqual([]);
    });

    it('deve ajustar início das páginas quando próximo do fim', () => {
      component.meta = {
        ...mockMeta,
        totalPages: 10,
        currentPage: 9
      };

      const pageNumbers = component.getPageNumbers();

      expect(pageNumbers).toEqual([6, 7, 8, 9, 10]);
    });

    it('deve retornar array vazio quando meta é null', () => {
      component.meta = null;

      const pageNumbers = component.getPageNumbers();

      expect(pageNumbers).toEqual([]);
    });
  });

  describe('Navegação', () => {
    it('deve navegar para criar item', () => {
      component.createItem();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/items/create']);
    });

    it('deve navegar para editar item', () => {
      component.editItem('123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/items', '123', 'edit']);
    });
  });

  describe('Exclusão de Items', () => {
    const itemToDelete = mockItems[0];

    it('deve abrir modal de confirmação', () => {
      component.confirmDelete(itemToDelete);

      expect(component.showDeleteModal()).toBe(true);
      expect(component.itemToDelete()).toBe(itemToDelete);
    });

    it('deve cancelar exclusão', () => {
      component.confirmDelete(itemToDelete);
      component.cancelDelete();

      expect(component.showDeleteModal()).toBe(false);
      expect(component.itemToDelete()).toBeNull();
    });

    it('deve excluir item com sucesso', () => {
      mockApiService.delete.and.returnValue(of({}));
      mockApiService.get.and.returnValue(of(mockApiResponse));
      component.itemToDelete.set(itemToDelete);
      component.meta = mockMeta;

      component.deleteItem();

      expect(component.deleting()).toBe(itemToDelete._id);
      expect(mockApiService.delete).toHaveBeenCalledWith(`items/${itemToDelete._id}`);

      setTimeout(() => {
        expect(component.deleting()).toBeNull();
        expect(component.showDeleteModal()).toBe(false);
        expect(component.itemToDelete()).toBeNull();
      }, 10);
    });

    it('deve tratar erro 404 na exclusão', () => {
      const error = { status: 404 };
      mockApiService.delete.and.returnValue(throwError(() => error));
      mockApiService.get.and.returnValue(of(mockApiResponse));
      component.itemToDelete.set(itemToDelete);

      component.deleteItem();

      setTimeout(() => {
        expect(component.deleting()).toBeNull();
        expect(component.showDeleteModal()).toBe(false);
        expect(mockApiService.get).toHaveBeenCalled(); // Deve recarregar a lista
      }, 10);
    });

    it('deve tratar erro 403 na exclusão', () => {
      const error = { status: 403 };
      mockApiService.delete.and.returnValue(throwError(() => error));
      component.itemToDelete.set(itemToDelete);

      component.deleteItem();
    });

    it('deve voltar para página anterior quando página atual fica vazia', () => {
      const metaUltimoItem = {
        ...mockMeta,
        totalItems: 6, // 6 items total
        currentPage: 2, // página 2
        itemsPerPage: 5
      };
      component.meta = metaUltimoItem;
      component.itemToDelete.set(itemToDelete);
      mockApiService.delete.and.returnValue(of({}));
      spyOn(component, 'loadItems');

      component.deleteItem();

      setTimeout(() => {
        // Após excluir 1 item, restam 5 items, que cabem em 1 página
        // Deve voltar para página 1
        expect(component.loadItems).toHaveBeenCalledWith(1);
      }, 10);
    });

    it('não deve fazer nada quando itemToDelete é null', () => {
      component.itemToDelete.set(null);

      component.deleteItem();

      expect(mockApiService.delete).not.toHaveBeenCalled();
    });
  });


  describe('Métodos Auxiliares', () => {
    it('deve gerar URL correta para foto', () => {
      const photoPath = 'test.jpg';
      const expectedUrl = 'http://localhost:3000/items/test.jpg';

      const result = component.getPhotoUrl(photoPath);

      expect(result).toBe(expectedUrl);
    });

    it('deve retornar placeholder para foto vazia', () => {
      const result = component.getPhotoUrl('');

      expect(result).toContain('data:image/svg+xml;base64');
    });

    it('deve tratar erro de imagem', () => {
      const mockEvent = {
        target: { src: '' }
      };

      component.onImageError(mockEvent);

      expect(mockEvent.target.src).toContain('data:image/svg+xml;base64');
    });

    it('deve usar trackBy corretamente para items', () => {
      const item = mockItems[0];
      const result = component.trackByItemId(0, item);

      expect(result).toBe(item._id);
    });

    it('deve usar trackBy corretamente para páginas', () => {
      const result = component.trackByPageNumber(0, 5);

      expect(result).toBe(5);
    });
  });

  describe('Renderização do Template', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.meta = mockMeta;
      component.loading = false;
      fixture.detectChanges();
    });

    it('deve renderizar título do componente', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('h2').textContent).toContain('Items');
    });

    it('deve exibir botão de novo item', () => {
      const compiled = fixture.nativeElement;
      const newItemBtn = compiled.querySelector('button');
      expect(newItemBtn.textContent).toContain('Novo Item');
    });

    it('deve exibir total de items', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Total: 10 items');
    });

    it('deve renderizar tabela com items', () => {
      const compiled = fixture.nativeElement;
      const table = compiled.querySelector('.items-table');
      const rows = compiled.querySelectorAll('.table-row');

      expect(table).toBeTruthy();
      expect(rows.length).toBe(2);
    });

    it('deve exibir estado vazio quando não há items', () => {
      component.items = [];
      component.meta = { ...mockMeta, totalItems: 0 };
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.empty-state')).toBeTruthy();
      expect(compiled.textContent).toContain('Nenhum item cadastrado');
    });

    it('deve exibir loading durante carregamento', () => {
      component.loading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.loading')).toBeTruthy();
      expect(compiled.querySelector('.spinner')).toBeTruthy();
    });

    it('deve exibir paginação quando há mais de 1 página', () => {
      const compiled = fixture.nativeElement;
      const pagination = compiled.querySelector('.pagination');

      expect(pagination).toBeTruthy();
      expect(compiled.textContent).toContain('1 de 2');
    });

    it('deve exibir botões de ação para cada item', () => {
      const compiled = fixture.nativeElement;
      const actionButtons = compiled.querySelectorAll('.action-buttons');

      expect(actionButtons.length).toBe(2);

      const firstRowButtons = actionButtons[0].querySelectorAll('button');
      expect(firstRowButtons.length).toBe(3); // visualizar, editar, excluir
    });

    it('deve exibir modal de confirmação quando ativo', () => {
      component.showDeleteModal.set(true);
      component.itemToDelete.set(mockItems[0]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const modal = compiled.querySelector('.modal-overlay');

      expect(modal).toBeTruthy();
      expect(compiled.textContent).toContain('Confirmar Exclusão');
      expect(compiled.textContent).toContain(mockItems[0].titulo);
    });

    it('deve desabilitar botões de paginação adequadamente', () => {
      component.meta = { ...mockMeta, currentPage: 1 };
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const previousBtn = compiled.querySelector('.btn-pagination');

      expect(previousBtn.disabled).toBe(true);
    });
  });

  describe('Interações do Usuário', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.meta = mockMeta;
      component.loading = false;
      fixture.detectChanges();
    });

    it('deve chamar createItem quando botão novo item é clicado', () => {
      spyOn(component, 'createItem');

      const compiled = fixture.nativeElement;
      const newItemBtn = compiled.querySelector('button');
      newItemBtn.click();

      expect(component.createItem).toHaveBeenCalled();
    });

    it('deve chamar changePage quando botão de página é clicado', () => {
      spyOn(component, 'changePage');

      const compiled = fixture.nativeElement;
      const pageBtn = compiled.querySelector('.btn-page');
      pageBtn.click();

      expect(component.changePage).toHaveBeenCalled();
    });

    it('deve abrir modal ao clicar em excluir', () => {
      spyOn(component, 'confirmDelete');

      const compiled = fixture.nativeElement;
      const deleteBtn = compiled.querySelector('.btn-danger');
      deleteBtn.click();

      expect(component.confirmDelete).toHaveBeenCalled();
    });

    it('deve fechar modal ao clicar em cancelar', () => {
      component.showDeleteModal.set(true);
      component.itemToDelete.set(mockItems[0]);
      fixture.detectChanges();

      spyOn(component, 'cancelDelete');

      const compiled = fixture.nativeElement;
      const cancelBtn = compiled.querySelector('.btn-secondary');
      cancelBtn.click();

      expect(component.cancelDelete).toHaveBeenCalled();
    });

    it('deve confirmar exclusão ao clicar em confirmar', () => {
      component.showDeleteModal.set(true);
      component.itemToDelete.set(mockItems[0]);
      fixture.detectChanges();

      spyOn(component, 'deleteItem');

      const compiled = fixture.nativeElement;
      const confirmBtn = compiled.querySelector('.modal-actions .btn-danger');
      confirmBtn.click();

      expect(component.deleteItem).toHaveBeenCalled();
    });
  });

  describe('Ciclo de Vida do Componente', () => {
    it('deve chamar destroy$ no ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
