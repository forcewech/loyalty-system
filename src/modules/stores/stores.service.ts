import { Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresRepository } from './stores.repository';

@Injectable()
export class StoresService {
  constructor(private storesRepository: StoresRepository) {}

  async create(body: CreateStoreDto) {
    const payload = body;
    const store = await this.storesRepository.create({ ...payload });
    return {
      store
    };
  }

  async findAll() {
    return this.storesRepository.find();
  }

  async findOne(id: number) {
    return this.storesRepository.findOne({
      where: {
        id
      }
    });
  }

  async update(id: number, body: UpdateStoreDto) {
    const payload = body;
    const updateStore = await this.storesRepository.update(
      {
        ...payload
      },
      {
        where: {
          id
        }
      }
    );
    return {
      updateStore
    };
  }

  async remove(id: number) {
    return this.storesRepository.delete({
      where: {
        id
      }
    });
  }
}
