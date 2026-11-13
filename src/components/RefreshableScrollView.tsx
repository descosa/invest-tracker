import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  RefreshControl,
  Platform,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface Props extends ScrollViewProps {
  /** Si se indica, activa "tirar para refrescar" */
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 70;
const MAX_PULL = 120;

const isStandaloneWeb = (): boolean => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true;
};

/**
 * Contenedor desplazable de pantalla.
 * - Nativo (iOS/Android): ScrollView + RefreshControl.
 * - Web: NO usa ScrollView. Hace scroll el documento, que es lo que permite a
 *   Safari dibujar el contenido bajo sus barras y ocupar toda la pantalla en modo app.
 *   En Safari normal se usa su propio "tirar para refrescar"; en modo app
 *   (pantalla de inicio) se implementa con eventos táctiles sobre la ventana.
 */
export const RefreshableScrollView: React.FC<Props> = ({ onRefresh, children, ...rest }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [pull, setPull] = useState(0);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const runRefresh = async () => {
    if (!onRefreshRef.current) return;
    setRefreshing(true);
    try {
      await onRefreshRef.current();
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  };

  useEffect(() => {
    if (!onRefresh || !isStandaloneWeb()) return;

    let startY: number | null = null;
    let currentPull = 0;
    let busy = false;

    const onStart = (e: TouchEvent) => {
      startY = busy || window.scrollY > 0 ? null : e.touches[0].clientY;
      currentPull = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (startY === null || busy) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0 || window.scrollY > 0) {
        if (currentPull !== 0) {
          currentPull = 0;
          setPull(0);
        }
        return;
      }
      if (e.cancelable) e.preventDefault();
      currentPull = Math.min(MAX_PULL, delta * 0.5);
      setPull(currentPull);
    };

    const onEnd = async () => {
      if (startY === null) return;
      startY = null;
      const shouldRefresh = currentPull >= PULL_THRESHOLD;
      currentPull = 0;
      if (!shouldRefresh) {
        setPull(0);
        return;
      }
      busy = true;
      setPull(PULL_THRESHOLD);
      setRefreshing(true);
      try {
        await onRefreshRef.current?.();
      } finally {
        busy = false;
        setRefreshing(false);
        setPull(0);
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [!!onRefresh]);

  if (Platform.OS !== 'web') {
    return (
      <ScrollView
        {...rest}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={runRefresh} tintColor="#38bdf8" colors={['#38bdf8']} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }

  const indicatorHeight = refreshing ? PULL_THRESHOLD : pull;
  const ready = pull >= PULL_THRESHOLD;

  return (
    <View style={rest.contentContainerStyle}>
      {indicatorHeight > 0 && (
        <View style={[styles.indicator, { height: indicatorHeight }]}>
          {refreshing ? (
            <ActivityIndicator color="#38bdf8" />
          ) : (
            <Text style={styles.indicatorText}>
              {ready ? '↻ Suelta para actualizar' : '↓ Desliza para actualizar'}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  indicatorText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
});
