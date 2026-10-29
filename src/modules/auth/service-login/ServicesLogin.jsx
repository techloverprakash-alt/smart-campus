import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import { useAuth } from '../context/AuthContext';
import AuthLoadingOverlay from '../components/AuthLoadingOverlay';

const ServicesLogin = ({ navigation }) => {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (demoRole = null) => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const role = demoRole || 'SERVICES';
      const name = role === 'STAFF' ? 'Prof. M. Selvam' : (role === 'STUDENT' ? 'Prakash S' : 'Er. Rajesh Kumar');
      signIn({
        access_token: 'mock-services-token',
        refresh_token: 'mock-refresh-services',
        user: {
          id: 101,
          name,
          role,
          identifier: identifier.trim() || (role === 'STAFF' ? 'FAC-AIDS-018' : (role === 'STUDENT' ? 'CS-2023-8841' : 'SVC-FAC-042')),
        },
        profile: {
          full_name: name,
          designation: role === 'STAFF' ? 'Assistant Professor (Sr. Gr.)' : (role === 'STUDENT' ? 'Student' : 'Campus Facilities & Operations Lead'),
          department: { name: 'Campus Services & Facilities Desk' },
        },
      });
      setLoading(false);
      if (demoRole === 'STUDENT' || demoRole === 'STAFF') {
        navigation.navigate('StudentFacultyPortal');
      } else {
        navigation.navigate('CampusServiceDashboard');
      }
    }, 400);
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
        {/* Background decorations */}
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
            <Text style={styles.portalLabel}>Campus Services & Facilities Desk</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="support-agent" size={26} color="#003fb1" />
              </View>
              <Text style={styles.cardTitle}>Campus Services Login</Text>
              <Text style={styles.cardSubtitle}>
                Access infrastructure repair tickets, Lost & Found reconciliation, and campus security custody.
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={18} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Institutional ID or Badge */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Campus Roll No. or Staff ID</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="badge" size={20} color="#737686" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. CS-2023-8841 or FAC-018"
                  placeholderTextColor="#9ca3af"
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    setError('');
                  }}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" size={20} color="#737686" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Enter your institutional password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#737686"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => handleLogin()}
              activeOpacity={0.8}
              disabled={loading}
            >
              <MaterialIcons name="login" size={20} color="#ffffff" />
              <Text style={styles.loginButtonText}>
                {loading ? 'Authenticating...' : 'Sign in to Services'}
              </Text>
            </TouchableOpacity>

            
          </View>
        </View>
      </ScrollView>
      <AuthLoadingOverlay visible={loading} role="Campus Services" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  campusHubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  campusHubButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003fb1',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  bgDecor1: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(219, 234, 254, 0.4)',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(238, 242, 255, 0.5)',
  },
  container: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#003fb1',
    letterSpacing: -0.5,
  },
  portalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  loginCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 0,
    outlineWidth: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#003fb1',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  demoHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003fb1',
  },
});

export default ServicesLogin;
