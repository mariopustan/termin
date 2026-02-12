import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { BookingStatus, ProductInterest } from '../interfaces/booking-status.enum';

@Entity('bookings')
@Index('idx_bookings_unique_active_slot', ['slotStart'], {
  unique: true,
  where: "status != 'cancelled' AND deleted_at IS NULL",
})
@Index('idx_bookings_status', ['status'])
@Index('idx_bookings_email', ['prospectEmail'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamptz', name: 'slot_start' })
  slotStart!: Date;

  @Column({ type: 'timestamptz', name: 'slot_end' })
  slotEnd!: Date;

  @Column({ type: 'varchar', length: 100, name: 'prospect_first_name' })
  prospectFirstName!: string;

  @Column({ type: 'varchar', length: 100, name: 'prospect_last_name' })
  prospectLastName!: string;

  @Column({ type: 'varchar', length: 200, name: 'prospect_company' })
  prospectCompany!: string;

  @Column({ type: 'varchar', length: 255, name: 'prospect_email' })
  prospectEmail!: string;

  @Column({ type: 'varchar', length: 50, name: 'prospect_phone' })
  prospectPhone!: string;

  @Column({ type: 'text', nullable: true, name: 'prospect_message' })
  prospectMessage!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'product_interest',
    enum: ProductInterest,
  })
  productInterest!: ProductInterest;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'zoom_meeting_id' })
  zoomMeetingId!: string | null;

  @Column({ type: 'text', nullable: true, name: 'zoom_join_url' })
  zoomJoinUrl!: string | null;

  @Column({ type: 'text', nullable: true, name: 'zoom_start_url' })
  zoomStartUrl!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'zoom_password' })
  zoomPassword!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'calendar_event_uid' })
  calendarEventUid!: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: BookingStatus.CONFIRMED,
    enum: BookingStatus,
  })
  status!: BookingStatus;

  @Column({ type: 'boolean', default: false, name: 'consent_given' })
  consentGiven!: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'consent_timestamp' })
  consentTimestamp!: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'privacy_policy_version' })
  privacyPolicyVersion!: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'cancellation_token' })
  cancellationToken!: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'cancelled_at' })
  cancelledAt!: Date | null;

  @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
  cancellationReason!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt!: Date | null;
}
