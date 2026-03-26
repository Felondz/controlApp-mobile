import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, StyleProp } from 'react-native';

interface SkeletonProps {
    className?: string;
    style?: StyleProp<ViewStyle>;
    width?: number | string;
    height?: number;
    borderRadius?: number;
    count?: number;
}

export default function Skeleton({
    className = '',
    style,
    width,
    height = 20,
    borderRadius = 4,
    count = 1,
}: SkeletonProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    const skeletonStyle: ViewStyle = {
        width: width as number | undefined,
        height,
        borderRadius,
        opacity,
    };

    if (count === 1) {
        return (
            <Animated.View
                className={`bg-secondary-200 dark:bg-secondary-700 ${className}`}
                style={[skeletonStyle, style]}
            />
        );
    }

    return (
        <View className={className} style={style}>
            {Array.from({ length: count }).map((_, index) => (
                <Animated.View
                    key={index}
                    className="bg-secondary-200 dark:bg-secondary-700 mb-2"
                    style={skeletonStyle}
                />
            ))}
        </View>
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <View
            className={`
                bg-white dark:bg-secondary-800
                rounded-xl p-4 shadow-sm
                border border-secondary-100 dark:border-secondary-700
                ${className}
            `}
        >
            <View className="flex-row items-center mb-3">
                <Skeleton width={48} height={48} borderRadius={12} />
                <View className="ml-3 flex-1">
                    <Skeleton width="60%" height={16} className="mb-2" />
                    <Skeleton width="40%" height={12} />
                </View>
            </View>
            <Skeleton width="100%" height={12} className="mb-2" />
            <Skeleton width="80%" height={12} />
        </View>
    );
}

export function SkeletonList({ count = 5, className = '' }: { count?: number; className?: string }) {
    return (
        <View className={className}>
            {Array.from({ length: count }).map((_, index) => (
                <View
                    key={index}
                    className="flex-row items-center py-3 px-4 border-b border-secondary-100 dark:border-secondary-700"
                >
                    <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />
                    <View className="flex-1">
                        <Skeleton width="70%" height={14} className="mb-1.5" />
                        <Skeleton width="40%" height={12} />
                    </View>
                    <Skeleton width={60} height={24} borderRadius={12} />
                </View>
            ))}
        </View>
    );
}
