import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseConverter } from './base-converter';

describe('BaseConverter', () => {
  let component: BaseConverter;
  let fixture: ComponentFixture<BaseConverter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseConverter],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseConverter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Decimal to Hexadecimal', () => {
    beforeEach(() => {
      component.selectedConversion.set('dec2hex');
    });

    it('should convert 255 to FF', () => {
      component.input.set('255');
      expect(component.result()).toBe('FF');
    });

    it('should convert 0 to 0', () => {
      component.input.set('0');
      expect(component.result()).toBe('0');
    });

    it('should convert 16 to 10', () => {
      component.input.set('16');
      expect(component.result()).toBe('10');
    });
  });

  describe('Hexadecimal to Decimal', () => {
    beforeEach(() => {
      component.selectedConversion.set('hex2dec');
    });

    it('should convert FF to 255', () => {
      component.input.set('FF');
      expect(component.result()).toBe('255');
    });

    it('should convert 10 to 16', () => {
      component.input.set('10');
      expect(component.result()).toBe('16');
    });
  });

  describe('Decimal to Binary', () => {
    beforeEach(() => {
      component.selectedConversion.set('dec2bin');
    });

    it('should convert 42 to 101010', () => {
      component.input.set('42');
      expect(component.result()).toBe('101010');
    });

    it('should convert 255 to 11111111', () => {
      component.input.set('255');
      expect(component.result()).toBe('11111111');
    });
  });

  describe('Binary to Decimal', () => {
    beforeEach(() => {
      component.selectedConversion.set('bin2dec');
    });

    it('should convert 101010 to 42', () => {
      component.input.set('101010');
      expect(component.result()).toBe('42');
    });

    it('should convert 11111111 to 255', () => {
      component.input.set('11111111');
      expect(component.result()).toBe('255');
    });
  });

  describe('Decimal to Octal', () => {
    beforeEach(() => {
      component.selectedConversion.set('dec2oct');
    });

    it('should convert 64 to 100', () => {
      component.input.set('64');
      expect(component.result()).toBe('100');
    });

    it('should convert 255 to 377', () => {
      component.input.set('255');
      expect(component.result()).toBe('377');
    });
  });

  describe('Octal to Decimal', () => {
    beforeEach(() => {
      component.selectedConversion.set('oct2dec');
    });

    it('should convert 100 to 64', () => {
      component.input.set('100');
      expect(component.result()).toBe('64');
    });

    it('should convert 377 to 255', () => {
      component.input.set('377');
      expect(component.result()).toBe('255');
    });
  });

  describe('Binary to Hexadecimal', () => {
    beforeEach(() => {
      component.selectedConversion.set('bin2hex');
    });

    it('should convert 11111111 to FF', () => {
      component.input.set('11111111');
      expect(component.result()).toBe('FF');
    });
  });

  describe('Hexadecimal to Binary', () => {
    beforeEach(() => {
      component.selectedConversion.set('hex2bin');
    });

    it('should convert FF to 11111111', () => {
      component.input.set('FF');
      expect(component.result()).toBe('11111111');
    });
  });

  describe('Breakdown functionality', () => {
    it('should provide all base representations', () => {
      component.selectedConversion.set('dec2hex');
      component.input.set('255');

      const breakdown = component.breakdown();
      expect(breakdown).toBeTruthy();
      expect(breakdown?.decimal).toBe(255);
      expect(breakdown?.binary).toBe('11111111');
      expect(breakdown?.octal).toBe('377');
      expect(breakdown?.hex).toBe('FF');
    });

    it('should return null for invalid input', () => {
      component.selectedConversion.set('dec2hex');
      component.input.set('invalid');

      const breakdown = component.breakdown();
      expect(breakdown).toBeNull();
    });
  });

  describe('Sample loading', () => {
    it('should load appropriate sample for each conversion', () => {
      component.selectedConversion.set('dec2hex');
      component.loadSample();
      expect(component.input()).toBe('255');

      component.selectedConversion.set('bin2dec');
      component.loadSample();
      expect(component.input()).toBe('101010');
    });
  });
});
