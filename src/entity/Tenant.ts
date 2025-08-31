import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tenants' })
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name: string;

    @Column()
    address: string;
}
