import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ProductInterest, PRODUCT_LABELS } from '../../../../core/models/booking.model';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('confettiCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  bookingId = '';
  productLabel = '';
  dateFormatted = '';
  timeFormatted = '';
  zoomJoinUrl = '';

  private animationId = 0;
  private particles: ConfettiParticle[] = [];

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.bookingId = params['bookingId'] || '';
    this.zoomJoinUrl = params['zoom'] || '';

    const product = params['product'] as ProductInterest;
    this.productLabel = PRODUCT_LABELS[product] || product;

    const slotStart = params['slot'];
    if (slotStart) {
      const date = new Date(slotStart);
      this.dateFormatted = format(date, 'EEEE, dd. MMMM yyyy', { locale: de });
      this.timeFormatted = format(date, 'HH:mm');
    }
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.launchConfetti();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private launchConfetti(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#E87A1E', '#f5a04e', '#8CCED9', '#10b981', '#f0f4f8', '#1A3A5C'];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -14 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeCount = 0;
      for (const p of this.particles) {
        if (p.opacity <= 0) continue;
        activeCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.99; // air resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (activeCount > 0) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }
}
