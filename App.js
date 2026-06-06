import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import DiaCard from "./app/components/DiaCard";
import copaData from "./app/assets/data/copaData.json";
import { agruparPorData } from "./app/utils/jogoUtils";
import { useState, useEffect } from "react";
import Login from "./app/screens/Login";
import Register from "./app/screens/Register";
import GuessScreen from "./app/screens/GuessScreen";
import { supabase } from "./app/supabaseClient";

export default function App() {
  const [jogos] = useState(copaData.jogos);
  const [favoritos, setFavoritos] = useState([]);
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showGuesses, setShowGuesses] = useState(false);

  const hoje = new Date().toISOString().split("T")[0];

  // Lista de grupos únicos (remove valores vazios)
  const grupos = Array.from(
    new Set(
      copaData.jogos
        .map((jogo) => jogo.grupo)
        .filter((grupo) => grupo && grupo.trim() !== "")
    )
  ).sort();

  // Filtra os jogos conforme o grupo selecionado
  const jogosFiltrados =
    filtroGrupo === "Todos"
      ? jogos
      : jogos.filter((jogo) => jogo.grupo === filtroGrupo);

  // Agrupa por data
  const jogosAgrupados = agruparPorData(jogosFiltrados);

  // Ordena as datas
  const jogosTratados = Object.keys(jogosAgrupados)
    .sort()
    .map((data) => {
      const jogosOrdenados = jogosAgrupados[data].sort((a, b) =>
        a.hora_brasilia.localeCompare(b.hora_brasilia)
      );

      return {
        title: data,
        data: jogosOrdenados,
      };
    });

  async function handleToggleFavorito(jogoId) {
    if (!user) {
      Alert.alert('Atenção', 'Faça login para favoritar jogos.');
      return;
    }

    const jogoIdStr = String(jogoId);
    const already = favoritos.includes(jogoIdStr);

    if (already) {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('jogo_id', jogoId);
      if (error) {
        console.warn('Erro ao remover favorito:', error);
        Alert.alert('Erro', 'Não foi possível remover dos favoritos.');
        return;
      }
      setFavoritos((prev) => prev.filter((id) => id !== jogoIdStr));
    } else {
      const { error } = await supabase.from('favoritos').insert([
        { user_id: user.id, jogo_id: jogoId },
      ]);
      if (error) {
        console.warn('Erro ao adicionar favorito:', error);
        Alert.alert('Erro', 'Não foi possível adicionar aos favoritos.');
        return;
      }
      setFavoritos((prev) => [...prev, jogoIdStr]);
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Erro', 'Não foi possível sair da conta.');
        console.warn('Erro ao deslogar:', error);
        return;
      }
      setUser(null);
      setFavoritos([]);
    } catch (e) {
      console.warn('Erro ao deslogar:', e);
      Alert.alert('Erro', 'Ocorreu um erro ao sair.');
    }
  }

  async function fetchFavoritos(userId) {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('jogo_id')
        .eq('user_id', userId);
      if (!error && data) {
        setFavoritos(data.map((r) => String(r.jogo_id)));
      }
    } catch (e) {
      console.warn('Erro ao buscar favoritos:', e);
    }
  }
  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && mounted) {
          const u = data.user || null;
          setUser(u);
          if (u) await fetchFavoritos(u.id);
        }
      } catch (e) {
        // ignore
      }
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchFavoritos(u.id);
      } else {
        setFavoritos([]);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const mainContent = user ? (
    showGuesses ? (
      <GuessScreen user={user} onGoBack={() => setShowGuesses(false)} />
    ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
      >
        {jogosTratados.map((section) => {
          const ehHoje = section.title === hoje;
          return (
            <DiaCard
              key={section.title}
              data={section.title}
              jogos={section.data}
              favoritos={favoritos}
              onToggleFavorito={handleToggleFavorito}
              isHoje={ehHoje}
            />
          );
        })}
      </ScrollView>
    )
  ) : showRegister ? (
    <Register onRegistered={() => setShowRegister(false)} onCancel={() => setShowRegister(false)} />
  ) : (
    <Login onLogin={(u) => setUser(u)} onShowRegister={() => setShowRegister(true)} />
  );

  return (
    <ImageBackground
      style={styles.container}
      source={require("./app/assets/bg-overlay.png")}
    >
      {!showGuesses && (
        <>
          <Image
            style={styles.logo}
            source={require("./app/assets/unicopa.png")}
          />

          {user && (
            <View style={styles.topButtonsContainer}>
              <Pressable style={styles.guessButton} onPress={() => setShowGuesses(true)}>
                <Text style={styles.guessButtonText}>Palpites</Text>
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={handleSignOut}>
                <Text style={styles.logoutText}>Sair</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      <Text style={styles.title}>CALENDÁRIO</Text>

      <Text style={styles.subtitle}>Filtrar por grupo</Text>

      <View style={styles.filtroWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gruposContainer}
        >
          <Pressable
            style={({ pressed }) => [
              styles.grupoBotao,
              filtroGrupo === "Todos" && styles.grupoBotaoAtivo,
              pressed && styles.grupoBotaoPressionado,
            ]}
            onPress={() => setFiltroGrupo("Todos")}
          >
            <Text
              style={[
                styles.grupoTexto,
                filtroGrupo === "Todos" && styles.grupoTextoAtivo,
              ]}
            >
              Todos
            </Text>
          </Pressable>

          {grupos.map((grupo) => (
            <Pressable
              key={grupo}
              style={({ pressed }) => [
                styles.grupoBotao,
                filtroGrupo === grupo && styles.grupoBotaoAtivo,
                pressed && styles.grupoBotaoPressionado,
              ]}
              onPress={() => setFiltroGrupo(grupo)}
            >
              <Text
                style={[
                  styles.grupoTexto,
                  filtroGrupo === grupo && styles.grupoTextoAtivo,
                ]}
              >
                {grupo}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {jogosTratados.length === 0 ? (
        <Text style={styles.emptyText}>
          Nenhum jogo encontrado para o grupo {filtroGrupo}.
        </Text>
      ) : (
        mainContent
      )}
    </ImageBackground>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#040b13",
    alignItems: "center",
  },

  logo: {
    marginTop: 20,
    width: 200,
    height: 50,
    resizeMode: "contain",
  },

  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },

  subtitle: {
    marginTop: 20,
    alignSelf: "flex-start",
    marginLeft: 20,
    color: "#f2cc2f",
    fontSize: 16,
    fontWeight: "700",
  },

  filtroWrapper: {
    width: "100%",
    maxHeight: 60,
    marginTop: 10,
  },

  gruposContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },

  grupoBotao: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4a6078",
    backgroundColor: "#0c1b2a",
  },

  grupoBotaoAtivo: {
    backgroundColor: "#f2cc2f",
    borderColor: "#f2cc2f",
  },

  grupoBotaoPressionado: {
    opacity: 0.8,
  },

  grupoTexto: {
    color: "#8fa3b8",
    fontSize: 14,
    fontWeight: "700",
  },

  grupoTextoAtivo: {
    color: "#041a2a",
  },

  topButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginRight: 16,
    justifyContent: "flex-end",
  },

  guessButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f2cc2f",
    borderRadius: 6,
  },

  guessButtonText: {
    color: "#041a2a",
    fontWeight: "700",
    fontSize: 14,
  },

  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f2cc2f",
    borderRadius: 6,
  },

  logoutText: {
    color: "#041a2a",
    fontWeight: "700",
    fontSize: 14,
  },

  lista: {
    width: "100%",
    flex: 1,
  },

  listaContent: {
    alignItems: "center",
    paddingBottom: 30,
  },

  emptyText: {
    marginTop: 40,
    color: "#8fa3b8",
    fontSize: 16,
    textAlign: "center",
  },
});