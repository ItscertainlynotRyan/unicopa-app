import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import GuessCard from "../components/GuessCard";
import copaData from "../assets/data/copaData.json";
import { agruparPorData } from "../utils/jogoUtils";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function GuessScreen({ user, onGoBack }) {
  const [jogos] = useState(copaData.jogos);
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const [refreshing, setRefreshing] = useState(false);
  const [palpites, setPalpites] = useState([]);
  const [reviewVisible, setReviewVisible] = useState(false);

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

  async function fetchPalpites() {
    setRefreshing(true);
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
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    fetchPalpites();
  }

  useEffect(() => {
    if (user) {
      fetchPalpites();
    }
  }, [user]);

  async function handleConfirmReview() {
    const pending = palpites.filter((palpite) => palpite.situacao === "pendente");

    if (pending.length === 0) {
      Alert.alert("Revisão", "Não há palpites pendentes para confirmar.");
      return;
    }

    setRefreshing(true);
    try {
      const { error } = await supabase
        .from("palpite")
        .update({ situacao: "confirmado" })
        .eq("id_usuario", user.id)
        .eq("situacao", "pendente");

      if (error) {
        console.warn("Erro ao confirmar palpites:", error);
        Alert.alert("Erro", "Não foi possível confirmar seus palpites.");
        return;
      }

      Alert.alert("Sucesso", "Seus palpites foram confirmados com sucesso.");
      setReviewVisible(false);
      await fetchPalpites();
    } catch (e) {
      console.warn("Erro ao confirmar palpites:", e);
      Alert.alert("Erro", "Ocorreu um erro ao confirmar seus palpites.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PALPITES</Text>
        <Pressable style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>

      <View style={styles.reviewRow}>
        <Text style={styles.subtitle}>Filtrar por grupo</Text>
        <Pressable
          style={styles.reviewButton}
          onPress={() => setReviewVisible(true)}
        >
          <Text style={styles.reviewButtonText}>Revisar palpites</Text>
        </Pressable>
      </View>

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
      >
        {refreshing && (
          <View style={styles.refreshWrapper}>
            <ActivityIndicator color="#f2cc2f" size="large" />
          </View>
        )}

        {jogosTratados.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((jogo) => (
              <GuessCard
                key={jogo.id}
                jogo={jogo}
                userId={user.id}
                existingGuess={palpites.find((palpite) => palpite.id_jogo === jogo.id)}
                onUpdate={handleRefresh}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={reviewVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Revisão de palpites</Text>
            <ScrollView style={styles.modalList}>
              {palpites.length === 0 ? (
                <Text style={styles.modalEmpty}>
                  Você ainda não tem palpites salvos.
                </Text>
              ) : (
                palpites.map((palpite) => {
                  const jogo = jogos.find((jogo) => jogo.id === palpite.id_jogo);
                  if (!jogo) return null;
                  return (
                    <View key={palpite.id} style={styles.modalItem}>
                      <Text style={styles.modalItemTitle}>{jogo.confronto}</Text>
                      <Text style={styles.modalItemText}>
                        {palpite.placar_time_casa} x {palpite.placar_time_fora}
                      </Text>
                      <Text style={styles.modalItemStatus}>
                        {palpite.situacao === "confirmado"
                          ? "Confirmado"
                          : "Pendente"}
                      </Text>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButtonCancel}
                onPress={() => setReviewVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.modalButtonConfirm}
                onPress={handleConfirmReview}
              >
                <Text style={styles.modalButtonConfirmText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },

  reviewButton: {
    backgroundColor: "#f2cc2f",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  reviewButtonText: {
    color: "#041a2a",
    fontWeight: "700",
  },

  refreshWrapper: {
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#041a2a",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },

  modalTitle: {
    color: "#f2cc2f",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  modalList: {
    marginBottom: 16,
  },

  modalEmpty: {
    color: "#fff",
    textAlign: "center",
    paddingVertical: 24,
  },

  modalItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#1e2d3d",
    paddingVertical: 12,
  },

  modalItemTitle: {
    color: "#f2cc2f",
    fontWeight: "700",
    marginBottom: 4,
  },

  modalItemText: {
    color: "#fff",
    marginBottom: 4,
  },

  modalItemStatus: {
    color: "#8fa3b8",
    fontSize: 12,
    fontWeight: "700",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  modalButtonCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#f2cc2f",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  modalButtonCancelText: {
    color: "#f2cc2f",
    fontWeight: "700",
  },

  modalButtonConfirm: {
    flex: 1,
    backgroundColor: "#f2cc2f",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  modalButtonConfirmText: {
    color: "#041a2a",
    fontWeight: "700",
  },
});
