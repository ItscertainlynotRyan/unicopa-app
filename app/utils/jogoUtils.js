export function agruparPorData(jogos) {
  return jogos.reduce((acc, jogo) => {
    const data = jogo.data_brasilia;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(jogo);
    return acc;
  }, {});
}

export function formatarDataDiaMes(data) {
  return data.split("-").slice(1).reverse().join("/");
}
