import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabaseClient';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function validarEmail(value) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(value).toLowerCase());
  }

  async function handleSignIn() {
    if (!email.trim() || !password) {
      Alert.alert('Erro', 'E-mail e senha são obrigatórios.');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Erro', 'Formato de e-mail inválido.');
      return;
    }

    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) {
        Alert.alert('Falha ao entrar', res.error.message || 'Verifique suas credenciais.');
      } else if (res.data?.user) {
        onLogin && onLogin(res.data.user);
      } else if (res.data?.session) {
        // Em alguns fluxos o objeto user pode vir dentro da session
        onLogin && onLogin(res.data.session.user || res.data.user);
      } else {
        Alert.alert('Falha', 'Resposta inesperada do servidor.');
      }
    } catch (err) {
      Alert.alert('Erro', err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="seu@exemplo.com"
        placeholderTextColor="#6b7b8a"
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        placeholderTextColor="#6b7b8a"
      />

      <Pressable style={styles.button} onPress={handleSignIn} disabled={loading}>
        {loading ? <ActivityIndicator color="#041a2a" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#040b13',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f2cc2f',
    marginBottom: 24,
    alignSelf: 'center',
  },
  label: {
    color: '#8fa3b8',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0c1b2a',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#f2cc2f',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#041a2a',
    fontWeight: '700',
  },
});
