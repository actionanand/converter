import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">🔧 Converter Tools</a>
        <button
          class="hamburger"
          (click)="toggleMenu()"
          [class.active]="isMenuOpen()"
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="nav-links" [class.active]="isMenuOpen()">
          <li class="nav-item">
            <a
              routerLink="/"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeMenu()"
            >
              🏠 Home
            </a>
          </li>
          <li
            class="nav-item dropdown"
            (mouseenter)="openDropdown('encoders')"
            (mouseleave)="closeDropdown()"
          >
            <button class="dropdown-toggle" (click)="toggleDropdown('encoders')">
              🔐 Encoders <span class="arrow">▼</span>
            </button>
            <ul class="dropdown-menu" [class.show]="activeDropdown() === 'encoders'">
              <li>
                <a routerLink="/image-to-base64" routerLinkActive="active" (click)="closeMenu()"
                  >Image to Base64</a
                >
              </li>
              <li>
                <a routerLink="/sha1" routerLinkActive="active" (click)="closeMenu()">SHA1</a>
              </li>
              <li>
                <a routerLink="/jwt" routerLinkActive="active" (click)="closeMenu()">JWT Decoder</a>
              </li>
              <li>
                <a routerLink="/cipher" routerLinkActive="active" (click)="closeMenu()"
                  >Secret Cipher</a
                >
              </li>
            </ul>
          </li>
          <li
            class="nav-item dropdown"
            (mouseenter)="openDropdown('text')"
            (mouseleave)="closeDropdown()"
          >
            <button class="dropdown-toggle" (click)="toggleDropdown('text')">
              📝 Text Tools <span class="arrow">▼</span>
            </button>
            <ul class="dropdown-menu" [class.show]="activeDropdown() === 'text'">
              <li>
                <a routerLink="/text-compare" routerLinkActive="active" (click)="closeMenu()"
                  >Text Compare</a
                >
              </li>
              <li>
                <a routerLink="/json-formatter" routerLinkActive="active" (click)="closeMenu()"
                  >JSON Formatter</a
                >
              </li>
              <li>
                <a routerLink="/word-counter" routerLinkActive="active" (click)="closeMenu()"
                  >Word Counter</a
                >
              </li>
              <li>
                <a routerLink="/lorem-ipsum" routerLinkActive="active" (click)="closeMenu()"
                  >Lorem Ipsum</a
                >
              </li>
            </ul>
          </li>
          <li
            class="nav-item dropdown"
            (mouseenter)="openDropdown('design')"
            (mouseleave)="closeDropdown()"
          >
            <button class="dropdown-toggle" (click)="toggleDropdown('design')">
              🎨 Design <span class="arrow">▼</span>
            </button>
            <ul class="dropdown-menu" [class.show]="activeDropdown() === 'design'">
              <li>
                <a routerLink="/color-picker" routerLinkActive="active" (click)="closeMenu()"
                  >Color Picker</a
                >
              </li>
              <li>
                <a routerLink="/unit-converter" routerLinkActive="active" (click)="closeMenu()"
                  >Unit Converter</a
                >
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      background-color: #2c3e50;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }

    .nav-brand {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
      z-index: 1001;
      transition: color 0.3s ease;

      &:hover {
        color: #3498db;
      }
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.75rem;
      z-index: 1001;
      position: relative;
      width: 44px;
      height: 44px;
      justify-content: center;
      align-items: center;

      span {
        display: block;
        width: 26px;
        height: 3px;
        background-color: white;
        transition: all 0.3s ease;
        border-radius: 2px;
      }

      &.active span:nth-child(1) {
        transform: rotate(45deg) translate(9px, 9px);
        background-color: #e74c3c;
      }

      &.active span:nth-child(2) {
        opacity: 0;
      }

      &.active span:nth-child(3) {
        transform: rotate(-45deg) translate(8px, -8px);
        background-color: #e74c3c;
      }

      &:hover span {
        background-color: #3498db;
      }

      &.active:hover span {
        background-color: #c0392b;
      }
    }

    .nav-links {
      list-style: none;
      display: flex;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      align-items: center;
    }

    .nav-item {
      position: relative;

      > a {
        color: #ecf0f1;
        text-decoration: none;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        transition: all 0.3s ease;
        white-space: nowrap;
        display: block;
        font-weight: 500;

        &:hover {
          background-color: #34495e;
          color: white;
        }

        &.active {
          background-color: #3498db;
          color: white;
        }
      }
    }

    .dropdown-toggle {
      color: #ecf0f1;
      background: none;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 500;

      &:hover {
        background-color: #34495e;
        color: white;
      }

      .arrow {
        font-size: 0.7rem;
        transition: transform 0.3s ease;
      }
    }

    .dropdown:hover .dropdown-toggle .arrow {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background-color: #34495e;
      list-style: none;
      margin: 0.5rem 0 0;
      padding: 0.5rem 0;
      min-width: 200px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;

      &.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      li {
        margin: 0;
      }

      a {
        color: #ecf0f1;
        text-decoration: none;
        padding: 0.75rem 1.25rem;
        display: block;
        transition: all 0.3s ease;

        &:hover {
          background-color: #2c3e50;
          padding-left: 1.5rem;
        }

        &.active {
          background-color: #3498db;
          color: white;
        }
      }
    }

    @media (max-width: 968px) {
      .hamburger {
        display: flex;
      }

      .nav-links {
        position: fixed;
        top: 0;
        right: -100%;
        height: 100vh;
        width: 80%;
        max-width: 350px;
        background-color: #2c3e50;
        flex-direction: column;
        padding: 5rem 0 2rem;
        gap: 0;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
        transition: right 0.3s ease;
        z-index: 1000;
        overflow-y: auto;
        align-items: stretch;

        &.active {
          right: 0;
        }
      }

      .nav-item {
        width: 100%;
        border-bottom: 1px solid #34495e;

        > a {
          padding: 1rem 1.5rem;
          border-radius: 0;
        }
      }

      .dropdown-toggle {
        width: 100%;
        padding: 1rem 1.5rem;
        border-radius: 0;
        justify-content: space-between;
      }

      .dropdown-menu {
        position: static;
        opacity: 1;
        visibility: visible;
        transform: none;
        background-color: #1a252f;
        box-shadow: none;
        border-radius: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        margin: 0;

        &.show {
          max-height: 500px;
        }

        a {
          padding: 0.75rem 2rem;

          &:hover {
            padding-left: 2.5rem;
          }
        }
      }
    }
  `,
})
export class Navbar {
  protected readonly isMenuOpen = signal(false);
  protected readonly activeDropdown = signal<string | null>(null);

  protected toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
    this.activeDropdown.set(null);
  }

  protected openDropdown(name: string): void {
    // Only open on hover for desktop
    if (window.innerWidth > 968) {
      this.activeDropdown.set(name);
    }
  }

  protected closeDropdown(): void {
    // Only close on hover for desktop
    if (window.innerWidth > 968) {
      this.activeDropdown.set(null);
    }
  }

  protected toggleDropdown(name: string): void {
    // Toggle on click for mobile
    if (window.innerWidth <= 968) {
      this.activeDropdown.update((current) => (current === name ? null : name));
    }
  }
}
