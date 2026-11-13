import React, { useRef, useState } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  RefreshControl,
  Platform,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  GestureResponderEvent,
} from 'react-native';

interface Props extends ScrollViewProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 70;
const MAX_PULL = 110;

/**
 * ScrollView con "tirar para refrescar".
 * - iOS/Android nativo: usa RefreshControl.
 * - Web (incluida PWA en iPhone): implementación propia con eventos táctiles,
 *   ya que RefreshControl no funciona en react-native-web.
 */
export const RefreshableScrollView: React.FC<Props> = ({ onRefresh, children, ...rest }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [pull, setPull] = useState(0);
  const scrollY = useRef(0);
  const startY = useRef<number | null>(null);

  const runRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  };

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

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
    rest.onScroll?.(e);
  };

  const handleTouchStart = (e: GestureResponderEvent) => {
    if (refreshing) return;
    startY.current = scrollY.current <= 0 ? e.nativeEvent.touches[0]?.pageY ?? null : null;
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (startY.current === null || refreshing) return;
    const y = e.nativeEvent.touches[0]?.pageY;
    if (y === undefined) return;
    const delta = y - startY.current;
    if (delta <= 0 || scrollY.current > 0) {
      setPull(0);
      return;
    }
    // Resistencia progresiva
    setPull(Math.min(MAX_PULL, delta * 0.5));
  };

  const handleTouchEnd = () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= PULL_THRESHOLD) {
      setPull(PULL_THRESHOLD);
      runRefresh();
    } else {
      setPull(0);
    }
  };

  const indicatorHeight = refreshing ? PULL_THRESHOLD : pull;
  const ready = pull >= PULL_THRESHOLD;

  return (
    <ScrollView
      {...rest}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
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
