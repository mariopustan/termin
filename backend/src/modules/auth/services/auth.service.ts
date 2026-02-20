import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Admin } from '../entities/admin.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async validateAdmin(email: string, password: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      throw new UnauthorizedException('Ungültige Anmeldedaten.');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Ungültige Anmeldedaten.');
    }

    return admin;
  }

  login(admin: Admin): { accessToken: string } {
    const payload = { sub: admin.id, email: admin.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  private async seedAdmin(): Promise<void> {
    const count = await this.adminRepository.count();

    if (count > 0) {
      return;
    }

    const email = this.configService.get<string>('jwt.adminEmail');
    const password = this.configService.get<string>('jwt.adminPassword');

    if (!email || !password) {
      this.logger.warn(
        'No admin user exists and ADMIN_EMAIL/ADMIN_PASSWORD not set. Admin login disabled.',
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = this.adminRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName: 'Administrator',
    });

    await this.adminRepository.save(admin);
    this.logger.log(`Seed admin created: ${email}`);
  }
}
