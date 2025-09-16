import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const sharedStyles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    width: '100%',
  },
  authLinearGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    width: '100%',
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: 'red',
  },

  // Contained Button - filled background, rounded corners, centered text
  buttonContained: {
    backgroundColor: '#1ABC9C', // primary teal
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainedText: {
    color: colors.backgroundDefault, // text on teal
    fontSize: 16,
    fontWeight: '600',
  },

  // Outlined Button - transparent background, teal border, rounded corners
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutlinedText: {
    color: colors.white, // text matches border color
    fontSize: 16,
    fontWeight: '600',
  },
});
