import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository {
  private repository;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(User);
  }

  async CreateUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.repository.create({ username, password: hashedPassword });

    try {
      await this.repository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.repository.findOne({ where: { username } });
  }
}
