// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()

export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName:string

  @Column()
  lastName:string

}