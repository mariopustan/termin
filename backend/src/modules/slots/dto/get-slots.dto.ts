import { IsDateString, IsOptional } from 'class-validator';

export class GetSlotsDto {
  @IsDateString()
  date!: string;
}

export class GetSlotsRangeDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}
