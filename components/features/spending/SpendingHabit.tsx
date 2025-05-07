import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withSequence,
  withRepeat,
  Easing 
} from 'react-native-reanimated';

// USDC Icon Component
const USDCIcon = () => (
  <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
    <Path
      d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z"
      fill="#2775CA"
    />
    <Path
      d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z"
      fill="white"
    />
    <Path
      d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z"
      fill="white"
    />
  </Svg>
);

// Spending Habit Icon Component
const SpendingHabitIcon = () => (
  <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
    <Path
      d="M22.7593 14.7702C22.8682 14.0583 22.9375 13.3478 22.9375 12.653C22.9375 11.194 22.7026 9.72824 22.2378 8.29174C21.7471 6.79464 20.3984 5.63844 18.7207 5.27614C14.9355 4.44994 10.9375 4.45094 7.1563 5.27514C5.4766 5.63844 4.1279 6.79464 3.6357 8.29564C3.1724 9.72824 2.9375 11.194 2.9375 12.653C2.9375 14.112 3.1724 15.5778 3.6372 17.0143C4.1279 18.5114 5.4766 19.6676 7.1543 20.0299C9.0352 20.441 10.9468 20.6481 12.855 20.6481C13.0818 20.6481 13.3085 20.6363 13.5352 20.6303C13.8449 21.2455 14.2643 21.7959 14.7549 22.2242C14.7925 22.2623 14.8662 22.3375 14.9756 22.4127C15.938 23.2126 17.1641 23.653 18.4375 23.653C19.7754 23.653 21.0547 23.1735 22.0269 22.3132C23.2412 21.276 23.9375 19.7594 23.9375 18.153C23.9375 17.2917 23.7339 16.4372 23.3457 15.6745C23.1663 15.3266 22.9601 15.0152 22.7593 14.7702ZM7.5811 7.22924C9.3335 6.84734 11.1357 6.65304 12.9375 6.65304C14.7393 6.65304 16.5415 6.84734 18.2959 7.23014C19.2847 7.44404 20.0669 8.08954 20.3359 8.91084C20.4156 9.15724 20.4815 9.40504 20.5455 9.65304H5.3293C5.393 9.40624 5.4584 9.15964 5.5376 8.91474C5.8081 8.08954 6.5903 7.44404 7.5811 7.22924ZM7.5791 18.0759C6.5903 17.862 5.8081 17.2165 5.5391 16.3952C5.1396 15.1608 4.9375 13.902 4.9375 12.653C4.9375 12.3201 4.9541 11.9866 4.9827 11.653H20.8922C20.9208 11.9866 20.9375 12.3201 20.9375 12.653C20.9375 12.8503 20.9321 13.0485 20.9219 13.2477C20.8874 13.2301 20.8506 13.218 20.8158 13.2012C20.744 13.1664 20.6705 13.137 20.5974 13.1054C20.445 13.0398 20.2908 12.9805 20.1332 12.9291C20.052 12.9026 19.9708 12.8775 19.8884 12.8549C19.7258 12.8103 19.5611 12.7752 19.3945 12.7458C19.3193 12.7325 19.2453 12.7159 19.1695 12.7058C18.9279 12.6736 18.6841 12.653 18.4375 12.653C16.8301 12.653 15.314 13.3493 14.2886 14.5505C13.4175 15.5358 12.9375 16.8151 12.9375 18.153C12.9375 18.32 12.9448 18.485 12.959 18.6481C11.1685 18.6471 9.356 18.4645 7.5791 18.0759ZM20.7148 20.8044C19.496 21.8806 17.4541 21.903 16.2182 20.8444C16.1933 20.8229 16.1669 20.8024 16.1401 20.7829C16.1372 20.7809 16.1333 20.777 16.1279 20.7722C15.6689 20.3689 15.3257 19.8572 15.1255 19.2663C15.001 18.9284 14.9375 18.5544 14.9375 18.153C14.9375 17.3034 15.2393 16.4948 15.7979 15.862C16.8921 14.5808 18.9087 14.277 20.3536 15.2292C20.5719 15.3669 20.7725 15.5378 20.9503 15.738C20.9781 15.7692 21.0084 15.7985 21.0406 15.8269L21.1519 15.9568C21.3047 16.1384 21.4449 16.3523 21.5665 16.5867C21.8091 17.0641 21.9375 17.6061 21.9375 18.153C21.9375 19.1735 21.4966 20.1364 20.7148 20.8044Z"
      fill="#878787"
    />
    <Path
      d="M8.9375 14.6528H7.9375C7.3853 14.6528 6.9375 15.1001 6.9375 15.6528C6.9375 16.2055 7.3853 16.6528 7.9375 16.6528H8.9375C9.4897 16.6528 9.9375 16.2055 9.9375 15.6528C9.9375 15.1001 9.4897 14.6528 8.9375 14.6528ZM19.2305 16.9458L17.9375 18.2387L17.6445 17.9457C17.2539 17.5551 16.6211 17.5551 16.2304 17.9457C15.8397 18.3363 15.8398 18.9691 16.2304 19.3598L17.2304 20.3598C17.4258 20.5551 17.6816 20.6528 17.9375 20.6528C18.1934 20.6528 18.4492 20.5551 18.6445 20.3598L20.6445 18.3598C21.0351 17.9692 21.0351 17.3364 20.6445 16.9457C20.2539 16.555 19.6211 16.5551 19.2305 16.9458Z"
      fill="#878787"
    />
  </Svg>
);

