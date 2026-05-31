// ===================================
// Home page slider and arrivals slider
// TypeScript migration for src/pages/index.js
// ===================================

type SlideData = {
  element: HTMLElement;
  background: string;
};

interface ISlider {
  init(): void;
  showSlide(index: number): void;
}

class HeroSlider implements ISlider {
  private sliderElement: HTMLElement | null;
  private slides: SlideData[] = [];
  private currentIndex: number = 0;
  private autoTimer: number | null = null;
  private readonly autoDelay: number;
  private nextBtn: HTMLButtonElement | null;
  private prevBtn: HTMLButtonElement | null;

  constructor(
    sliderId: string,
    nextBtnId: string,
    prevBtnId: string,
    autoDelay = 4000
  ) {
    this.sliderElement = document.getElementById(sliderId);
    this.nextBtn = document.getElementById(nextBtnId) as HTMLButtonElement | null;
    this.prevBtn = document.getElementById(prevBtnId) as HTMLButtonElement | null;
    this.autoDelay = autoDelay;
  }

  init(): void {
    if (!this.sliderElement) return;

    const slideElements = Array.from(
      this.sliderElement.querySelectorAll('.slide')
    ) as HTMLElement[];

    this.slides = slideElements.map((element) => ({
      element,
      background: element.dataset.bg || ''
    }));

    if (this.slides.length > 0) {
      this.slides[this.currentIndex].element.classList.add('is-active');
    }

    this.setSlideBackgrounds();
    this.attachEventListeners();
    this.startAuto();
  }

  showSlide(index: number): void {
    if (this.slides.length === 0) return;

    this.slides[this.currentIndex].element.classList.remove('is-active');
    this.currentIndex = (index + this.slides.length) % this.slides.length;
    this.slides[this.currentIndex].element.classList.add('is-active');
  }

  private setSlideBackgrounds(): void {
    this.slides.forEach((slide) => {
      if (slide.background) {
        slide.element.style.backgroundImage = `url("${slide.background}")`;
      }
    });
  }

  private attachEventListeners(): void {
    this.nextBtn?.addEventListener('click', () => this.moveTo(this.currentIndex + 1));
    this.prevBtn?.addEventListener('click', () => this.moveTo(this.currentIndex - 1));

    this.sliderElement?.addEventListener('mouseenter', () => this.stopAuto());
    this.sliderElement?.addEventListener('mouseleave', () => this.startAuto());
  }

  private moveTo(index: number): void {
    this.showSlide(index);
    this.startAuto();
  }

  private stopAuto(): void {
    if (this.autoTimer !== null) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private startAuto(): void {
    this.stopAuto();
    this.autoTimer = window.setInterval(() => {
      this.showSlide(this.currentIndex + 1);
    }, this.autoDelay);
  }
}

interface IArrivalsSlider extends ISlider {
  init(): void;
}

class ArrivalsSlider implements IArrivalsSlider {
  private arrivalSection: HTMLElement | null;
  private arrivalsSlider: HTMLElement | null;
  private arrivalsTrack: HTMLElement | null;
  private arrivalDots: HTMLElement | null;
  private cards: HTMLElement[] = [];
  private currentPage: number = 0;
  private totalPages: number = 1;
  private autoTimer: number | null = null;
  private readonly autoDelay: number;

  constructor(
    arrivalSectionId: string,
    arrivalsSliderId: string,
    arrivalsTrackId: string,
    arrivalDotsId: string,
    autoDelay = 3200
  ) {
    this.arrivalSection = document.getElementById(arrivalSectionId);
    this.arrivalsSlider = document.getElementById(arrivalsSliderId);
    this.arrivalsTrack = document.getElementById(arrivalsTrackId);
    this.arrivalDots = document.getElementById(arrivalDotsId);
    this.autoDelay = autoDelay;
  }

  init(): void {
    if (!this.arrivalSection || !this.arrivalsSlider || !this.arrivalsTrack || !this.arrivalDots) {
      return;
    }

    this.cards = Array.from(this.arrivalsTrack.querySelectorAll('.product-card')) as HTMLElement[];

    this.recalcPages();
    this.attachEventListeners();
    this.startAuto();
  }

  showSlide(page: number): void {
    if (this.cards.length === 0 || !this.arrivalsTrack) return;

    if (page < 0) page = this.totalPages - 1;
    else if (page >= this.totalPages) page = 0;

    this.currentPage = page;
    this.renderPage(this.currentPage);
  }

  private getPerView(): number {
    if (!this.arrivalSection) return 4;

    const cssValue = window
      .getComputedStyle(this.arrivalSection)
      .getPropertyValue('--per-view')
      .trim();

    const perView = Number.parseInt(cssValue, 10);
    return Number.isFinite(perView) && perView > 0 ? perView : 4;
  }

  private buildDots(): void {
    if (!this.arrivalDots) return;

    this.arrivalDots.innerHTML = '';

    for (let i = 0; i < this.totalPages; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.dataset.page = String(i);
      dot.setAttribute('aria-label', `Go to page ${i + 1}`);
      if (i === this.currentPage) dot.classList.add('is-active');
      this.arrivalDots.append(dot);
    }
  }

  private syncDots(): void {
    if (!this.arrivalDots) return;

    const dots = this.arrivalDots.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === this.currentPage);
    });
  }

  private renderPage(page: number): void {
    if (this.cards.length === 0 || !this.arrivalsTrack) return;

    const perView = this.getPerView();
    const startIndex = page * perView;
    const targetCard = this.cards[startIndex] || this.cards[this.cards.length - 1];
    const targetLeft = targetCard ? targetCard.offsetLeft : 0;

    this.arrivalsTrack.style.transform = `translateX(-${targetLeft}px)`;
    this.syncDots();
  }

  private recalcPages(): void {
    const perView = this.getPerView();
    this.totalPages = Math.max(1, Math.ceil(this.cards.length / perView));

    if (this.currentPage >= this.totalPages) {
      this.currentPage = this.totalPages - 1;
    }

    this.buildDots();
    this.renderPage(this.currentPage);
  }

  private stopAuto(): void {
    if (this.autoTimer !== null) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private startAuto(): void {
    this.stopAuto();
    this.autoTimer = window.setInterval(() => {
      this.showSlide(this.currentPage + 1);
    }, this.autoDelay);
  }

  private attachEventListeners(): void {
    if (this.arrivalDots) {
      this.arrivalDots.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const dot = target.closest('.dot') as HTMLButtonElement | null;
        if (!dot) return;

        const page = Number.parseInt(dot.dataset.page || '0', 10);
        this.showSlide(page);
        this.startAuto();
      });
    }

    this.arrivalsSlider?.addEventListener('mouseenter', () => this.stopAuto());
    this.arrivalsSlider?.addEventListener('mouseleave', () => this.startAuto());

    window.addEventListener('resize', () => this.recalcPages());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const heroSlider = new HeroSlider('heroSlider', 'nextBtn', 'prevBtn');
  heroSlider.init();

  const arrivalsSlider = new ArrivalsSlider('arrivalSection', 'arrivalsSlider', 'arrivalsTrack', 'arrivalDots');
  arrivalsSlider.init();
});
