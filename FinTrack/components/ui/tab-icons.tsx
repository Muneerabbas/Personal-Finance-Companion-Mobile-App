import Svg, { Path, Rect } from 'react-native-svg';

type IconProps = {
  color: string;
  size?: number;
};

export function HomeTabIcon({ color, size = 30 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.95 10.12 10.98 3.96a1.42 1.42 0 0 1 1.88 0l7.2 6.3c.74.65.28 1.86-.7 1.86h-.74v5.9a2.1 2.1 0 0 1-2.1 2.1H7.48a2.1 2.1 0 0 1-2.1-2.1v-5.9h-.74c-1 0-1.46-1.24-.69-1.9Z"
        fill={color}
      />
    </Svg>
  );
}

export function TransactionTabIcon({ color, size = 30 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.2 8.15c0-.9.73-1.63 1.63-1.63h9.34L13.8 5.2a1.05 1.05 0 1 1 1.48-1.48l3.08 3.08a1.05 1.05 0 0 1 0 1.48l-3.08 3.08a1.05 1.05 0 1 1-1.48-1.48l1.37-1.32H5.83c-.9 0-1.63-.73-1.63-1.63Z"
        fill={color}
      />
      <Path
        d="M19.8 15.85c0 .9-.73 1.63-1.63 1.63H8.83l1.37 1.32a1.05 1.05 0 0 1-1.48 1.48L5.64 17.2a1.05 1.05 0 0 1 0-1.48l3.08-3.08a1.05 1.05 0 0 1 1.48 1.48l-1.37 1.32h9.34c.9 0 1.63.73 1.63 1.63Z"
        fill={color}
      />
      <Rect x="3.4" y="6.95" width="2.1" height="2.4" rx="1.05" fill={color} opacity={0.9} />
      <Rect x="18.5" y="14.65" width="2.1" height="2.4" rx="1.05" fill={color} opacity={0.9} />
    </Svg>
  );
}

export function BudgetTabIcon({ color, size = 30 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.4a8.6 8.6 0 1 0 8.6 8.6H12V3.4Z"
        fill={color}
        opacity={0.96}
      />
      <Path d="M13.9 3.75a7.35 7.35 0 0 1 6.35 6.35H13.9V3.75Z" fill={color} opacity={0.55} />
    </Svg>
  );
}

export function ProfileTabIcon({ color, size = 30 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.1 3.95a1.25 1.25 0 0 1 1.17-.85h5.46c.54 0 1.02.34 1.18.85l.8 2.5h2.12c1.02 0 1.58 1.2.92 1.98l-2.36 2.78.8 5.03c.16 1.01-.94 1.76-1.82 1.24L12 15.22l-4.37 2.26c-.88.52-1.98-.23-1.82-1.24l.8-5.03-2.36-2.78c-.66-.78-.1-1.98.92-1.98h2.12l.8-2.5Z"
        fill={color}
      />
      <Path
        d="M9.95 19.15a1.15 1.15 0 0 1 1.15-1.15h1.8a1.15 1.15 0 0 1 1.15 1.15v.7c0 .64-.51 1.15-1.15 1.15h-1.8c-.64 0-1.15-.51-1.15-1.15v-.7Z"
        fill={color}
        opacity={0.9}
      />
    </Svg>
  );
}

export function PlusTabIcon({ color, size = 38 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="10.7" y="3.4" width="2.6" height="17.2" rx="1.3" fill={color} />
      <Rect x="3.4" y="10.7" width="17.2" height="2.6" rx="1.3" fill={color} />
    </Svg>
  );
}
