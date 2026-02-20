import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('contacts')
@Index('idx_contacts_phone', ['phone'], { unique: true })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'first_name' })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'last_name' })
  lastName!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'company_name' })
  companyName!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'int', default: 0, name: 'call_count' })
  callCount!: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_call_at' })
  lastCallAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
