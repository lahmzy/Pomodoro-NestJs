import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "src/auth/dto/create-user.dto";


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}


  async createUser(user: CreateUserDto) {
    const newUser = this.userRepository.create(user);
    return await this.userRepository.save(newUser);
  }

  async findUserByEmail(email:string):Promise<User | null>{
    return await this.userRepository.findOne({where:{email}});
  }

}
