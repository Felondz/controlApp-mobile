import React, { useState } from 'react';
import { 
    ScrollView, 
    View, 
    StyleSheet, 
    LayoutChangeEvent, 
    NativeSyntheticEvent, 
    NativeScrollEvent,
    ScrollViewProps,
    Platform
} from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming 
} from 'react-native-reanimated';
import { useAppTheme } from '../hooks';

interface ThemedScrollViewProps extends ScrollViewProps {
    children: React.ReactNode;
    indicatorColor?: string;
    style?: any;
}

/**
 * ThemedScrollView - A ScrollView with a custom themed scroll indicator
 * Ensures consistent branding across iOS and Android
 */
export const ThemedScrollView = ({ 
    children, 
    indicatorColor, 
    onScroll: providedOnScroll,
    onContentSizeChange: providedOnContentSizeChange,
    onLayout: providedOnLayout,
    style,
    ...props 
}: ThemedScrollViewProps) => {
    const { theme, isDark } = useAppTheme();
    
    // Default color if not provided
    const thumbColor = indicatorColor || (isDark ? theme.primary700 : theme.primary400);
    
    // Measurements
    const [contentHeight, setContentHeight] = useState(1);
    const [visibleHeight, setVisibleHeight] = useState(0);
    
    // Scroll state
    const scrollY = useSharedValue(0);
    const indicatorOpacity = useSharedValue(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
        indicatorOpacity.value = 1;
        
        // Call provided onScroll
        if (providedOnScroll) {
            providedOnScroll(event);
        }
    };

    const handleScrollEnd = () => {
        // Fade out indicator after delay
        indicatorOpacity.value = withTiming(0, { duration: 1500 });
    };

    const handleContentSizeChange = (w: number, h: number) => {
        setContentHeight(h);
        if (providedOnContentSizeChange) {
            providedOnContentSizeChange(w, h);
        }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setVisibleHeight(event.nativeEvent.layout.height);
        if (providedOnLayout) {
            providedOnLayout(event);
        }
    };

    // Derived values
    const indicatorHeight = visibleHeight > 0 && contentHeight > visibleHeight 
        ? Math.max(30, (visibleHeight * visibleHeight) / contentHeight)
        : 0;

    const scrollableRange = contentHeight - visibleHeight;
    const indicatorRange = visibleHeight - indicatorHeight;

    const indicatorStyle = useAnimatedStyle(() => {
        const interpolation = scrollableRange > 0 
            ? (scrollY.value / scrollableRange) * indicatorRange 
            : 0;
            
        return {
            height: indicatorHeight,
            transform: [{ translateY: interpolation }],
            opacity: indicatorOpacity.value,
        };
    });

    return (
        <View style={[styles.container, style]} onLayout={handleLayout}>
            <ScrollView
                {...props}
                showsVerticalScrollIndicator={false} // Hide native
                onScroll={handleScroll}
                onScrollBeginDrag={() => { indicatorOpacity.value = 1; }}
                onScrollEndDrag={handleScrollEnd}
                onMomentumScrollEnd={handleScrollEnd}
                onContentSizeChange={handleContentSizeChange}
                scrollEventThrottle={16}
            >
                {children}
            </ScrollView>
            
            {indicatorHeight > 0 && (
                <View style={styles.indicatorContainer} pointerEvents="none">
                    <Animated.View 
                        style={[
                            styles.indicator, 
                            { backgroundColor: thumbColor },
                            indicatorStyle
                        ]} 
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    indicatorContainer: {
        position: 'absolute',
        top: 4,
        right: 4,
        bottom: 4,
        width: 4,
        zIndex: 100,
    },
    indicator: {
        width: 4,
        borderRadius: 2,
    },
});

export default ThemedScrollView;
