import { StyleSheet, Text, View } from "react-native";
import GameCard from "./GameCard";
import { formatarDataDiaMes } from "../utils/jogoUtils";

<<<<<<< HEAD
export default function DiaCard({ data, jogos, favoritos, onToggleFavorito, isHoje}) {
  const dataFormatada = formatarDataDiaMes(data);

  return (
    <View style={styles.card, isHoje && styles.cardHoje}>
      <Text style={[styles.data, isHoje && styles.textHoje]}>
        {data} {isHoje && "(HOJE)"}
      </Text>
=======
export default function DiaCard({ data, jogos, favoritos, onToggleFavorito }) {
  const dataFormatada = formatarDataDiaMes(data);

  return (
    <View style={styles.card}>
>>>>>>> origin/main
      <Text style={styles.data}>{dataFormatada}</Text>
      {jogos.map((jogo) => (
        <GameCard
          key={jogo.id}
          game={jogo}
          isFavorito={favoritos.includes(jogo.id)}
          onToggleFavorito={onToggleFavorito}
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
  data: {
    color: "#f2cc2f",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
<<<<<<< HEAD
  cardHoje: {
    borderColor: "#f2cc2f", // Uma borda amarela/ouro para destacar
    borderWidth: 2,
  },
  textHoje: {
    color: "#00ff7f", // Deixa o texto verde brilhante ou outra cor de destaque
  }
=======
>>>>>>> origin/main
});
