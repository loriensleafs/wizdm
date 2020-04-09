import { Component, Optional, ElementRef, NgZone, forwardRef } from '@angular/core';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { Router, Scroll } from '@angular/router';
import { MediaObserver } from '@angular/flex-layout';
import { Directionality } from '@angular/cdk/bidi';
import { Member } from 'app/core/member';
import { BackgroundStyle } from './background';
import { Observable } from 'rxjs';
import { filter, map, distinctUntilChanged, startWith, sample } from 'rxjs/operators';
import { runInZone } from 'app/utils/common';
import { $animations } from './navigator.animations';

@Component({
  selector: 'wm-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss'],
  host: { 'class': 'wm-theme-colors' },
  // Makes sure to provide the Navigator as a CdkScrollable for the wmScroll directive to work
  providers: [{ provide: CdkScrollable, useExisting: forwardRef(() => NavigatorComponent ) }],
  animations: $animations
})
export class NavigatorComponent extends CdkScrollable {

  readonly scrollTo$: Observable<string|[number, number]|HTMLElement>;
  readonly scrolled$: Observable<boolean>;
  
  // Menu toggle
  public menuToggler = false;
  public menuVisible = false;
  
  // Sidenav toggle
  public sideToggler = false;
  public sidenavOn: boolean = false;
  
  // Actions
  public activateActions: any;

  // Media queries to switch between desktop/mobile views
  public get mobile(): boolean { return this.media.isActive('xs');/*|| this.media.isActive('sm');*/ }
  public get desktop(): boolean { return !this.mobile; }

  constructor(private media: MediaObserver, private router: Router,
              readonly background$: BackgroundStyle, readonly member: Member, 
              private zone: NgZone, elref: ElementRef, scroll: ScrollDispatcher, @Optional() dir: Directionality) {

    // Constructs the parent CdkScollable directive
    super(elref, scroll, zone, dir);

    // Biuld the scrolling observable to be used with wmScroll directive
    this.scrollTo$ = this.router.events.pipe( 
      // Filters for scroll events only
      filter( e => e instanceof Scroll ), 
      // Waits for the zone to be stable, so, the anchor elements will be there
      // sample(zone.onStable), No more needed since scrolling is performed by wmScroll directive
      // Translates the event into the scroll target 
      map( (e: Scroll) =>  e.anchor || e.position || [0, 0] )
    );

    // Builds an observable detecting whenever the navigator is scrolled
    this.scrolled$ = this.elementScrolled().pipe(
      // Starts with some value to ensure triggering at start, if needed
      startWith( null ),
      // Maps to the top distance
      map( () => this.measureScrollOffset('top') > 5 ),
      // Filters for changes
      distinctUntilChanged(),
      // Enters the zone since cdk/scrolling observables run out of angular zone
      runInZone(this.zone)
    );
  }

  // Toggles the menu status
  public toggleMenu() { this.menuToggler = !this.menuToggler; }

  // Toggles the sidenav status
  public toggleSidenav() { this.sideToggler = !this.sideToggler; }

  public activateSidenav(active: boolean) { 

    if(this.sidenavOn = active) { return; }

    this.sideToggler = false;
  }

  // Signed In status
  public get signedIn(): boolean {
    return this.member.auth.authenticated || false;
  }

  public get userImage(): string {
    return this.member.data.photo || '';
  }
}
