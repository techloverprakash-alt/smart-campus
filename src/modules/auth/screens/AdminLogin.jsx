import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import { login } from '../../../services/api/auth';
import { useAuth } from '../context/AuthContext';

const AdminLogin = ({ navigation }) => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFA, setTwoFA] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const user = username.trim();
    const pass = password;

    if (!user || !pass) {
      setError('Please enter your Admin username/email and Password.');
      return;
    }

    setLoading(true);
    try {
      const tokenData = await login(user, pass, 'ADMIN');
      await signIn(tokenData);
      navigation.replace('AdminDashboard');
    } catch (err) {
      setError(err?.message || 'Authorization failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header with Back and Campus Hub */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={20} color="#126decff" />
          <Text style={styles.backButtonText}>Roles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.campusHubButton}
          onPress={() => navigation.navigate('CommonPortal', { role: 'admin' })}
          activeOpacity={0.8}
        >
          <MaterialIcons name="public" size={16} color="#8d8f94ff" />
          <Text style={styles.campusHubButtonText}>Campus Hub</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Background decorations */}
        <View style={styles.bgDecor1} />
        <View style={styles.bgDecor2} />

        <View style={styles.container}>
          {/* Branding Header */}
          <View style={styles.brandHeader}>
            <Image
              source={{ uri: '/info_logo.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.brandRow}>
              <Text style={styles.brandName}>NEXUS</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>System-wide governance and management access.</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            {/* Top gradient bar */}
            <View style={styles.gradientBar} />

            <View style={styles.cardHeader}>
              <View style={styles.headerIconWrapper}>
                <MaterialIcons name="admin-panel-settings" size={24} color={Colors.primary} />
              </View>
              <View style={styles.headerTexts}>
                <Text style={styles.cardTitle}>Administrative Access</Text>
                <Text style={styles.cardSubtitle}>Enter your institutional credentials to authenticate.</Text>
              </View>
            </View>

            {/* Username Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Admin Username / ID</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ADM-2024-001"
                  placeholderTextColor={Colors.outline}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Master Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotLink}>Reset Key?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={Colors.outline}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.visibilityButton}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={Colors.outline}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 2FA Token Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>2FA Security Token</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="security" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="6-digit code"
                  placeholderTextColor={Colors.outline}
                  value={twoFA}
                  onChangeText={setTwoFA}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            {/* Remember Device Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberDevice(!rememberDevice)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberDevice && styles.checkboxChecked]}>
                {rememberDevice && <MaterialIcons name="check" size={14} color={Colors.onPrimary} />}
              </View>
              <Text style={styles.checkboxLabel}>Trust this device for 30 days</Text>
            </TouchableOpacity>

            {/* Error Banner */}
            {!!error && (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={16} color="#c61616ff" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.75 }]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <>
                  <MaterialIcons name="verified-user" size={20} color={Colors.onPrimary} />
                  <Text style={styles.submitButtonText}>Authorize Session</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Quick Demo Credentials Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <Text style={{ fontSize: 11, color: Colors.onSurfaceVariant, fontWeight: '500' }}>Demo fill:</Text>
              <TouchableOpacity
                onPress={() => {
                  setUsername('ADM001');
                  setPassword('Admin@123');
                  setError('');
                }}
                style={{ backgroundColor: '#eef2ff', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#dbe1ff' }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#003fb1' }}>ADM001</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Access to Common Hub */}
            <TouchableOpacity
              style={styles.commonHubRow}
              onPress={() => navigation.navigate('CommonPortal', { role: 'admin' })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="grid-view" size={16} color="#003fb1" />
              <Text style={styles.commonHubRowText}>View Public Campus Hub (Circulars & Timetables)</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <MaterialIcons name="lock-outline" size={16} color={Colors.outline} />
            <Text style={styles.footerText}>Secure 256-Bit Encrypted Portal Access</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
  },
  topHeader: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  campusHubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dbe1ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  campusHubButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#003fb1',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  bgDecor1: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(219, 225, 255, 0.35)',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(235, 237, 248, 0.45)',
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    ...Typography.headlineLgMobile,
    color: Colors.primary,
  },
  adminBadge: {
    backgroundColor: Colors.errorContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    ...Typography.bodyMd,
    color: Colors.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    padding: 24,
    paddingTop: 20,
  },
  gradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.titleMd,
    color: Colors.onSurface,
    fontWeight: '600',
  },
  cardSubtitle: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  forgotLink: {
    ...Typography.labelSm,
    color: Colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 8,
    height: 42,
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    ...Typography.bodyMd,
    color: Colors.onSurface,
    height: '100%',
  },
  visibilityButton: {
    paddingRight: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 13,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: 8,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '500',
  },
  commonHubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f3fe',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbe1ff',
  },
  commonHubRowText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#003fb1',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  footerText: {
    ...Typography.bodySm,
    color: Colors.outline,
    fontSize: 12,
  },
});

export default AdminLogin;
