import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, Linking } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import { useAuth } from '../context/AuthContext';
import AuthLoadingOverlay from '../components/AuthLoadingOverlay';

const LoginPage = ({ navigation }) => {
  const { loginAs } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Establishing secure session...');

  const handleContactAdmin = () => {
    Linking.openURL('https://forms.gle/7P3vJnbaiFs8qHVJA').catch((err) =>
      console.log('Could not open contact form URL', err)
    );
  };

  const roles = [
    { key: 'student', label: 'Student', icon: 'school' },
    { key: 'staff', label: 'Staff', icon: 'badge' },
    { key: 'admin', label: 'Admin', icon: 'shield' },
    { key: 'services', label: 'Services', icon: 'support-agent' },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleNavigate = () => {
    if (selectedRole === 'student') {
      navigation.navigate('StudentLogin');
    } else if (selectedRole === 'staff') {
      navigation.navigate('StaffLogin');
    } else if (selectedRole === 'admin') {
      navigation.navigate('AdminLogin');
    } else if (selectedRole === 'services') {
      navigation.navigate('ServicesLogin');
    }
  };

  const handleQuickInspect = () => {
    if (isLoading) return;
    setIsLoading(true);
    const roleLabel = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
    setLoadingStatus(`Syncing ${roleLabel} Environment...`);

    setTimeout(() => {
      setLoadingStatus(`Launching ${roleLabel} Dashboard...`);
    }, 600);

    setTimeout(() => {
      if (selectedRole === 'services') {
        loginAs('SERVICES');
        navigation.navigate('CampusServiceDashboard');
      } else {
        const roleKey = selectedRole.toUpperCase();
        loginAs(roleKey);
        const target = roleKey === 'STUDENT' ? 'StudentDashboard' : roleKey === 'STAFF' ? 'StaffDashboard' : 'AdminDashboard';
        navigation.navigate(target);
      }
      setTimeout(() => setIsLoading(false), 500);
    }, 1250);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Header with Campus Hub Navigation */}
      <View style={styles.topNavBar}>
        <View style={styles.topNavLeft}>
          <Text style={styles.topNavBrand}>NEXUS</Text>
          <Text style={styles.topNavPortal}>Portal</Text>
        </View>

        <TouchableOpacity
          style={styles.campusHubBtn}
          onPress={() => navigation.navigate('CommonPortal')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="public" size={18} color="#003fb1" />
          <Text style={styles.campusHubBtnText}>Campus Hub</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Top Bar */}
            <View style={styles.topBar} />

            <View style={styles.cardContent}>
              {/* Header */}
              <View style={styles.header}>
                <Image
                  source={{ uri: '/info_logo.png' }}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.brandName}>NEXUS</Text>
                <Text style={styles.brandSubtitle}>Attendance & Campus Management</Text>
              </View>

              {/* Title */}
              <Text style={styles.welcomeTitle}>Sign in to your Portal</Text>

              {/* Role Selection */}
              <Text style={styles.roleLabel}>Select your role to continue</Text>
              <View style={styles.roleGrid}>
                {roles.map((role) => {
                  const isSelected = selectedRole === role.key;
                  return (
                    <TouchableOpacity
                      key={role.key}
                      style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                      onPress={() => handleRoleSelect(role.key)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={role.icon}
                        size={28}
                        color={isSelected ? Colors.primary : Colors.onSurfaceVariant}
                      />
                      <Text style={[styles.roleText, isSelected && styles.roleTextSelected]}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Navigate Button */}
              <TouchableOpacity style={[styles.continueButton, isLoading && { opacity: 0.7 }]} onPress={handleNavigate} activeOpacity={0.8} disabled={isLoading}>
                <Text style={styles.continueButtonText}>Continue to Login</Text>
                <MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} />
              </TouchableOpacity>

              {/* Instant Inspect (No Backend/Database Required) */}
              <TouchableOpacity style={styles.inspectButton} onPress={handleQuickInspect} activeOpacity={0.8}>
                <MaterialIcons name="visibility" size={18} color="#003fb1" />
                <Text style={styles.inspectButtonText}>Instant Inspect ({selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Dashboard)</Text>
              </TouchableOpacity>

              {/* Campus Hub Quick Access Box */}
              <TouchableOpacity
                style={styles.commonHubCard}
                onPress={() => navigation.navigate('CommonPortal')}
                activeOpacity={0.8}
              >
                <View style={styles.commonHubIcon}>
                  <MaterialIcons name="grid-view" size={22} color="#003fb1" />
                </View>
                <View style={styles.commonHubTextContainer}>
                  <Text style={styles.commonHubTitle}>Public Campus Hub</Text>
                  <Text style={styles.commonHubSubtitle}>Circulars, Timetables, Calendar & Q-Fix</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#003fb1" />
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.footerDivider} />
                <TouchableOpacity
                  style={styles.footerContent}
                  onPress={handleContactAdmin}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="help-outline" size={14} color={Colors.onSurfaceVariant} />
                  <Text style={styles.footerText}>
                    Need help?{' '}
                    <Text style={styles.footerLink}>Contact Dept. Admin</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* ================= CINEMATIC LOADING OVERLAY ================= */}
      {isLoading && (
        <div className="campus-morph-overlay" role="dialog" aria-modal="true" aria-label="Loading Portal">
          <div className="campus-morph-backdrop" />
          <div className="campus-morph-card">
            {/* Glowing Logo Crest with Dual Orbital Rings */}
            <div className="campus-morph-crest-box">
              <div className="campus-morph-orbital-ring outer" />
              <div className="campus-morph-orbital-ring inner" />
              <div className="campus-morph-crest">
                <img src="/info_logo.png" alt="Info Institute of Technology" />
              </div>
            </div>

            {/* Badges & Titles */}
            <div className="campus-morph-badge">SECURE INSTITUTIONAL GATEWAY</div>
            <h2 className="campus-morph-title">NEXUS Portal</h2>
            <p className="campus-morph-sub">Info Institute of Technology</p>

            {/* High-Tech Glowing Progress Bar */}
            <div className="campus-morph-progress-track">
              <div className="campus-morph-progress-bar" />
            </div>

            {/* Dynamic Status Indicator */}
            <div className="campus-morph-status">
              <span className="campus-morph-dot" />
              <span className="campus-morph-status-text">{loadingStatus}</span>
            </div>
          </div>
        </div>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  topNavBar: {
    height: 56,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  topNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topNavBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#003fb1',
    letterSpacing: -0.5,
  },
  topNavPortal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  campusHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dbe1ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  campusHubBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003fb1',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    paddingBottom: 24,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
  },
  topBar: {
    height: 6,
    backgroundColor: Colors.primary,
    width: '100%',
  },
  cardContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  welcomeTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 20,
  },
  roleLabel: {
    ...Typography.labelMd,
    color: Colors.onSurface,
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
  },
  roleCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(219, 225, 255, 0.15)',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 6,
    textAlign: 'center',
  },
  roleTextSelected: {
    color: Colors.primary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  inspectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  inspectButtonText: {
    color: '#003fb1',
    fontSize: 14,
    fontWeight: '700',
  },
  commonHubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3fe',
    borderWidth: 1,
    borderColor: '#dbe1ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  commonHubIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commonHubTextContainer: {
    flex: 1,
  },
  commonHubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#003fb1',
  },
  commonHubSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  footer: {
    marginTop: 4,
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(195, 197, 215, 0.3)',
    marginBottom: 14,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomBarItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  bottomBarItemActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#dbe1ff',
    borderRadius: 20,
  },
  bottomBarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  bottomBarTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003fb1',
  },
});

export default LoginPage;
