import { Platform } from 'react-native';

/**
 * Padding inferior del contenido desplazable.
 * En web/PWA suma el área segura del iPhone (barra de inicio) para que
 * el último elemento se pueda ver entero sin quedar tapado.
 */
export const scrollBottomPadding: number = Platform.OS === 'web'
  ? ('calc(env(safe-area-inset-bottom, 0px) + 32px)' as unknown as number)
  : 30;
