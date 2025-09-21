import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Item } from './entities/itens.entity';
import { Model } from 'mongoose';
import { CreateItemDto, ItemPagination, UpdateItemDto } from './dto/itens.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ItensService {
  constructor(
    @InjectModel(Item.name) private readonly itemModel: Model<Item>
  ) { }
  async pagination(body: ItemPagination) {
    const {
      page,
      limit,
      titulo
    } = body;


    const skip = (page - 1) * limit;
    const query: any = {
    };

    if (titulo !== "") {
      query.titulo = { $regex: `${titulo}`, $options: 'i' };
    }

    const items = await this.itemModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    const totalItems = await this.itemModel.countDocuments();

    return {
      items: items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page
      }
    }
  }

  async findById(id: string) {
    const item = await this.itemModel.findById(id);
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }
    return item;
  }

  async create(params: CreateItemDto) {
    try {

      const savedItem = await this.itemModel.create({
        titulo: params.titulo,
        descricao: params.descricao,
        photo: params.photoOriginalName,
      });

      return {
        success: true,
        message: 'Item criado com sucesso',
        data: savedItem
      };

    } catch (error) {
      throw new BadRequestException('Erro ao criar item: ' + error.message);
    }
  }

  async getItemPhoto(filename: string): Promise<Buffer> {
    try {
      const filePath = path.join('uploads/items', filename);
      return await fs.readFile(filePath);
    } catch (error) {
      throw new BadRequestException('Arquivo não encontrado');
    }
  }

  async update(id: string, params: UpdateItemDto) {
    try {
      const existingItem = await this.itemModel.findById(id);
      if (!existingItem) {
        throw new NotFoundException('Item não encontrado');
      }

      // Se atualizar a foto, deletar a antiga
      if (params.photoOriginalName && existingItem.photo) {
        await this.deletePhotoFile(existingItem.photo);
      }

      const updateData: any = {
        titulo: params.titulo,
        descricao: params.descricao,
      };

      if (params.photoOriginalName) {
        updateData.photo = params.photoOriginalName;
      }

      const updatedItem = await this.itemModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      return {
        success: true,
        message: 'Item atualizado com sucesso',
        data: updatedItem
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar item: ' + error.message);
    }
  }

  async delete(id: string) {
    try {
      const item = await this.itemModel.findById(id);
      if (!item) {
        throw new NotFoundException('Item não encontrado');
      }

      if (item.photo) {
        await this.deletePhotoFile(item.photo);
      }

      await this.itemModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Item deletado com sucesso'
      };
    } catch (error) {
      throw new NotFoundException('Item não encontrado');
    }
  }

  private async deletePhotoFile(filename: string) {
    try {
      const filePath = path.join('./src/itens/uploads/items', filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Arquivo ${filename} não encontrado para deletar`);
    }
  }
}
