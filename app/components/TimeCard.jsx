import { StyleSheet, Text, View, Image } from "react-native";
import { FLAGS } from "../assets/data/ImagemPaises";

export default function TimeCard({ siglaTime }) {
  const sigla = String(siglaTime || "").trim().toUpperCase();
  const source = FLAGS[sigla];

  return (
    <View style={styles.time}>
      <Text style={styles.sigla}>{sigla}</Text>
      {source ? (
        <Image style={styles.bandeira} source={source} />
      ) : (
        <View style={styles.bandeiraPlaceholder}>
          <Text style={styles.bandeiraPlaceholderText}>?</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  time: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bandeira: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bandeiraPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1a2a3a",
    justifyContent: "center",
    alignItems: "center",
  },
  bandeiraPlaceholderText: {
    color: "#f2cc2f",
    fontSize: 12,
    fontWeight: "700",
  },
  sigla: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
