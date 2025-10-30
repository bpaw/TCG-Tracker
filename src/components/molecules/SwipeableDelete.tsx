import React, { ReactNode, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SwipeableDeleteProps {
  children: ReactNode;
  onDelete: (close: () => void) => void;
}

export function SwipeableDelete({ children, onDelete }: SwipeableDeleteProps) {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    const close = () => {
      swipeableRef.current?.close();
    };
    onDelete(close);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.actionsContainer}>
        <Animated.View
          style={[
            styles.deleteAction,
            {
              backgroundColor: colors.brand.coral,
              transform: [{ translateX }],
            },
          ]}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#fff" />
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleDelete}
      rightThreshold={40}
      friction={2}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});
