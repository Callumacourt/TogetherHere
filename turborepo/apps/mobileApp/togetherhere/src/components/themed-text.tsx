import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'small' | 'code';
  lightColor?: string;
  darkColor?: string;
}

export function ThemedText({
  type = 'default',
  style,
  ...props
}: ThemedTextProps) {
  const fontSizeMap = {
    default: 16,
    title: 28,
    subtitle: 20,
    small: 12,
    code: 14,
  };

  return (
    <Text
      style={[
        { fontSize: fontSizeMap[type], color: '#fff' },
        type === 'code' && { fontFamily: 'monospace' },
        style,
      ]}
      {...props}
    />
  );
}
