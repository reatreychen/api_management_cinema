import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }
  async create(dto: CreateUserDto) {
    try {
      const user = await this.userModel.create(dto);

      if (!user) {
        throw new HttpException('User not created', 400);
      }

      // hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      if (!hashedPassword) {
        throw new HttpException('Password not hashed', 400);
      }

      user.password = hashedPassword;

      const savedUser = await user.save();
      if (!savedUser) {
        throw new HttpException('User not saved', 400);
      }

      return {
        message: 'User created successfully',
        data: savedUser,
        success: true
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }

  }

  async findAll() {
    try {
      const users = await this.userModel.find();
      if (!users) {
        throw new HttpException('Users not found', 404);
      }
      return {
        message: 'Users fetched successfully',
        data: users,
        success: true
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      return {
        message: 'User fetched successfully',
        data: user,
        success: true
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        return null;
      }
      return {
        message: 'User fetched successfully',
        data: user,
        success: true
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      return {
        message: 'User updated successfully',
        data: user,
        success: true
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userModel.findByIdAndDelete(id);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      return {
        message: 'User deleted successfully',
        data: user,
        success: true
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  // compare hashed password
  async compareHash(text: string, hash: string) {
    try {
      return await bcrypt.compare(text, hash);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    return this.userModel.updateOne({ _id: userId }, { refreshToken });
  }
}
