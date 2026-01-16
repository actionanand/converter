import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pc77Converter } from './pc77';

describe('Pc77Converter', () => {
  let component: Pc77Converter;
  let fixture: ComponentFixture<Pc77Converter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pc77Converter],
    }).compileComponents();

    fixture = TestBed.createComponent(Pc77Converter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Decimal to PC77 conversion', () => {
    it('should convert 0 to 0-0', () => {
      component.decimalInput.set('0');
      expect(component.pc77Result()).toBe('0-0');
    });

    it('should convert 1234 to 9-82', () => {
      component.decimalInput.set('1234');
      expect(component.pc77Result()).toBe('9-82');
    });

    it('should convert 16383 to 127-127', () => {
      component.decimalInput.set('16383');
      expect(component.pc77Result()).toBe('127-127');
    });

    it('should convert 8192 to 64-0', () => {
      component.decimalInput.set('8192');
      expect(component.pc77Result()).toBe('64-0');
    });

    it('should convert 127 to 0-127', () => {
      component.decimalInput.set('127');
      expect(component.pc77Result()).toBe('0-127');
    });

    it('should handle invalid input beyond range', () => {
      component.decimalInput.set('16384');
      expect(component.pc77Result()).toContain('Invalid');
    });

    it('should handle negative numbers', () => {
      component.decimalInput.set('-1');
      expect(component.pc77Result()).toContain('Invalid');
    });
  });

  describe('PC77 to Decimal conversion', () => {
    it('should convert 0-0 to 0', () => {
      component.pc77Input.set('0-0');
      expect(component.decimalResult()).toBe('0');
    });

    it('should convert 9-82 to 1234', () => {
      component.pc77Input.set('9-82');
      expect(component.decimalResult()).toBe('1234');
    });

    it('should convert 127-127 to 16383', () => {
      component.pc77Input.set('127-127');
      expect(component.decimalResult()).toBe('16383');
    });

    it('should convert 64-0 to 8192', () => {
      component.pc77Input.set('64-0');
      expect(component.decimalResult()).toBe('8192');
    });

    it('should convert 0-127 to 127', () => {
      component.pc77Input.set('0-127');
      expect(component.decimalResult()).toBe('127');
    });

    it('should handle invalid format', () => {
      component.pc77Input.set('127');
      expect(component.decimalResult()).toContain('Invalid');
    });

    it('should handle values beyond 7-bit range', () => {
      component.pc77Input.set('128-0');
      expect(component.decimalResult()).toContain('Invalid');
    });
  });

  describe('Binary representation', () => {
    it('should show correct binary for decimal 1234', () => {
      component.mode.set('toPC77');
      component.decimalInput.set('1234');
      const binary = component.binaryRepresentation();

      expect(binary).not.toBeNull();
      expect(binary!.original).toBe('10011010010');
      expect(binary!.padded).toBe('00010011010010');
      expect(binary!.first7).toBe('0001001');
      expect(binary!.second7).toBe('1010010');
    });

    it('should show correct binary for PC77 9-82', () => {
      component.mode.set('toDec');
      component.pc77Input.set('9-82');
      const binary = component.binaryRepresentation();

      expect(binary).not.toBeNull();
      expect(binary!.first7).toBe('0001001');
      expect(binary!.second7).toBe('1010010');
      expect(binary!.padded).toBe('00010011010010');
      expect(binary!.original).toBe('10011010010');
    });
  });

  describe('Mode switching', () => {
    it('should swap between modes', () => {
      expect(component.mode()).toBe('toPC77');
      component.swapMode();
      expect(component.mode()).toBe('toDec');
      component.swapMode();
      expect(component.mode()).toBe('toPC77');
    });
  });

  describe('Edge cases', () => {
    it('should handle maximum value', () => {
      component.decimalInput.set('16383');
      expect(component.pc77Result()).toBe('127-127');

      component.mode.set('toDec');
      component.pc77Input.set('127-127');
      expect(component.decimalResult()).toBe('16383');
    });

    it('should handle powers of 2', () => {
      // 2^7 = 128
      component.decimalInput.set('128');
      expect(component.pc77Result()).toBe('1-0');

      // 2^10 = 1024
      component.decimalInput.set('1024');
      expect(component.pc77Result()).toBe('8-0');
    });
  });
});
