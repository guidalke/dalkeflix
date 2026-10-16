import { createElement, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { requisicao } from '../api';
import { WebView } from 'react-native-webview';

function encontrarIdDoYoutube(link) {
  if (!link) return '';
  try {
    const endereco = new URL(link);
    if (endereco.hostname === 'youtu.be') {
      return endereco.pathname.slice(1).split('/')[0];
    }
    if (endereco.pathname === '/watch') {
      return endereco.searchParams.get('v') || '';
    }
    const partes = endereco.pathname.split('/');
    if (['embed', 'shorts'].includes(partes[1])) {
      return partes[2] || '';
    }
  } catch {
    return '';
  }
  return '';
}

export default function Detalhes() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [filme, setFilme] = useState(null);
  const [erro, setErro] = useState('');
  const [erroTrailer, setErroTrailer] = useState(false);

  useEffect(() => {
    requisicao(`/filmes/${id}`)
      .then((dados) => setFilme(dados))
      .catch((error) => setErro(error.message));
  }, [id]);

  async function excluirFilme() {
    try {
      await requisicao(`/filmes/${id}`, { method: 'DELETE' });
      router.replace('/catalogo');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  function confirmarExclusao() {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja excluir este filme?')) excluirFilme();
      return;
    }

    Alert.alert('Excluir filme', 'Tem certeza que deseja excluir este filme?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: excluirFilme },
    ]);
  }

  function mostrarTrailer() {
    const idYoutube = encontrarIdDoYoutube(filme.trailer_url);
    const idValido = /^[A-Za-z0-9_-]{11}$/.test(idYoutube);

    if (!filme.trailer_url) {
      return <Text style={styles.semTrailer}>Este filme ainda não tem um trailer cadastrado.</Text>;
    }
    if (!idValido || erroTrailer) {
      return (
        <Pressable onPress={() => Linking.openURL(filme.trailer_url)}>
          <Text style={styles.semTrailer}>Não foi possível mostrar a prévia. Toque para abrir o trailer.</Text>
        </Pressable>
      );
    }

    const enderecoEmbed = `https://www.youtube-nocookie.com/embed/${idYoutube}`;
    if (Platform.OS === 'web') {
      return createElement('iframe', {
        src: enderecoEmbed,
        title: `Trailer de ${filme.titulo}`,
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowFullScreen: true,
        referrerPolicy: 'strict-origin-when-cross-origin',
        style: { width: '100%', height: '100%', border: 0 },
      });
    }

    return (
      <WebView
        source={{ uri: enderecoEmbed }}
        style={styles.webview}
        allowsInlineMediaPlayback
        onError={() => setErroTrailer(true)}
      />
    );
  }

  if (!filme) {
    return (
      <View style={styles.centralizado}>
        {erro ? <Text style={styles.texto}>{erro}</Text> : <ActivityIndicator color="#ef4444" />}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <View style={styles.playerTrailer}>{mostrarTrailer()}</View>
      {!!filme.trailer_url && (
        <Pressable style={styles.linkTrailer} onPress={() => Linking.openURL(filme.trailer_url)}>
          <Text style={styles.textoLinkTrailer}>ABRIR TRAILER NO YOUTUBE ↗</Text>
        </Pressable>
      )}
      <Text style={styles.genero}>{filme.genero}</Text>
      <Text style={styles.titulo}>{filme.titulo}</Text>
      <View style={styles.dados}>
        <Text style={styles.ano}>{filme.ano}</Text>
        <Text style={styles.ponto}>•</Text>
        <Text style={styles.avaliacao}>★ {Number(filme.avaliacao).toFixed(1)} / 10</Text>
      </View>
      <Text style={styles.etiqueta}>SOBRE O FILME</Text>
      <Text style={styles.texto}>{filme.descricao}</Text>

      <Pressable
        style={styles.botaoEditar}
        onPress={() => router.push({ pathname: '/editar', params: { id } })}
      >
        <Text style={styles.textoBotao}>EDITAR INFORMAÇÕES</Text>
      </Pressable>
      <Pressable style={styles.botaoExcluir} onPress={confirmarExclusao}>
        <Text style={styles.textoExcluir}>EXCLUIR FILME</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0c12' },
  conteudo: { padding: 22, paddingBottom: 40 },
  playerTrailer: { height: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#171922', alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#34303a' },
  webview: { flex: 1, alignSelf: 'stretch', backgroundColor: '#171922' },
  semTrailer: { color: '#a4a6af', fontSize: 14, textAlign: 'center', padding: 24 },
  linkTrailer: { alignSelf: 'flex-end', paddingVertical: 8, marginBottom: 14 },
  textoLinkTrailer: { color: '#ff858b', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  genero: { color: '#ff858b', fontWeight: '800', fontSize: 13 },
  titulo: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 6 },
  dados: { flexDirection: 'row', alignItems: 'center', marginTop: 11, marginBottom: 28 },
  ano: { color: '#a4a6af' },
  ponto: { color: '#555965', marginHorizontal: 10 },
  avaliacao: { color: '#ffd166', fontWeight: '800' },
  etiqueta: { color: '#777b87', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  texto: { color: '#b7b9c1', fontSize: 15, lineHeight: 24 },
  botaoEditar: { backgroundColor: '#e53943', padding: 16, borderRadius: 13, alignItems: 'center', marginTop: 30 },
  textoBotao: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  botaoExcluir: { padding: 16, alignItems: 'center', marginTop: 5 },
  textoExcluir: { color: '#ff858b', fontWeight: '800', fontSize: 12 },
  centralizado: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0c12' },
});
