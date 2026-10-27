import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../constants/colors';

const defaultStaffNavItems = [
  { key: 'home', label: 'Home', icon: 'dashboard', screen: 'StaffDashboard' },
  { key: 'attendance', label: 'Attendance', icon: 'how-to-reg', screen: 'MarkAttendance' },
  { key: 'timetable', label: 'Timetable', icon: 'push-pin', screen: 'StaffTimetable' },
  { key: 'notes', label: 'Notes & QP', icon: 'menu-book', screen: 'StaffNotes' },
  { key: 'profile', label: 'Profile', icon: 'person', screen: 'StaffProfile' },
];

const BottomNavBar = ({ items, activeItem, onItemPress, navigation }) => {
  const navList = items && items.length > 0 ? items : defaultStaffNavItems;

  const handlePress = (item) => {
    if (onItemPress) {
      onItemPress(item);
    } else if (item.screen && navigation) {
      navigation?.navigate(item.screen);
    }
  };

  return (
    <View className="bottom-nav" style={styles.container}>
      {navList.map((item, index) => {
        const isActive = activeItem === item.key;
        return (
          <TouchableOpacity
            key={item.key || index}
            style={styles.navItem}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <MaterialIcons
                name={item.icon}
                size={22}
                color={isActive ? '#003fb1' : '#585f6c'}
              />
            </View>
            <Text
              style={[styles.navItemText, isActive && styles.navItemTextActive]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#dbe1ff',
  },
  navItemText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#585f6c',
    marginTop: 2,
  },
  navItemTextActive: {
    fontWeight: '700',
    color: '#003fb1',
  },
});

export default BottomNavBar;
