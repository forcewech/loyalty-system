import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { EncryptHelper } from 'src/utils';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(body: CreateUserDto) {
    const payload = body;
    const hashPassword = await EncryptHelper.hash(payload.password);
    const user = await this.usersRepository.create({ ...payload, password: hashPassword });
    return {
      user
    };
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({
      where: {
        id
      }
    });
  }

  async update(id: number, body: UpdateUserDto) {
    const payload = body.password ? { ...body, password: await EncryptHelper.hash(body.password) } : body;
    const updateUser = await this.usersRepository.update(
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
      updateUser
    };
  }

  async remove(id: number) {
    return this.usersRepository.delete({
      where: {
        id
      }
    });
  }
}
