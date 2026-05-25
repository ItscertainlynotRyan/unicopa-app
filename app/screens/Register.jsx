import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabaseClient';

export default function Register({ onRegistered, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  function validarEmail(value) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(value).toLowerCase());
  }

  async function handleSignUp() {
    if (!email.trim() || !password) {
      Alert.alert('Erro', 'E-mail e senha são obrigatórios.');
      return;
    }
    if (!validarEmail(email)) {
      Alert.alert('Erro', 'Formato de e-mail inválido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'Senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Erro', 'Senha e confirmação não conferem.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password }, { data: { name } });
      if (error) {
        Alert.alert('Falha no cadastro', error.message || 'Tente novamente.');
      } else {
        Alert.alert(
          'Cadastro realizado',
          'Registro efetuado com sucesso. Confira seu e-mail para confirmar a conta, se aplicável.'
        );
        onRegistered && onRegistered();
      }
    } catch (err) {
      Alert.alert('Erro', err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar-se</Text>

      <Text style={styles.label}>Nome (opcional)</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#6b7b8a" />

      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@exemplo.com" placeholderTextColor="#6b7b8a" />

      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••" placeholderTextColor="#6b7b8a" />

      <Text style={styles.label}>Confirmar senha</Text>
      <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="••••••" placeholderTextColor="#6b7b8a" />

      <Pressable style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#041a2a" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
      </Pressable>

      <Pressable style={styles.cancel} onPress={onCancel}>
        <Text style={styles.cancelText}>Voltar ao login</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#f2cc2f',
    marginBottom: 18,
    alignSelf: 'center',
  },
  label: {
    color: '#8fa3b8',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0c1b2a',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#f2cc2f',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#041a2a',
    fontWeight: '700',
  },
  cancel: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#8fa3b8',
    textDecorationLine: 'underline',
  },
});
