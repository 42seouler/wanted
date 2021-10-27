import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  async findOne(name: string) {
    return await User.findByName(name);
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await User.findByName(createUserDto.username);
    if (existingUser) {
      throw new HttpException(
        '중복 된 사용자 아이디입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const encodedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: encodedPassword,
    });
    return this.userRepository.save(user);
  }
}
