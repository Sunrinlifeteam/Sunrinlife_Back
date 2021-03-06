import { Inject, Injectable } from '@decorators/di';
import { UploadBody } from '../types/upload';
import { AttachmentEntity } from '../entities/Attachment';
import { copyFile, readFile, unlink } from 'fs';
import path from 'path';
import { MD5, SHA1 } from '../modules/hash';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/User';
import { IUser } from '../types/user';
import logger from '../modules/logger';

@Injectable()
export class UploadService {
    constructor(
        @Inject(AttachmentEntity)
        private readonly attachmentRepository: Repository<AttachmentEntity>,
        @Inject(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async list(offset: number = 0, limit: number = 25) {
        const records = await this.attachmentRepository.find({
            order: {
                id: 'ASC',
            },
            skip: offset,
            take: limit,
        });
        return records;
    }

    async info(id: string) {
        const record = await this.attachmentRepository.findOne({ id });
        return record;
    }

    async delete(userData: IUser, id: string) {
        const user = await this.userRepository.findOne(userData);
        const record = await this.attachmentRepository.findOne({ id });
        if (record && user && record?.author.id == user?.id)
            return await this.attachmentRepository.remove(record);
        return new Error();
    }

    async upload(
        userData: IUser,
        // eslint-disable-next-line no-undef
        file: Express.Multer.File,
        body: UploadBody
    ): Promise<AttachmentEntity> {
        const UPLOAD_PATH = process.env.UPLOAD_PATH || './data';
        return new Promise((resolve, reject) =>
            readFile(path.resolve(process.cwd(), file.path), (err, data) => {
                if (err) return reject(err);
                copyFile(
                    file.path,
                    path.resolve(UPLOAD_PATH, SHA1(data)),
                    async (err) => {
                        unlink(file.path, (err) => err && logger.error(err));
                        if (err) return reject(err);
                        let prev = await this.attachmentRepository.findOne({
                            where: {
                                sha1hash: SHA1(data),
                                md5hash: MD5(data),
                            },
                        });
                        if (prev) return resolve(prev);
                        let user = await this.userRepository.findOne(userData);
                        if (!user) return reject();
                        let record = this.attachmentRepository.create();
                        record.author = user;
                        record.filename = file.originalname;
                        record.path = UPLOAD_PATH;
                        record.mimetype = body.mimetype;
                        record.sha1hash = SHA1(data);
                        record.md5hash = MD5(data);
                        resolve(await this.attachmentRepository.save(record));
                    }
                );
            })
        );
    }
}
