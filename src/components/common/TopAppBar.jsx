import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';

const TopAppBar = ({
  title,
  profileImage,
  onNotificationPress,
  onMenuPress,
  showMenu,
  showBack,
  onBackPress,
  onProfilePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
        )}
        {showMenu && !showBack && (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
        )}
        {profileImage ? (
          <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8} style={styles.profileWrapper}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
              onError={(e) => {
                if (e?.target) e.target.src = '/info_logo.png';
              }}
            />
          </TouchableOpacity>
        ) : onProfilePress ? (
          <TouchableOpacity
            onPress={onProfilePress}
            activeOpacity={0.8}
            style={[styles.profileImage, styles.profileFallback]}
          >
            <MaterialIcons name="person" size={20} color={Colors.primary} />
          </TouchableOpacity>
        ) : (!title || title === 'NEXUS') ? (
          <Image source={{ uri: '/info_logo.png' }} style={styles.profileImage} />
        ) : null}
        <Text style={styles.title}>{title || 'NEXUS'}</Text>
      </View>
      <View style={styles.rightSection}>
        {onNotificationPress && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="notifications" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 40,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    ...Typography.headlineMd,
    color: Colors.primary,
    fontWeight: '700',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    objectFit: 'cover',
  },
  profileWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileFallback: {
    backgroundColor: '#e4ecff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default TopAppBar;
