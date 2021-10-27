import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from './entities/post-entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User, Post])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
