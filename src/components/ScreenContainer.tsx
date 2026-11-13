import React from 'react';
import { Platform, SafeAreaView, View, ViewStyle, StyleProp } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Contenedor de pantalla.
 * En web NO se usa SafeAreaView porque react-native-web añade
 * padding-bottom: env(safe-area-inset-bottom), lo que deja una franja
 * muerta abajo en el iPhone. El área segura superior/lateral la gestiona
 * #root (index.html) y la inferior el padding del contenido desplazable.
 */
export const ScreenContainer: React.FC<Props> = ({ style, children }) => {
  if (Platform.OS === 'web') {
    return <View style={style}>{children}</View>;
  }
  return <SafeAreaView style={style}>{children}</SafeAreaView>;
};
