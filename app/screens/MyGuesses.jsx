import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import TimeCard from "../components/TimeCard";
import { supabase } from "../supabaseClient";
import copaData from "../assets/data/copaData.json";

const STATUS_OPTS = ["Todos", "Pendentes", "Confirmados"];

export default function MyGuesses({ user, onGoBack }) {
  const [palpites, setPalpites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Todos");

  async function fetchPalpites() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("palpite")
        .select("id, id_jogo, placar_time_casa, placar_time_fora, situacao")
        .eq("id_usuario", user.id);

      if (error) {
        console.warn("Erro ao carregar palpites:", error);
        Alert.alert("Erro", "Não foi possível carregar seus palpites.");
        return;
      }

      setPalpites(data || []);
    } catch (e) {
      console.warn("Erro ao carregar palpites:", e);
      Alert.alert("Erro", "Não foi possível carregar seus palpites.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchPalpites();
    }
  }, [user]);

  function getJogoForPalpite(palpite) {
    return copaData.jogos.find((jogo) => jogo.id === palpite.id_jogo);
  }

  function getStatusLabel(palpite, jogo) {
    if (palpite.situacao === "confirmado") {
      return "Confirmado";
    }

    if (!jogo) {
      return "Sem jogo";
    }

    const dateTime = new Date(`${jogo.data_brasilia}T${jogo.hora_brasilia}:00`);
    const iniciado = dateTime <= new Date();

    if (iniciado) {
      return "Jogo iniciado";
    }

    return "Pendente";
  }

  function filterPalpites() {
    return palpites
      .map((palpite) => ({
        ...palpite,
        jogo: getJogoForPalpite(palpite),
      }))
      .filter((item) => {
        if (statusFilter === "Todos") return true;
        if (statusFilter === "Pendentes") return item.situacao !== "confirmado";
        if (statusFilter === "Confirmados") return item.situacao === "confirmado";
        return true;
      });
  }

  const palpiteList = filterPalpites();

  const groupedPalpites = palpiteList.reduce((acc, palpite) => {
    const dateKey = palpite.jogo?.data_brasilia || "Sem data";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(palpite);
    return acc;
  }, {});

  const sections = Object.keys(groupedPalpites)
    .sort()
    .map((dateKey) => ({
      title: dateKey,
      data: groupedPalpites[dateKey].sort((a, b) => {
        const horaA = a.jogo?.hora_brasilia || "00:00";
        const horaB = b.jogo?.hora_brasilia || "00:00";
        return horaA.localeCompare(horaB);
      }),
    }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MEUS PALPITES</Text>
        <Pressable style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {STATUS_OPTS.map((status) => (
          <Pressable
            key={status}
            style={({ pressed }) => [
              styles.filterButton,
              statusFilter === status && styles.filterButtonActive,
              pressed && styles.filterButtonPressed,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === status && styles.filterTextActive,
              ]}
            >
              {status}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#f2cc2f" size="large" />
        </View>
      ) : palpiteList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você ainda não cadastrou palpites.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.gameHeader}>
                    <Text style={styles.gameTime}>{item.jogo?.hora_brasilia || "--:--"}</Text>
                    <Text style={styles.statusLabel}>{getStatusLabel(item, item.jogo)}</Text>
                  </View>
                  <View style={styles.teamsRow}>
                    <View style={styles.teamWrapper}>
                      <TimeCard siglaTime={item.jogo?.sigla_casa} />
                      <Text style={styles.teamName}>{item.jogo?.time_casa || "Casa"}</Text>
                    </View>
                    <Text style={styles.scoreText}>
                      {item.placar_time_casa} x {item.placar_time_fora}
                    </Text>
                    <View style={styles.teamWrapper}>
                      <Text style={styles.teamName}>{item.jogo?.time_fora || "Fora"}</Text>
                      <TimeCard siglaTime={item.jogo?.sigla_fora} />
                    </View>
                  </View>
                  <Text style={styles.confrontoText}>{item.jogo?.confronto || "Jogo não encontrado"}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#f2cc2f",
    fontSize: 22,
    fontWeight: "700",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f2cc2f",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#041a2a",
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4a6078",
    backgroundColor: "#0c1b2a",
  },
  filterButtonActive: {
    backgroundColor: "#f2cc2f",
    borderColor: "#f2cc2f",
  },
  filterButtonPressed: {
    opacity: 0.8,
  },
  filterText: {
    color: "#8fa3b8",
    fontWeight: "700",
    fontSize: 12,
  },
  filterTextActive: {
    color: "#041a2a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: "#8fa3b8",
    fontSize: 16,
    textAlign: "center",
  },
  list: {
    width: "100%",
  },
  listContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#f2cc2f",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#0b1b2b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  gameTime: {
    color: "#8fa3b8",
    fontSize: 14,
  },
  statusLabel: {
    color: "#f2cc2f",
    fontSize: 13,
    fontWeight: "700",
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  teamWrapper: {
    flex: 1,
    alignItems: "center",
  },
  teamName: {
    color: "white",
    marginTop: 6,
    fontWeight: "700",
  },
  scoreText: {
    color: "#f2cc2f",
    fontSize: 18,
    fontWeight: "700",
  },
  confrontoText: {
    color: "#8fa3b8",
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
  },
});
