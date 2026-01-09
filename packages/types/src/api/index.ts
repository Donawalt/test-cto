import { z } from 'zod';
import type { User, Post, Comment, PaginatedResponse } from '../db';

export namespace API {
  export namespace Endpoints {
    export const USERS = '/api/users' as const;
    export const POSTS = '/api/posts' as const;
    export const COMMENTS = '/api/comments' as const;
    export const AUTH = '/api/auth' as const;
  }

  export namespace Validators {
    export const CreateUserSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1).max(100),
      password: z.string().min(8).max(100),
    });

    export const UpdateUserSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
    });

    export const CreatePostSchema = z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      published: z.boolean().default(false),
    });

    export const UpdatePostSchema = z.object({
      title: z.string().min(1).max(200).optional(),
      content: z.string().min(1).optional(),
      published: z.boolean().optional(),
    });

    export const CreateCommentSchema = z.object({
      content: z.string().min(1).max(1000),
      postId: z.string().uuid(),
    });

    export const LoginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });

    export const PaginationSchema = z.object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    });
  }

  export namespace Requests {
    export type CreateUser = z.infer<typeof Validators.CreateUserSchema>;
    export type UpdateUser = z.infer<typeof Validators.UpdateUserSchema>;
    export type CreatePost = z.infer<typeof Validators.CreatePostSchema>;
    export type UpdatePost = z.infer<typeof Validators.UpdatePostSchema>;
    export type CreateComment = z.infer<typeof Validators.CreateCommentSchema>;
    export type Login = z.infer<typeof Validators.LoginSchema>;
    export type Pagination = z.infer<typeof Validators.PaginationSchema>;
  }

  export namespace Responses {
    export interface Success<T> {
      success: true;
      data: T;
    }

    export interface Error {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    }

    export type Result<T> = Success<T> | Error;

    export type UserResponse = Result<User>;
    export type UsersResponse = Result<PaginatedResponse<User>>;
    export type PostResponse = Result<Post>;
    export type PostsResponse = Result<PaginatedResponse<Post>>;
    export type CommentResponse = Result<Comment>;
    export type CommentsResponse = Result<PaginatedResponse<Comment>>;

    export type AuthResponse = Result<{
      token: string;
      user: User;
    }>;
  }
}
