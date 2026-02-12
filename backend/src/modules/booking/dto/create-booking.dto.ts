import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  Equals,
} from 'class-validator';
import { ProductInterest } from '../interfaces/booking-status.enum';

export class CreateBookingDto {
  @IsString()
  @MinLength(2, { message: 'Vorname muss mindestens 2 Zeichen lang sein' })
  @MaxLength(100)
  @Matches(/^[a-zA-ZäöüÄÖÜßéèêëàâïîôùûçñ\s\-']+$/, {
    message: 'Vorname enthält ungültige Zeichen',
  })
  firstName!: string;

  @IsString()
  @MinLength(2, { message: 'Nachname muss mindestens 2 Zeichen lang sein' })
  @MaxLength(100)
  @Matches(/^[a-zA-ZäöüÄÖÜßéèêëàâïîôùûçñ\s\-']+$/, {
    message: 'Nachname enthält ungültige Zeichen',
  })
  lastName!: string;

  @IsString()
  @MinLength(2, { message: 'Unternehmensname muss mindestens 2 Zeichen lang sein' })
  @MaxLength(200)
  companyName!: string;

  @IsEmail({}, { message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' })
  @MaxLength(255)
  email!: string;

  @IsString()
  @Matches(/^\+?[\d\s\-()]+$/, {
    message: 'Bitte geben Sie eine gültige Telefonnummer ein',
  })
  @MinLength(6)
  @MaxLength(50)
  phone!: string;

  @IsEnum(ProductInterest, {
    message: 'Bitte wählen Sie ein gültiges Produkt aus',
  })
  productInterest!: ProductInterest;

  @IsDateString({}, { message: 'Bitte wählen Sie einen gültigen Termin' })
  slotStart!: string;

  @IsBoolean()
  @Equals(true, { message: 'Datenschutzeinwilligung ist erforderlich' })
  consentGiven!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
