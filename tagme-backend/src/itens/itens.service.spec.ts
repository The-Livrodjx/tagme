import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ItensService } from './itens.service';
import { Item } from './entities/itens.entity';
import * as fs from 'fs/promises';


// NOTA: PARA RODAR CORRETAMENTE ESSE CASE DE TESTES VOCÊ TERÁ QUE AJUSTAR OS PATHS DAS IMAGENS
// Mock do fs
jest.mock('fs/promises');
jest.mock('../utils/process-image');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ItensService', () => {
  let service: ItensService;
  let model: jest.Mocked<Model<Item>>;

  const mockItem = {
    _id: '507f1f77bcf86cd799439011',
    titulo: 'Teste Item',
    descricao: 'Descrição teste',
    photo: 'test-photo.jpg',
    save: jest.fn(),
  };

  const mockItemModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItensService,
        {
          provide: getModelToken(Item.name),
          useValue: mockItemModel,
        },
      ],
    }).compile();

    service = module.get<ItensService>(ItensService);
    model = module.get<Model<Item>>(getModelToken(Item.name)) as jest.Mocked<Model<Item>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('pagination', () => {
    it('deve retornar items paginados sem filtro', async () => {
      const mockItems = [mockItem];
      const paginationParams = { page: 1, limit: 10, titulo: '' };

      model.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockItems),
      } as any);
      model.countDocuments.mockResolvedValue(1);

      const result = await service.pagination(paginationParams);

      expect(result).toEqual({
        items: mockItems,
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      });
      expect(model.find).toHaveBeenCalledWith({});
    });

    it('deve retornar items paginados com filtro de título', async () => {
      const mockItems = [mockItem];
      const paginationParams = { page: 1, limit: 10, titulo: 'teste' };

      model.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockItems),
      } as any);
      model.countDocuments.mockResolvedValue(1);

      const result = await service.pagination(paginationParams);

      expect(result.items).toEqual(mockItems);
      expect(model.find).toHaveBeenCalledWith({
        titulo: { $regex: 'teste', $options: 'i' },
      });
    });
  });

  describe('create', () => {
    it('deve criar um item com sucesso', async () => {
      const createDto = {
        titulo: 'Novo Item',
        descricao: 'Nova descrição',
        photoOriginalName: 'new-photo.jpg',
      };

      model.create.mockResolvedValue(mockItem as any);

      const result = await service.create(createDto);

      expect(result).toEqual({
        success: true,
        message: 'Item criado com sucesso',
        data: mockItem,
      });
      expect(model.create).toHaveBeenCalledWith({
        titulo: createDto.titulo,
        descricao: createDto.descricao,
        photo: createDto.photoOriginalName,
      });
    });

    it('deve lançar BadRequestException em caso de erro', async () => {
      const createDto = {
        titulo: 'Novo Item',
        descricao: 'Nova descrição',
        photoOriginalName: 'new-photo.jpg',
      };

      model.create.mockRejectedValue(new Error('Erro no banco'));

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('deve atualizar um item com sucesso', async () => {
      const updateDto = {
        titulo: 'Item Atualizado',
        descricao: 'Descrição atualizada',
        photoOriginalName: 'updated-photo.jpg',
      };

      model.findById.mockResolvedValue(mockItem);
      model.findByIdAndUpdate.mockResolvedValue({ ...mockItem, ...updateDto });
      mockFs.unlink.mockResolvedValue(undefined);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual({
        success: true,
        message: 'Item atualizado com sucesso',
        data: { ...mockItem, ...updateDto },
      });
    });

    it('deve lançar NotFoundException se item não existir', async () => {
      model.findById.mockResolvedValue(null);

      await expect(
        service.update('507f1f77bcf86cd799439011', {
          titulo: 'Teste',
          descricao: 'Teste',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar sem foto nova', async () => {
      const updateDto = {
        titulo: 'Item Atualizado',
        descricao: 'Descrição atualizada',
      };

      model.findById.mockResolvedValue(mockItem);
      model.findByIdAndUpdate.mockResolvedValue({ ...mockItem, ...updateDto });

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result.success).toBe(true);
      expect(mockFs.unlink).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar um item com sucesso', async () => {
      model.findById.mockResolvedValue(mockItem);
      model.findByIdAndDelete.mockResolvedValue(mockItem);
      mockFs.unlink.mockResolvedValue(undefined);

      const result = await service.delete('507f1f77bcf86cd799439011');

      expect(result).toEqual({
        success: true,
        message: 'Item deletado com sucesso',
      });
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('deve lançar NotFoundException se item não existir', async () => {
      model.findById.mockResolvedValue(null);

      await expect(service.delete('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException
      );
    });

    it('deve deletar item sem foto', async () => {
      const itemWithoutPhoto = { ...mockItem, photo: null };
      model.findById.mockResolvedValue(itemWithoutPhoto);
      model.findByIdAndDelete.mockResolvedValue(itemWithoutPhoto);

      const result = await service.delete('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(mockFs.unlink).not.toHaveBeenCalled();
    });
  });

  describe('getItemPhoto', () => {
    it('deve retornar buffer da foto', async () => {
      const mockBuffer = Buffer.from('test image data');
      mockFs.readFile.mockResolvedValue(mockBuffer);

      const result = await service.getItemPhoto('processed-1758474665559-4d80571454aded7971e15d07a3cd10a0.jpg');

      expect(result).toEqual(mockBuffer);
    });

    it('deve lançar BadRequestException se arquivo não existir', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(service.getItemPhoto('nonexistent.jpg')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('deletePhotoFile', () => {
    it('deve deletar arquivo sem erro', async () => {
      mockFs.unlink.mockResolvedValue(undefined);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service['deletePhotoFile']('test-photo.jpg');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('deve logar warning se arquivo não existir', async () => {
      mockFs.unlink.mockRejectedValue(new Error('File not found'));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service['deletePhotoFile']('nonexistent.jpg');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Arquivo nonexistent.jpg não encontrado para deletar'
      );

      consoleSpy.mockRestore();
    });
  });
});