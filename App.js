import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  SectionList,
  ScrollView,
  Pressable,
} from "react-native";
import GameCard from "./app/components/GameCard";
import DiaCard from "./app/components/DiaCard";
import copaData from "./app/assets/data/copaData.json";
import { agruparPorData } from "./app/utils/jogoUtils";
import { useState } from "react";

export default function App() {
  const [jogos, setJogos] = useState(copaData.jogos);
  const [dadosCopa, setDadosCopa] = useState(copaData);
  const [favoritos, setFavoritos] = useState([]);
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");

  const grupos = Array.from(new Set(copaData.jogos.map((jogo) => jogo.grupo))).sort();
  const jogosFiltrados =
    filtroGrupo === "Todos"
      ? jogos
      : jogos.filter((jogo) => jogo.grupo === filtroGrupo);

  const jogosAgrupados = agruparPorData(jogosFiltrados);
  const jogosTratados = Object.keys(jogosAgrupados).map((data) => {
    return {
      title: data,
      data: jogosAgrupados[data],
    };
  });

  function handleToggleFavorito(jogoId) {
    setFavoritos((prev) =>
      prev.includes(jogoId)
        ? prev.filter((id) => id !== jogoId)
        : [...prev, jogoId]
    );
  }

  return (
    <ImageBackground
      style={styles.container}
      source={require("./app/assets/bg-overlay.png")}
    >
      <Image style={styles.logo} source={require("./app/assets/unicopa.png")} />

      <Text style={styles.title}>CALENDÁRIO</Text>

      <Text style={styles.subtitle}>Filtrar por grupo</Text>
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

      {jogosTratados.length === 0 ? (
        <Text style={styles.emptyText}>
          Nenhum jogo encontrado para o grupo {filtroGrupo}.
        </Text>
      ) : (
        <SectionList
          sections={jogosTratados}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={() => null}
          renderSectionHeader={({ section }) => (
            <DiaCard
              data={section.title}
              jogos={section.data}
              favoritos={favoritos}
              onToggleFavorito={handleToggleFavorito}
            />
          )}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
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
  gruposContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
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

  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2d3d",
    paddingBottom: 15,
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
  sigla: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
  emptyText: {
    marginTop: 40,
    color: "#8fa3b8",
    fontSize: 16,
    textAlign: "center",
  },
});
