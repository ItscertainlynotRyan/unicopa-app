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
import DiaCard from "./app/components/DiaCard";
import copaData from "./app/assets/data/copaData.json";
import { agruparPorData } from "./app/utils/jogoUtils";
import { useState } from "react";

export default function App() {
  const [jogos] = useState(copaData.jogos);
  const [favoritos, setFavoritos] = useState([]);
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");

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

  function handleToggleFavorito(jogoId) {
    setFavoritos((prev) =>
      prev.includes(jogoId)
        ? prev.filter((id) => id !== jogoId)
        : [...prev, jogoId]
    );
  }


async function inserirUsuario() {
  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      {
        nome: "Taffe",
        ra: "12345678",
        email: "teste@teste.com",
        senha: "123456",
        telefone: "11999999999",
        data_nascimento: "1990-01-01",
      },
    ]);

  if (error) {
    console.log("Erro ao inserir usuário:", error);
  } else {
    console.log("Usuário inserido com sucesso:", data);
  }
}

inserirUsuario();

  return (
    <ImageBackground
      style={styles.container}
      source={require("./app/assets/bg-overlay.png")}
    >
      <Image
        style={styles.logo}
        source={require("./app/assets/unicopa.png")}
      />

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
        <SectionList
          sections={jogosTratados}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          renderItem={() => null}
          renderSectionHeader={({ section }) => {
            const ehHoje = section.title === hoje;

            return (
              <DiaCard
                data={section.title}
                jogos={section.data}
                favoritos={favoritos}
                onToggleFavorito={handleToggleFavorito}
                isHoje={ehHoje}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          style={styles.lista}
          contentContainerStyle={styles.listaContent}
        />
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