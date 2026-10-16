import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { requisicao } from '../api';

function FilmeCard({ filme, abrirDetalhes, alternarFavorito }) {
  return (
    <View style={styles.filme}>
      <Pressable style={styles.abrirFilme} onPress={() => abrirDetalhes(filme.id)}>
        <View style={styles.iconeFilme}><Text style={styles.iconeTexto}>▶</Text></View>
        <View style={styles.informacoes}>
          <Text style={styles.titulo} numberOfLines={1}>{filme.titulo}</Text>
          <Text style={styles.genero}>{filme.genero}</Text>
          <Text style={styles.dados}>{filme.ano}  ·  ★ {Number(filme.avaliacao).toFixed(1)}</Text>
        </View>
        <Text style={styles.seta}>›</Text>
      </Pressable>
      <Pressable
        style={styles.botaoFavorito}
        onPress={() => alternarFavorito(filme)}
        accessibilityLabel={filme.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Text style={[styles.estrela, filme.favorito && styles.estrelaSelecionada]}>
          {filme.favorito ? '★' : '☆'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function Catalogo() {
  const router = useRouter();
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function alternarFavorito(filme) {
    const novoValor = !Boolean(filme.favorito);
    try {
      await requisicao(`/filmes/${filme.id}/favorito`, {
        method: 'PUT',
        body: JSON.stringify({ favorito: novoValor }),
      });
      setFilmes((lista) => lista.map((item) => (
        item.id === filme.id ? { ...item, favorito: novoValor } : item
      )));
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert('Favoritos', error.message);
      }
    }
  }

  const carregarFilmes = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');
      const lista = await requisicao('/filmes');
      setFilmes(lista);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  // A lista é consultada novamente sempre que voltamos ao catálogo.
  useFocusEffect(useCallback(() => {
    carregarFilmes();
  }, [carregarFilmes]));

  if (carregando) {
    return <View style={styles.centralizado}>
      <ActivityIndicator size="large" color="#ef4444" />
      <Text style={styles.textoSecundario}>Carregando filmes...</Text>
    </View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.etiqueta}>SUA COLEÇÃO</Text>
          <Text style={styles.tituloPagina}>Filmes</Text>
        </View>
        <View style={styles.contador}>
          <Text style={styles.numeroContador}>{filmes.length}</Text>
          <Text style={styles.textoSecundario}>filmes</Text>
        </View>
      </View>

      <Pressable style={styles.botaoAdicionar} onPress={() => router.push('/cadastrar')}>
        <Text style={styles.textoBotaoAdicionar}>＋  Adicionar filme</Text>
      </Pressable>

      {erro ? (
        <View style={styles.centralizado}>
          <Text style={styles.erro}>{erro}</Text>
          <Pressable onPress={carregarFilmes}><Text style={styles.tentar}>TENTAR NOVAMENTE</Text></Pressable>
        </View>
      ) : (
        <FlatList
          data={filmes}
          keyExtractor={(filme) => String(filme.id)}
          renderItem={({ item }) => (
            <FilmeCard
              filme={item}
              alternarFavorito={alternarFavorito}
              abrirDetalhes={(id) => router.push({ pathname: '/detalhes', params: { id } })}
            />
          )}
          ListEmptyComponent={<Text style={styles.vazio}>Sua coleção está vazia. Cadastre o primeiro filme.</Text>}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0c12', paddingHorizontal: 20 },
  cabecalho: { paddingTop: 20, paddingBottom: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  etiqueta: { color: '#ef4444', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  tituloPagina: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 3 },
  contador: { backgroundColor: '#171922', paddingHorizontal: 15, paddingVertical: 9, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#292c37' },
  numeroContador: { color: '#fff', fontSize: 18, fontWeight: '800' },
  textoSecundario: { color: '#828592', fontSize: 12, marginTop: 5 },
  botaoAdicionar: { backgroundColor: '#301a20', borderColor: '#633039', borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 15 },
  textoBotaoAdicionar: { color: '#ff9ba1', fontSize: 14, fontWeight: '800' },
  lista: { paddingBottom: 24 },
  filme: { backgroundColor: '#171922', minHeight: 96, borderRadius: 18, marginBottom: 11, padding: 13, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#252832' },
  abrirFilme: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconeFilme: { width: 58, height: 66, borderRadius: 11, backgroundColor: '#302127', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconeTexto: { fontSize: 20, color: '#f87171' },
  informacoes: { flex: 1 },
  titulo: { color: '#fff', fontSize: 17, fontWeight: '800' },
  genero: { color: '#ff858b', fontSize: 13, marginTop: 4 },
  dados: { color: '#9295a0', fontSize: 12, marginTop: 6 },
  seta: { color: '#707481', fontSize: 28, marginLeft: 8 },
  botaoFavorito: { padding: 8, marginLeft: 6 },
  estrela: { color: '#757987', fontSize: 25 },
  estrelaSelecionada: { color: '#ffd166' },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 26 },
  erro: { color: '#ff9a9a', textAlign: 'center', marginBottom: 12 },
  tentar: { color: '#ff858b', fontWeight: '800' },
  vazio: { color: '#9295a0', textAlign: 'center', marginTop: 40, lineHeight: 22 },
});
