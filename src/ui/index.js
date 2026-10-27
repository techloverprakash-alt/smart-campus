/**
 * Web UI primitives.
 *
 * Screens were originally written with React Native components. This module
 * exposes the same names implemented on top of the DOM, so screen code keeps
 * its structure while running as a normal React web app.
 */
export {
  View, Text, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, Pressable,
  ScrollView, SafeAreaView, KeyboardAvoidingView, Image, ImageBackground, TextInput,
  ActivityIndicator, StatusBar, RefreshControl, FlatList, Switch,
} from './core';
export { StyleSheet } from './style';
export {
  Platform, Dimensions, useWindowDimensions, useBreakpoint, useColorScheme, Keyboard, PixelRatio,
  Linking, Share, Modal, Alert, AlertHost, LinearGradient, BlurView,
} from './platform';
export { Animated, Easing } from './Animated';
export { MaterialIcons } from './icons';
export { default as AsyncStorage } from './storage';
