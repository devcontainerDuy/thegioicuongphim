import { Entity, Column, UpdateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('setting')
export class Setting {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'string' })
  type: string; // "string", "boolean", "number"

  @UpdateDateColumn()
  updatedAt: Date;
}
