import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
} from '@expo-google-fonts/hanken-grotesk';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';

export const fontFamilies = {
  spaceGrotesk: {
    semibold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },
  hankenGrotesk: {
    regular: 'HankenGrotesk_400Regular',
    medium: 'HankenGrotesk_500Medium',
  },
  jetBrainsMono: {
    medium: 'JetBrainsMono_500Medium',
    semibold: 'JetBrainsMono_600SemiBold',
  },
} as const;

export function useAppFonts() {
  return useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });
}
