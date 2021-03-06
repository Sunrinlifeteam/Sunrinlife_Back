import {
    Entity,
    Column,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import path from 'path';
import { UserEntity } from './User';
import { Injectable } from '@decorators/di';

@Entity('attachment')
@Injectable()
export class AttachmentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    filename: string;

    @Column({ nullable: false })
    path: string;

    @Column({ nullable: false, unique: true })
    sha1hash: string;

    @Column({ nullable: false, unique: true })
    md5hash: string;

    @Column({ nullable: false })
    mimetype: string;

    @ManyToOne(() => UserEntity, (user) => user.id)
    author: UserEntity;

    getPath(): string {
        return path.resolve(process.cwd(), this.path, this.sha1hash);
    }
}
