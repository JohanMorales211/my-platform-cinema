import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationStateService {
  public homeTypingAnimationPlayed: boolean = false;

  constructor() { }
}