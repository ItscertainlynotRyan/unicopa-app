import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '../supabaseClient';

export default function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function validarEmail(value) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(value).toLowerCase());
  }

  async function handleSignIn() {
    if (!email.trim() || !password) {
      alert('E-mail e senha são obrigatórios.');
      return;
    }

    if (!validarEmail(email)) {
      alert('Formato de e-mail inválido.');
      return;
    }

    setLoading(true);
    
    // Mostra no console exatamente os dados enviados antes de chamar o servidor
    console.log("Tentando logar com o e-mail:", email.trim());

    try {
      const res = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      });

      // Exibe a resposta completa do servidor no console (inspecione para ver os detalhes)
      console.log("Resposta bruta do Supabase:", res);

      if (res.error) {
        console.log("Erro identificado:", res.error.message);
        alert('Falha ao entrar: ' + res.error.message);
      } else if (res.data?.user) {
        console.log("Usuário logado com sucesso!");
        onLogin && onLogin(res.data.user);
      } else if (res.data?.session) {
        console.log("Sessão iniciada com sucesso!");
        onLogin && onLogin(res.data.session.user || res.data.user);
      } else {
        alert('Falha: Resposta inesperada do servidor.');
      }
    } catch (err) {
      console.error('Erro pego no Bloco Catch:', err);
      alert('Erro inesperado: ' + (err.message || String(err)));
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

      <Pressable style={styles.link} onPress={() => onShowRegister && onShowRegister()}>
        <Text style={styles.linkText}>Registrar-se</Text>
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
  link: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#8fa3b8',
    textDecorationLine: 'underline',
  },
});