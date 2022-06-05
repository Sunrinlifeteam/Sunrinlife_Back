import { Inject, Injectable } from '@decorators/di';
import { Like, Repository } from 'typeorm';
import HttpStatusCode from '../constants/HttpStatusCode';
import {
    AnonymousBoardEntity,
    AttachmentEntity,
    NamedBoardEntity,
    UserEntity,
} from '../entities';
import * as Board from '../types/board';
import { IUser } from '../types/user';

@Injectable()
export class NamedBoardService {
    constructor(
        @Inject(NamedBoardEntity)
        private readonly boardRepository: Repository<NamedBoardEntity>,
        @Inject(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject(AttachmentEntity)
        private readonly attachmentRepository: Repository<AttachmentEntity>
    ) {}

    async count(option: Board.DataOption): Promise<Board.WorkResult> {
        const { title } = option;
        const count = await this.boardRepository.count({
            where: {
                ...(title && { title: Like(`%${option.title}%`) }),
            },
        });
        return {
            status: HttpStatusCode.OK,
            data: count,
        };
    }

    async delete(userData: IUser, id: number): Promise<Board.WorkResult> {
        const user = await this.userRepository.findOne(userData);
        if (!user) throw new Error('Unauthorization');
        const result = await this.boardRepository.delete({
            id,
            author: user,
        });
        return {
            status: HttpStatusCode.NO_CONTENT,
        };
    }

    async find(
        option: Partial<Board.Body> & Board.SearchOption
    ): Promise<Board.WorkResult> {
        const { orderType, sort, title, content, range } = option;
        const data = await this.boardRepository.find({
            order: {
                [orderType]: sort,
            },
            where: {
                ...(title && { title: Like(`%${title}%`) }),
                ...(content && { title: Like(`%${content}%`) }),
            },
            skip: (range.count - 1) * range.offset,
            take: range.count,
        });
        return {
            status: HttpStatusCode.OK,
            data,
        };
    }

    async findAndCount(
        option: Board.SearchOption & Board.DataOption
    ): Promise<Board.WorkResult> {
        const { orderType, sort, title, content, range } = option;
        const dataAndCount = await this.boardRepository.findAndCount({
            order: {
                [orderType]: sort,
            },
            where: {
                ...(title && { title: Like(`%${title}%`) }),
                ...(content && { title: Like(`%${content}%`) }),
            },
            skip: (range.count - 1) * range.offset,
            take: range.count,
        });
        return {
            status: HttpStatusCode.OK,
            data: dataAndCount,
        };
    }

    async findById(id: number): Promise<Board.WorkResult> {
        const board = await this.boardRepository.findOne(id, {
            relations: ['attachments'],
        });
        return {
            status: HttpStatusCode.OK,
            data: board,
        };
    }

    async hotsunrin(count: number = 4): Promise<Board.WorkResult> {
        const data = await this.boardRepository.find({
            order: {
                likes: 'DESC',
            },
            take: count,
        });
        return {
            status: HttpStatusCode.OK,
            data,
        };
    }

    async recommend(userData: IUser, id: number): Promise<Board.WorkResult> {
        const user = await this.userRepository.findOne(userData);
        if (!user) throw new Error('Unauthorization');
        const board = await this.boardRepository.findOne(id, {
            relations: ['likedUsers'],
        });
        if (!board)
            return {
                status: HttpStatusCode.NOT_FOUND,
                data: { success: false, message: 'Article not found' },
            };

        let likedUsers = board.likedUsers || [];
        let likes = board.likes;

        if (board.likedUsers?.some((x: UserEntity) => x.id === user.id))
            likedUsers = likedUsers.filter((x: UserEntity) => x.id !== user.id);
        else likedUsers.push(user);
        await this.boardRepository.update(id, {
            likes,
            likedUsers,
        });
        return {
            status: HttpStatusCode.NO_CONTENT,
        };
    }

    async update(
        userData: IUser,
        id: number,
        body: Partial<Board.Body>
    ): Promise<Board.WorkResult> {
        const user = await this.userRepository.findOne(userData);
        if (!user) throw new Error('Unauthorization');
        const { title, content } = body;
        const attachments = body.attachments
            ? await this.attachmentRepository.findByIds(body.attachments)
            : [];
        const result = await this.boardRepository.update(
            {
                id,
                author: user,
            },
            {
                title,
                content,
                attachments,
                author: user,
            }
        );
        return {
            status: HttpStatusCode.OK,
            data: result,
        };
    }

    async write(userData: IUser, body: Board.Body): Promise<Board.WorkResult> {
        const user = await this.userRepository.findOne(userData);
        if (!user) throw new Error('Unauthorization');
        const { title, content } = body;
        const attachments = await this.attachmentRepository.findByIds(
            body.attachments
        );
        const board = this.boardRepository.create({
            title,
            content,
            attachments,
            author: user,
        });
        const result = await this.boardRepository.save(board);
        return {
            status: HttpStatusCode.CREATED,
            data: result,
        };
    }
}

@Injectable()
export class AnonymousBoardService {
    constructor(
        @Inject(AnonymousBoardEntity)
        private readonly boardRepository: Repository<AnonymousBoardEntity>,
        @Inject(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject(AttachmentEntity)
        private readonly attachmentRepository: Repository<AttachmentEntity>
    ) {}

    async count(option: Board.DataOption): Promise<Board.WorkResult> {
        const { title } = option;
        const count = await this.boardRepository.count({
            where: {
                ...(title && { title: Like(`%${option.title}%`) }),
            },
        });
        return {
            status: HttpStatusCode.OK,
            data: count,
        };
    }

    async delete(userData: IUser, id: number): Promise<Board.WorkResult> {
        const user = await this.userRepository.findOne(userData);
        if (!user) throw new Error('Unauthorization');
        const result = await this.boardRepository.delete({
            id,
            author: user,
        });
        return {
            status: HttpStatusCode.NO_CONTENT,
        };
    }

    async find(
        option: Partial<Board.Body> & Board.SearchOption
    ): Promise<Board.WorkResult> {
        const { orderType, sort, title, content, range } = option;
        const data = await this.boardRepository.find({
            order: {
                [orderType]: sort,
            },
            where: {
                ...(title && { title: Like(`%${title}%`) }),
                ...(content && { title: Like(`%${content}%`) }),
            },
            skip: (range.count - 1) * range.offset,
            take: range.count,
        });
        return {
            status: HttpStatusCode.OK,
            data,
        };
    }

    async findAndCount(
        option: Board.SearchOption & Board.DataOption
    ): Promise<Board.WorkResult> {
        const { orderType, sort, title, content, range } = option;
        const dataAndCount = await this.boardRepository.findAndCount({
            order: {
                [orderType]: sort,
            },
            where: {
                ...(title && { title: Like(`%${title}%`) }),
                ...(content && { title: Like(`%${content}%`) }),
            },
            skip: (range.count - 1) * range.offset,
            take: range.count,
        });
        return {
            status: HttpStatusCode.OK,
            data: dataAndCount,
        };
    }

    async findById(id: number): Promise<Board.WorkResult> {
        const board = await this.boardRepository.findOne(id);
        return {
            status: HttpStatusCode.OK,
            data: board,
        };
    }

    async hotsunrin(count: number = 4): Promise<Board.WorkResult> {
        const data = await this.boardRepository.find({
            order: {
                likes: 'DESC',
            },
            take: count,
        });
        return {
            status: HttpStatusCode.OK,
            data,
        };
    }

    async recommend(userData: IUser, id: number): Promise<Board.WorkResult> {
        const user = await this.userRepository.findOne(userData);
        if (!user) throw new Error('Unauthorization');
        const board = await this.boardRepository.findOne(id, {
            relations: ['likedUsers'],
        });
        if (!board)
            return {
                status: HttpStatusCode.NOT_FOUND,
                data: { success: false, message: 'Article not found' },
            };

        let likedUsers = board.likedUsers || [];
        let likes = board.likes;

        if (board.likedUsers?.some((x: UserEntity) => x.id === user.id))
            likedUsers = likedUsers.filter((x: UserEntity) => x.id !== user.id);
        else likedUsers.push(user);
        await this.boardRepository.update(id, {
            likes,
            likedUsers,
        });
        return {
            status: HttpStatusCode.NO_CONTENT,
        };
    }

    async update(
        userData: IUser,
        id: number,
        body: Partial<Board.Body>
    ): Promise<Board.WorkResult> {
        const user = await this.userRepository.findOne(userData);
        if (!user) throw new Error('Unauthorization');
        const { title, content } = body;
        const attachments = body.attachments
            ? await this.attachmentRepository.findByIds(body.attachments)
            : [];
        const result = await this.boardRepository.update(
            {
                id,
                author: user,
            },
            {
                title,
                content,
                attachments,
                author: user,
            }
        );
        return {
            status: HttpStatusCode.OK,
            data: result,
        };
    }

    async write(userData: IUser, body: Board.Body): Promise<Board.WorkResult> {
        const user = await this.userRepository.findOne(userData);
        if (!user) throw new Error('Unauthorization');
        const { title, content } = body;
        const attachments = await this.attachmentRepository.findByIds(
            body.attachments
        );
        const board = this.boardRepository.create({
            title,
            content,
            attachments,
            author: user,
        });
        const result = await this.boardRepository.save(board);
        return {
            status: HttpStatusCode.CREATED,
            data: result,
        };
    }
}