// Arrow Up Icon Component
const ArrowUpIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path
      d="M7 3.5L7 10.5"
      stroke="#2DB300"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.5 7L7 3.5L10.5 7"
      stroke="#2DB300"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Animated Bar Component
const AnimatedBar = ({ 
  height, 
  delay, 
  isHighest,
  index,
  day,
  amount,
  onPress,
  isSelected
}: { 
  height: number; 
  delay: number; 
  isHighest: boolean;
  index: number;
  day: string;
  amount: number;
  onPress: () => void;
  isSelected: boolean;
}) => {
  const animatedHeight = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const highlightValue = useSharedValue(0);
  
  // Animation configuration
  useEffect(() => {
    // Height animation with slight bounce effect
    animatedHeight.value = withDelay(
      delay,
      withTiming(height * 1.1, { 
        duration: 600,
        easing: Easing.out(Easing.cubic) 
      }, () => {
        animatedHeight.value = withTiming(height, {
          duration: 200,
          easing: Easing.bounce
        });
      })
    );
    
    // Pulse animation for the highest bar
    if (isHighest) {
      pulseValue.value = withDelay(
        800 + delay,
        withRepeat(
          withSequence(
            withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Infinite repeat
          true // Reverse
        )
      );
    }
  }, []);

  // Selection highlight animation effect
  useEffect(() => {
    highlightValue.value = withTiming(isSelected ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease)
    });
  }, [isSelected]);
  
  const animatedStyle = useAnimatedStyle(() => {
    // Determine the color - selected bars get a special highlight effect
    const baseColor = isHighest ? '#40FF00' : '#D3D3D3';
    const highlightColor = isHighest ? '#40FF00' : '#A3A3A3';
    
    return {
      height: animatedHeight.value,
      backgroundColor: isSelected ? highlightColor : baseColor,
      width: 28,
      borderRadius: 10,
      transform: [
        { scaleX: isHighest ? pulseValue.value : 1 },
        { scaleY: 1 + (highlightValue.value * 0.05) } // Subtle height animation on selection
      ],
      // // Add subtle shadow when selected - TEMPORARILY REMOVED FOR DEBUGGING
      // shadowColor: '#000',
      // shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
      // shadowOpacity: highlightValue.value * 0.2,
      // shadowRadius: highlightValue.value * 3,
      // elevation: isSelected ? 3 : 0
    };
  });
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={animatedStyle} />
    </TouchableOpacity>
  );
};

const SpendingHabit = () => {
  const barData = [
    { height: 36, day: 'S', amount: 23.45, label: 'Sunday' },
    { height: 64, day: 'M', amount: 42.19, label: 'Monday' },
    { height: 71, day: 'T', amount: 47.32, label: 'Tuesday' },
    { height: 57, day: 'W', amount: 36.78, label: 'Wednesday' },
    { height: 87, day: 'T', amount: 58.93, label: 'Thursday' },
    { height: 54, day: 'F', amount: 35.12, label: 'Friday' },
    { height: 71, day: 'S', amount: 47.29, label: 'Saturday' },
  ];
  
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  
  const handleBarPress = (index: number) => {
    setSelectedDayIndex(selectedDayIndex === index ? null : index);
  };

  // Calculate weekly total
  const weeklyTotal = barData.reduce((sum, item) => sum + item.amount, 0);

  // Determine displayed amount and title based on selection
  const displayedAmount = selectedDayIndex !== null 
    ? barData[selectedDayIndex].amount 
    : weeklyTotal;
    
  const displayedTitle = selectedDayIndex !== null 
    ? `Total spent ${barData[selectedDayIndex].label}`
    : 'Total spent this week';
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SpendingHabitIcon />
        <Text style={styles.headerText}>Spending habit</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <View style={styles.amountRow}>
            <USDCIcon />
            <Text style={styles.amountText}>
              {displayedAmount.toFixed(2)} USDC
            </Text>
          </View>
          
          <View style={styles.spentInfo}>
            <Text style={styles.spentText}>{displayedTitle}</Text>
            
            {selectedDayIndex === null && (
              <View style={styles.changeContainer}>
                <ArrowUpIcon />
                <Text style={styles.increaseText}>1.6%</Text>
                <Text style={styles.spentText}>from last week</Text>
              </View>
            )}
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {barData.map((item, index) => (
            <View key={index} style={styles.dayColumn}>
              <AnimatedBar 
                height={item.height} 
                delay={index * 100} 
                isHighest={index === 4} 
                index={index}
                day={item.day}
                amount={item.amount}
                onPress={() => handleBarPress(index)}
                isSelected={selectedDayIndex === index}
              />
              <Text style={[
                styles.dayText, 
                selectedDayIndex === index && styles.selectedDayText
              ]}>
                {item.day}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Generated by {' '}
        <Text style={styles.footerHighlight}>Fin AI®</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  headerText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    color: '#878787',
  },
  content: {
    flexDirection: 'column',
    width: '100%',
    gap: 24,
  },
  amountContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 24,
    color: '#121212',
  },
  spentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  spentText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 14,
    color: '#A3A3A3',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 4,
  },
  increaseText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 14,
    color: '#2DB300',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    gap: 16,
    height: 114,
  },
  dayColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    width: 28,
  },
  dayText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
    color: '#878787',
  },
  footer: {
    width: '100%',
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 14,
    color: '#A3A3A3',
  },
  footerHighlight: {
    color: '#000000', // Black color for "Fin AI®"
  },
  selectedDayText: {
    color: '#40FF00',
    fontWeight: '700',
  },
});

export default SpendingHabit; 