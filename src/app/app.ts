import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { SnackbarComponent } from './shared/snackbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SnackbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('converter');
}
