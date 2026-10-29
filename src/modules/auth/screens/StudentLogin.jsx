import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import { login } from '../../../services/api/auth';
import { useAuth } from '../context/AuthContext';
import AuthLoadingOverlay from '../components/AuthLoadingOverlay';

const StudentLogin = ({ navigation }) => {
  const { signIn } = useAuth();
  const [registerNumber, setRegisterNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const regNo = registerNumber.trim();
    const pass = password;

    if (!regNo || !pass) {
      setError('Please enter your Register Number and Password.');
      return;
    }

    setLoading(true);
    try {
      const tokenData = await login(regNo, pass, 'STUDENT');
      await signIn(tokenData);
      setTimeout(() => {
        navigation.replace('StudentDashboard');
      }, 1250);
    } catch (err) {
      setLoading(false);
      setError(err?.message || 'Login failed. Please check your credentials.');
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
          <MaterialIcons name="arrow-back" size={20} color="#334155" />
          <Text style={styles.backButtonText}>Roles</Text>
        </TouchableOpacity>

        
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Background decorations represented as simple views */}
        <View style={styles.bgDecor1} />
        <View style={styles.bgDecor2} />

        <View style={styles.container}>
          {/* Logo Header */}
          <View style={styles.logoHeader}>
            <Image
              source={{ uri: '/info_logo.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>NEXUS</Text>
            <Text style={styles.portalLabel}>Student Portal Authentication</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Student Login</Text>
              <Text style={styles.cardSubtitle}>Enter your student credentials to access your attendance and portal.</Text>
            </View>

            {/* Register Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Register Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="badge" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 21AD001 or 714022AD001"
                  placeholderTextColor={Colors.outline}
                  value={registerNumber}
                  onChangeText={setRegisterNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
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

            {/* Error Banner */}
            {!!error && (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={16} color="#b91c1c" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.75 }]}
              className="auth-submit-btn"
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                  <MaterialIcons name="login" size={20} color={Colors.onPrimary} />
                </>
              )}
            </TouchableOpacity>

            {/* Quick Access to Common Hub */}
            <TouchableOpacity
              style={styles.commonHubRow}
              onPress={() => navigation.navigate('CommonPortal', { role: 'student' })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="grid-view" size={16} color="#003fb1" />
              <Text style={styles.commonHubRowText}>View Public Campus Hub (Circulars & Timetables)</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Need help with your student account?</Text>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Contact Academic Coordinator</Text>
              <MaterialIcons name="arrow-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <AuthLoadingOverlay visible={loading} role="Student" />
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
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(219, 225, 255, 0.4)',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(235, 237, 248, 0.5)',
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  brandName: {
    ...Typography.headlineLgMobile,
    color: Colors.primary,
    textAlign: 'center',
  },
  portalLabel: {
    ...Typography.labelMd,
    color: Colors.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  cardSubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  fieldGroup: {
    marginBottom: 16,
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
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
    marginTop: 14,
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
    marginTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLinkText: {
    ...Typography.labelMd,
    color: Colors.primary,
  },
});

export default StudentLogin;
