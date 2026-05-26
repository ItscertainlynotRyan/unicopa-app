import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import GuessCard from "../components/GuessCard";
import copaData from "../assets/data/copaData.json";
import { agruparPorData } from "../utils/jogoUtils";
import { useState, useEffect } from "react";

export default function GuessScreen({ user, onGoBack }) {
  const [jogos] = useState(copaData.jogos);
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const [refreshing, setRefreshing] = useState(false);

  // Lista de grupos únicos
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

  function handleRefresh() {
    setRefreshing(true);
    // Simula refresh; em produção, você poderia recarregar palpites do Supabase
    setTimeout(() => setRefreshing(false), 500);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PALPITES</Text>
        <Pressable style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
        refreshControl={
          refreshing && <ActivityIndicator color="#f2cc2f" size="large" />
        }
      >
        {jogosTratados.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((jogo) => (
              <GuessCard
                key={jogo.id}
                jogo={jogo}
                userId={user.id}
                onUpdate={handleRefresh}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#040b13",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },

  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f2cc2f",
    borderRadius: 6,
  },

  backButtonText: {
    color: "#041a2a",
    fontWeight: "700",
    fontSize: 14,
  },

  subtitle: {
    marginLeft: 20,
    marginTop: 16,
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

  lista: {
    width: "100%",
    flex: 1,
  },

  listaContent: {
    paddingTop: 16,
    paddingBottom: 30,
  },

  sectionTitle: {
    color: "#f2cc2f",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 12,
  },
});
