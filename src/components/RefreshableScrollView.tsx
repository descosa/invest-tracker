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
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 70;
const MAX_PULL = 120;

/**
 * ScrollView con "tirar para refrescar".
 * - iOS/Android nativo: RefreshControl.
 * - Web / PWA (Safari iOS): listeners táctiles nativos del DOM sobre el nodo
 *   desplazable, ya que RefreshControl no funciona en react-native-web.
 */
export const RefreshableScrollView: React.FC<Props> = ({ onRefresh, children, ...rest }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [pull, setPull] = useState(0);
  const scrollRef = useRef<any>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const runRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshRef.current();
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const anyRef = scrollRef.current as any;
    const node: HTMLElement | null =
      anyRef?.getScrollableNode?.() ?? (typeof HTMLElement !== 'undefined' && anyRef instanceof HTMLElement ? anyRef : null);
    if (!node) return;

    let startY: number | null = null;
    let currentPull = 0;
    let busy = false;

    const onStart = (e: TouchEvent) => {
      if (busy || node.scrollTop > 0) {
        startY = null;
        return;
      }
      startY = e.touches[0].clientY;
      currentPull = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (startY === null || busy) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0 || node.scrollTop > 0) {
        if (currentPull !== 0) {
          currentPull = 0;
          setPull(0);
        }
        return;
      }
      // Evita el rebote nativo mientras se tira hacia abajo
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
        await onRefreshRef.current();
      } finally {
        busy = false;
        setRefreshing(false);
        setPull(0);
      }
    };

    node.addEventListener('touchstart', onStart, { passive: true });
    node.addEventListener('touchmove', onMove, { passive: false });
    node.addEventListener('touchend', onEnd);
    node.addEventListener('touchcancel', onEnd);
    return () => {
      node.removeEventListener('touchstart', onStart);
      node.removeEventListener('touchmove', onMove);
      node.removeEventListener('touchend', onEnd);
      node.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  if (Platform.OS !== 'web') {
    return (
      <ScrollView
        {...rest}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={runRefresh} tintColor="#38bdf8" colors={['#38bdf8']} />
        }
      >
        {children}
      </ScrollView>
    );
  }

  const indicatorHeight = refreshing ? PULL_THRESHOLD : pull;
  const ready = pull >= PULL_THRESHOLD;

  return (
    <ScrollView ref={scrollRef} {...rest}>
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
    </ScrollView>
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
