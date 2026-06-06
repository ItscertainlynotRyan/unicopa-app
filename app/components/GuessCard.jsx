import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
} from "react-native";
import TimeCard from "./TimeCard";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function GuessCard({ jogo, userId, existingGuess, onUpdate }) {
  const [golsCasa, setGolsCasa] = useState("");
  const [golsFora, setGolsFora] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [situacao, setSituacao] = useState(existingGuess?.situacao || "pendente");

  // Carrega palpite existente ao montar ou quando jogo muda
  useEffect(() => {
    if (existingGuess) {
      setGolsCasa(String(existingGuess.placar_time_casa ?? ""));
      setGolsFora(String(existingGuess.placar_time_fora ?? ""));
      setSituacao(existingGuess.situacao ?? "pendente");
    } else {
      loadGuess();
    }
    checkIfLocked();
  }, [jogo.id, existingGuess]);

  // Verifica se o jogo já começou
  function checkIfLocked() {
    const now = new Date();
    const gameDateTime = new Date(`${jogo.data_brasilia}T${jogo.hora_brasilia}`);
    setIsLocked(now > gameDateTime);
  }

  // Carrega palpite existente do Supabase
  async function loadGuess() {
    try {
      const { data, error } = await supabase
        .from("palpite")
        .select("placar_time_casa, placar_time_fora, situacao")
        .eq("id_usuario", userId)
        .eq("id_jogo", jogo.id)
        .single();

      if (!error && data) {
        setGolsCasa(String(data.placar_time_casa));
        setGolsFora(String(data.placar_time_fora));
        setSituacao(data.situacao || "pendente");
      }
    } catch (e) {
      console.log("Sem palpite anterior para este jogo");
    }
  }

  // Salva/atualiza palpite
  async function handleSaveGuess() {
    if (situacao === "confirmado") {
      alert("Este palpite já foi confirmado e não pode ser alterado.");
      return;
    }

    if (golsCasa === "" || golsFora === "") {
      alert("Preencha ambos os placares antes de salvar.");
      return;
    }

    const gols_casa = parseInt(golsCasa, 10);
    const gols_fora = parseInt(golsFora, 10);

    if (isNaN(gols_casa) || isNaN(gols_fora)) {
      alert("Os placares devem ser números válidos.");
      return;
    }

    setLoading(true);

    try {
      // 1. Remove qualquer palpite anterior duplicado deste usuário para este jogo específico
      await supabase
        .from("palpite")
        .delete()
        .eq("id_usuario", userId)
        .eq("id_jogo", jogo.id);

      // 2. Insere o novo palpite correspondendo exatamente às colunas do banco de dados
      const { error } = await supabase.from("palpite").insert([
        {
          id_usuario: userId,
          id_jogo: jogo.id,
          placar_time_casa: gols_casa,
          placar_time_fora: gols_fora,
          situacao: "pendente",
        },
      ]);

      if (error) {
        console.warn("Erro ao salvar palpite:", error);
        alert("Não foi possível salvar o palpite: " + error.message);
        return;
      }

      setSituacao("pendente");
      alert("Palpite salvo com sucesso! 🚀");
      onUpdate?.();
    } catch (e) {
      console.warn("Erro ao salvar palpite:", e);
      alert("Ocorreu um erro ao salvar o palpite.");
    } finally {
      setLoading(false);
    }
  }

  const isBrasil = jogo.sigla_casa === "BRA" || jogo.sigla_fora === "BRA";

  return (
    <View style={[styles.jogo, isBrasil && styles.jogoBrasil, isLocked && styles.jogoLocked]}>
      <View style={styles.headerRow}>
        <Text style={styles.grupo}>
          GRUPO {jogo.grupo} • {jogo.confronto}
        </Text>
        {situacao === "confirmado" ? (
          <Text style={styles.confirmedBadge}>Confirmado</Text>
        ) : isLocked ? (
          <Text style={styles.lockedBadge}>Encerrado</Text>
        ) : null}
      </View>

      <View style={styles.linhaPrincipal}>
        <TimeCard siglaTime={jogo.sigla_casa} />

        <View style={styles.scoreContainer}>
          <TextInput
            style={[styles.scoreInput, (isLocked || situacao === "confirmado") && styles.scoreInputLocked]}
            placeholder="0"
            keyboardType="number-pad"
            maxLength={2}
            value={golsCasa}
            onChangeText={setGolsCasa}
            editable={!isLocked && situacao !== "confirmado"}
          />
          <Text style={styles.hora}>{jogo.hora_brasilia}</Text>
          <TextInput
            style={[styles.scoreInput, (isLocked || situacao === "confirmado") && styles.scoreInputLocked]}
            placeholder="0"
            keyboardType="number-pad"
            maxLength={2}
            value={golsFora}
            onChangeText={setGolsFora}
            editable={!isLocked && situacao !== "confirmado"}
          />
        </View>

        <TimeCard siglaTime={jogo.sigla_fora} />
      </View>

      <View style={styles.local}>
        <Text style={styles.subTitulo}>{jogo.estadio}</Text>
        <Text style={styles.subTitulo}>
          {jogo.cidade} • {jogo.pais}
        </Text>
      </View>

      {!isLocked && situacao !== "confirmado" && (
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            loading && styles.saveButtonLoading,
          ]}
          onPress={handleSaveGuess}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Salvando..." : "Salvar Palpite"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  jogo: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e2d3d",
    borderRadius: 12,
    padding: 15,
  },
  jogoBrasil: {
    borderColor: "#ffd700",
    borderWidth: 2,
  },
  jogoLocked: {
    opacity: 0.6,
    borderColor: "#8b3a3a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  grupo: {
    color: "#8fa3b8",
    fontSize: 12,
    fontWeight: "bold",
    flex: 1,
  },
  lockedBadge: {
    backgroundColor: "#8b3a3a",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  confirmedBadge: {
    backgroundColor: "#26a69a",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  linhaPrincipal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  scoreInput: {
    width: 45,
    height: 45,
    backgroundColor: "#1a2a3a",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#f2cc2f",
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  scoreInputLocked: {
    borderColor: "#8b3a3a",
    backgroundColor: "#0a1520",
  },
  hora: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  local: {
    marginTop: 8,
    marginBottom: 12,
  },
  subTitulo: {
    color: "#8fa3b8",
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: "#f2cc2f",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonLoading: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#041a2a",
    fontWeight: "700",
    fontSize: 14,
  },
});