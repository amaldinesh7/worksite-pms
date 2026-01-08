import { createTamagui, createTokens } from 'tamagui';
import { config as configBase } from '@tamagui/config/v3';

const tokens = createTokens({
  color: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
  },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, true: 16, 6: 24, 8: 32 },
  size: { 1: 4, 2: 8, 3: 12, 4: 16, true: 16, 6: 24, 8: 32 },
  radius: { 2: 4, 3: 8, 4: 12, true: 8 },
  zIndex: { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 },
});

export const config = createTamagui({
  ...configBase,
  tokens,
  themes: {
    light: {
      background: tokens.color.background,
      text: tokens.color.text,
      primary: tokens.color.primary,
    },
  },
});

export default config;
