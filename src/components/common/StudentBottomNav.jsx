import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from '@/ui';
import { MaterialIcons } from '@/ui';

const navTabs = [
  { key: 'home', label: 'Home', icon: 'grid-view', screen: 'StudentDashboard' },
  { key: 'attendance', label: 'Attendance', icon: 'how-to-reg', screen: 'StudentAttendanceDetail' },
  { key: 'materials', label: 'Materials', icon: 'menu-book', screen: 'StudyMaterials' },
  { key: 'profile', label: 'Profile', icon: 'person', screen: 'StudentProfile' },
];

const StudentBottomNav = ({ activeTab, navigation }) => {
  return (
    <View className="bottom-nav" style={styles.bottomNavigation}>
      {navTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            style={styles.navItem}
            onPress={() => {
              if (tab.screen) navigation?.navigate(tab.screen);
            }}
          >
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <MaterialIcons
                name={tab.icon}
                size={22}
                color={isActive ? '#003fb1' : '#64748b'}
              />
            </View>
            <Text
              style={[styles.navText, isActive && styles.activeNavText]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 48,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#dbe1ff',
  },
  navText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.2,
  },
  activeNavText: {
    fontWeight: '700',
    color: '#003fb1',
  },
});

export default StudentBottomNav;
