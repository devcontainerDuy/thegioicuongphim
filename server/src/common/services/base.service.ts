import {
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseService<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async findById(id: string | number): Promise<T> {
    const options: FindOneOptions<T> = {
      where: { id } as unknown as FindOptionsWhere<T>,
    };
    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    id: string | number,
    data: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
  }

  async softRemove(id: string | number): Promise<void> {
    const result = await this.repository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
  }
}
