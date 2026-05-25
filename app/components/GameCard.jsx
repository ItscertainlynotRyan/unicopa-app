import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import TimeCard from "./TimeCard";

export default function GameCard({ game, isFavorito, onToggleFavorito }) {
  const isBrasil = game.sigla_casa === "BRA" || game.sigla_fora === "BRA";

  return (
    <View style={[styles.jogo, isBrasil && styles.jogoBrasil]}>
      <View style={styles.headerRow}>
        <Text style={styles.grupo}>
          GRUPO {game.grupo} {game.confronto}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.favoritoBotao,
            isFavorito && styles.favoritoBotaoAtivo,
            pressed && styles.favoritoBotaoPressionado,
          ]}
          onPress={() => onToggleFavorito(game.id)}
        >
          <Text style={[styles.favoritoTexto, isFavorito && styles.favoritoTextoAtivo]}>
            {isFavorito ? "★ Favorito" : "☆ Favoritar"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.linhaPrincipal}>
        <TimeCard siglaTime={game.sigla_casa} />
        <View style={styles.horario}>
          <Text style={styles.hora}>{game.hora_brasilia}</Text>
          <Text style={styles.subTitulo}>VS</Text>
        </View>

        <TimeCard siglaTime={game.sigla_fora} />
      </View>

      <View style={styles.local}>
        <Text style={styles.subTitulo}>{game.estadio}</Text>
        <Text style={styles.subTitulo}>
          {game.cidade} • {game.pais}
        </Text>
      </View>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  favoritoBotao: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4a6078",
    backgroundColor: "#0c1b2a",
  },
  favoritoBotaoAtivo: {
    borderColor: "#f2cc2f",
    backgroundColor: "#1f2f47",
  },
  favoritoBotaoPressionado: {
    opacity: 0.75,
  },
  favoritoTexto: {
    color: "#8fa3b8",
    fontSize: 12,
    fontWeight: "bold",
  },
  favoritoTextoAtivo: {
    color: "#f2cc2f",
  },
  grupo: {
    color: "#8fa3b8",
    fontSize: 12,
    marginBottom: 10,
  },
  linhaPrincipal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  horario: {
    alignItems: "center",
  },
  hora: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  local: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subTitulo: {
    color: "#8fa3b8",
    fontSize: 12,
  },
});
