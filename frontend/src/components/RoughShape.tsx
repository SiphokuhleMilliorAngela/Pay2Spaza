import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// A box with a hand-drawn outline (path comes from the Figma welcome frame). Stretches to fill its box.
export function RoughShape({ path, vb, fill, stroke, strokeWidth = 3, style, children }: {
  path: string; vb: [number, number]; fill: string; stroke: string; strokeWidth?: number;
  style?: StyleProp<ViewStyle>; children?: ReactNode;
}) {
  return (
    <View style={style}>
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox={`0 0 ${vb[0]} ${vb[1]}`} preserveAspectRatio="none">
        <Path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      </Svg>
      {children}
    </View>
  );
}
