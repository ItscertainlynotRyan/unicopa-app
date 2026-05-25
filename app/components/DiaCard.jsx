import { StyleSheet, Text, View } from "react-native";
import GameCard from "./GameCard";
import { formatarDataDiaMes } from "../utils/jogoUtils";

export default function DiaCard({
  data,
  jogos,
  favoritos,
  onToggleFavorito,
  isHoje,
}) {
  const dataFormatada = formatarDataDiaMes(data);

  return (
    <View style={[styles.card, isHoje && styles.cardHoje]}>
      <Text style={[styles.data, isHoje && styles.textHoje]}>
        {dataFormatada} {isHoje && "(HOJE)"}
      </Text>

      {jogos.map((jogo) => (
        <GameCard
          key={jogo.id}
          game={jogo}
          isFavorito={favoritos.includes(jogo.id)}
          onToggleFavorito={() => onToggleFavorito(jogo.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: "#0c1b2a",
    width: 320,
    borderRadius: 12,
    padding: 15,
  },

  cardHoje: {
    borderColor: "#f2cc2f",
    borderWidth: 2,
  },

  data: {
    color: "#f2cc2f",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  textHoje: {
    color: "#00ff7f",
  },
});