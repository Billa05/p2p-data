import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { ReactNode } from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  icon,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) {
  // Get styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      case 'primary':
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        disabled || isLoading ? styles.disabledContainer : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : '#3B82F6'} 
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text 
            style={[
              styles.text, 
              variantStyles.text,
              disabled ? styles.disabledText : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 48,
  },
  primaryContainer: {
    backgroundColor: '#3B82F6',
  },
  secondaryContainer: {
    backgroundColor: '#EBF5FF',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  disabledContainer: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#3B82F6',
  },
  outlineText: {
    color: '#3B82F6',
  },
  ghostText: {
    color: '#3B82F6',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  iconContainer: {
    marginRight: 8,
  },
});

// Add View import to satisfy TypeScript
import { View } from 'react-native';