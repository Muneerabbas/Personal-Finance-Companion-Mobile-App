import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Fonts } from '@/constants/theme';

type HeaderProps = {
  month?: string;
  onPressMonth?: () => void;
  onPressNotifications?: () => void;
};

export default function Header({
  month = 'October',
  onPressMonth,
  onPressNotifications,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarPlaceholder}>
        <Ionicons name="person" size={20} color="#7F3DFF" />
      </View>

      <TouchableOpacity style={styles.monthWrap} onPress={onPressMonth} activeOpacity={0.8}>
        <Ionicons name="chevron-down" size={18} color="#7F3DFF" />
        <Text style={styles.monthText}>{month}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={onPressNotifications} activeOpacity={0.8}>
        <Ionicons name="notifications" size={22} color="#7F3DFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1E8FF',
    borderWidth: 1,
    borderColor: '#E2D2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: '#1F2937',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
