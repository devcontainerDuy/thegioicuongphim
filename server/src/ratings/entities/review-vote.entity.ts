import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Ensure User has votes relation if needed, or mostly mapped via userId here?
import { Rating } from './rating.entity';

@Entity('review_vote')
@Index(['ratingId', 'userId'], { unique: true })
export class ReviewVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ratingId: number;

  @ManyToOne(() => Rating, (rating) => rating.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ratingId' })
  rating: Rating;

  @Column()
  userId: number;

  // Assuming User might not need explicit relation to votes array unless requested, but good practice to link it if schema had it.
  // Schema didn't explicitly show `votes` on User, let's double check step 21.
  // Step 21: User model has `ratings Rating[]`. ReviewVote has `user User`.
  // Wait, ReviewVote has `userId Int` and `rating Rating`, but strangely schema didn't link `user` relation in `ReviewVote` model block in step 21?
  // Let me re-read step 21 `ReviewVote` model.
  // `model ReviewVote`: id, ratingId, userId, rating (relation), createdAt. No `user` relation!
  // Just `userId Int`.
  // So I'll keep it as just column userId unless I want to enforce FK. Typically we should enforce FK.
  // But if schema didn't have it, Prisma wouldn't enforce it at DB level via FK relation.
  // However, linking it is better. I'll stick to schema: just userId column for now or add relation if logical.
  // Actually, keeping it as just column is safer if I don't modify User entity to add `votes`.
}
