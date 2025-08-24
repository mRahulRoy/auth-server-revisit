import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;
    @Column()
    role: string;

    constructor(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        role: string,
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}
