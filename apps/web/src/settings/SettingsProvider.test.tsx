import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@deadline/core';
import { applySettingsToDocument } from './SettingsProvider.tsx';

describe('applySettingsToDocument', () => {
  it('traslada escala de texto, luz y movimiento al documento', () => {
    const root = document.createElement('html');
    applySettingsToDocument({ ...DEFAULT_SETTINGS, textScale: 1.25, lightIntensity: 0.5, lightTone: 'cold', reducedMotion: 'on' }, root);
    expect(root.style.getPropertyValue('--text-scale')).toBe('1.25');
    expect(root.style.getPropertyValue('--light-intensity')).toBe('0.5');
    expect(root.dataset.lightTone).toBe('cold');
    expect(root.dataset.reducedMotion).toBe('on');
  });
});
