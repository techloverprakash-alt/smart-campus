import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';

const NavigationDrawer = ({ items, activeItem, portalName, subtitle, version, profileImage, onItemPress }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{portalName ? portalName.charAt(0) : 'A'}</Text>
          </View>
        )}
        <View>
          <Text style={styles.portalName}>{portalName || 'Portal'}</Text>
          <Text style={styles.subtitle}>{subtitle || 'Dept. of Artificial Intelligence & Data Science'}</Text>
        </View>
      </View>

      {/* Nav Items */}
      <ScrollView style={styles.navItems} showsVerticalScrollIndicator={false}>
        {items.map((item, index) => {
          const isActive = activeItem === item.key;
          return (
            <TouchableOpacity
              key={item.key || index}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onItemPress && onItemPress(item)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={item.icon}
                size={24}
                color={isActive ? Colors.primary : Colors.onSurfaceVariant}
              />
              <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      {version && (
        <View style={styles.footer}>
          <Text style={styles.versionText}>{version}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 256,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.outlineVariant,
    paddingVertical: 24,
    paddingHorizontal: 16,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
    fontSize: 18,
  },
  portalName: {
    ...Typography.headlineSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.labelSm,
    color: Colors.secondary,
  },
  navItems: {
    flex: 1,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: 'rgba(26, 86, 219, 0.1)',
    borderRightWidth: 4,
    borderRightColor: Colors.primary,
  },
  navItemText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  navItemTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
  },
  versionText: {
    ...Typography.labelSm,
    color: Colors.outline,
    paddingHorizontal: 16,
  },
});

export default NavigationDrawer;
