import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const tokenFromQuery = route.queryParams['token'];
    if (tokenFromQuery) {
      localStorage.setItem('authToken', tokenFromQuery);
      this.router.navigate([state.url.split('?')[0]], { replaceUrl: true });
      return true;
    }

    const token = this.authService.getToken();
    
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    return this.authService.verifyToken().pipe(
      map(() => true),
      catchError(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
