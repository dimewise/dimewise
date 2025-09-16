import { useSignUp } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as z from 'zod';

// Zod schema for sign-up validation
const signUpSchema = z.object({
  emailAddress: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/\d/, 'Password must include a number'),
});

const verificationSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Form for email and password
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  // Form for verification code
  const {
    control: codeControl,
    handleSubmit: handleVerifySubmit,
    formState: { errors: codeErrors },
  } = useForm({
    resolver: zodResolver(verificationSchema),
  });

  // Sign-up submission handler
  const onSignUpPress = useCallback(
    async (data) => {
      setApiError('');
      if (!isLoaded || loading) return;

      setLoading(true);
      try {
        await signUp.create({
          emailAddress: data.emailAddress,
          password: data.password,
        });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } catch (err) {
        setApiError('Failed to create account or send verification email');
        console.error(JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, loading, signUp],
  );

  // Verification code submission handler
  const onVerifyPress = useCallback(
    async (data) => {
      setApiError('');
      if (!isLoaded || loading) return;

      setLoading(true);
      try {
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code: data.code,
        });
        if (signUpAttempt.status === 'complete') {
          await setActive({ session: signUpAttempt.createdSessionId });
          router.replace('/');
        } else {
          setApiError('Additional verification steps required');
          console.error(JSON.stringify(signUpAttempt, null, 2));
        }
      } catch (err) {
        setApiError('Verification failed: Invalid code or network error');
        console.error(JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, loading, signUp, setActive, router],
  );

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>

        <Controller
          control={codeControl}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, codeErrors.code && styles.inputError]}
              placeholder="Enter your verification code"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              editable={!loading}
            />
          )}
        />
        {codeErrors.code && <Text style={styles.errorText}>{codeErrors.code.message}</Text>}

        {!!apiError && <Text style={styles.errorText}>{apiError}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifySubmit(onVerifyPress)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <Controller
        control={control}
        name="emailAddress"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.emailAddress && styles.inputError]}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
          />
        )}
      />
      {errors.emailAddress && <Text style={styles.errorText}>{errors.emailAddress.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Enter password"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      {!!apiError && <Text style={styles.errorText}>{apiError}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit(onSignUpPress)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text>Already have an account? </Text>
        <Link href="/sign-in">
          <Text style={styles.linkText}>Sign in</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 6,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  linkContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  linkText: {
    color: '#007AFF',
  },
});
