import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post-entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    const posts = await this.postRepository.find({
      relations: ['author'],
      skip: offset * limit,
      take: limit,
    });
    const result = posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        author: post.author.username,
        content: post.content,
        createdAt: post.createdAt,
        UpdatedAt: post.UpdatedAt,
      };
    });
    const totalElements = await this.postRepository.count();
    const totalPage = Math.round(totalElements / limit);
    return {
      pageable: {
        totalElements: totalElements,
        totalPage: totalPage,
        pageSize: +limit,
        offset: offset,
      },
      data: result,
    };
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne(id, {
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    return {
      id: post.id,
      title: post.title,
      author: post.author.username,
      content: post.content,
      createdAt: post.createdAt,
      UpdatedAt: post.UpdatedAt,
    };
  }

  async create(createPostDto: CreatePostDto, user: any) {
    const author = await this.userRepository.findOne(user.userId);
    const post = this.postRepository.create({
      ...createPostDto,
      author: author,
    });
    const result = await this.postRepository.save(post);
    return {
      ...result,
      author: result.author.username,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: any) {
    const post = await this.postRepository.findOne(id, {
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    if (user.userId !== post.author.userId) {
      throw new BadRequestException('게시글은 작성자만 수정 할 수 있습니다.');
    }
    const updatePost = {
      ...post,
      ...updatePostDto,
    };
    const result = await this.postRepository.save(updatePost);
    return {
      id: result.id,
      title: result.title,
      author: result.author.username,
      content: result.content,
      createdAt: result.createdAt,
      UpdatedAt: result.UpdatedAt,
    };
  }

  async remove(id: string, user: any) {
    const post = await this.postRepository.findOne(id, {
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    if (user.userId !== post.author.userId) {
      throw new BadRequestException('게시글은 작성자만 삭제 할 수 있습니다.');
    }
    const deletePost = await this.postRepository.remove(post);
    return {
      title: deletePost.title,
      author: deletePost.author.username,
      content: deletePost.content,
      createdAt: deletePost.createdAt,
      UpdatedAt: deletePost.UpdatedAt,
    };
  }
}
