import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveformComponent } from './waveform.component';

describe('WaveformComponent', () => {
  let component: WaveformComponent;
  let fixture: ComponentFixture<WaveformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaveformComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaveformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
