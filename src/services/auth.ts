import { Injectable, Inject } from '@decorators/di';
import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { UserEntity, USER_SELECT } from '../entities/User';
import { IUser } from '../types/user';

@Injectable()
export class AuthService {
    constructor(
        @Inject(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async createAndGetUser(user: IUser): Promise<UserEntity> {
        const newUser = this.userRepository.create(user);
        return await this.userRepository.save(newUser);
    }

    async updateAndGetUser(user: UserEntity): Promise<UserEntity | undefined> {
        await this.userRepository.update(user.id, user);
        return await this.getUserById(user.id);
    }

    async getUserById(id: string, relations: string[] = []) {
        return await this.userRepository.findOne({
            where: { id },
            select: USER_SELECT,
            relations,
        });
    }

    async getUserByEmail(email: string, relations: string[] = []) {
        return await this.userRepository.findOne({
            where: { email },
            select: USER_SELECT,
            relations,
        });
    }

    createAndGetAccessTokenByUserId(id: string): string {
        return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET!, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN!,
        });
    }

    async createAndGetRefreshTokenByUserId(id: string): Promise<string> {
        const refreshToken = jwt.sign(
            { id },
            process.env.REFRESH_TOKEN_SECRET!,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN!,
            }
        );
        await this.userRepository.update(id, { refreshToken });
        return refreshToken;
    }

    async removeRefreshTokenByUserId(id: string): Promise<void> {
        await this.userRepository.update(id, { refreshToken: null as any });
    }
}
