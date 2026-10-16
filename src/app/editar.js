import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { requisicao } from '../api';

export default function Editar() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [filme, setFilme] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [ano, setAno] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    requisicao(`/filmes/${id}`)
      .then((dados) => {
        setFilme(dados);
        setTitulo(dados.titulo);
        setGenero(dados.genero);
        setAno(String(dados.ano));
        setAvaliacao(String(dados.avaliacao));
        setDescricao(dados.descricao);
        setTrailerUrl(dados.trailer_url || '');
      })
      .catch((error) => setMensagem(error.message));
  }, [id]);

  async function salvarAlteracoes() {
    if ([titulo, genero, ano, avaliacao, descricao].some((valor) => !valor.trim())) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    const anoNumerico = Number(ano);
    const notaNumerica = Number(avaliacao);
    if (!Number.isInteger(anoNumerico) || anoNumerico < 1888 || anoNumerico > new Date().getFullYear() + 5) {
      setMensagem('Informe um ano válido.');
      return;
    }
    if (!Number.isFinite(notaNumerica) || notaNumerica < 0 || notaNumerica > 10) {
      setMensagem('A avaliação precisa estar entre 0 e 10.');
      return;
    }

    try {
      setSalvando(true);
      setMensagem('');
      await requisicao(`/filmes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo,
          genero,
          ano: anoNumerico,
          avaliacao: notaNumerica,
          descricao,
          trailerUrl: trailerUrl.trim(),
        }),
      });
      router.replace({ pathname: '/detalhes', params: { id } });
    } catch (error) {
      setMensagem(error.message);
    } finally {
      setSalvando(false);
    }
  }

  function campo(rotulo, valor, alterar, opcoes = {}) {
    return (
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>{rotulo}</Text>
        <TextInput
          style={[styles.campo, opcoes.multiline && styles.campoDescricao]}
          value={valor}
          onChangeText={alterar}
          placeholder={rotulo}
          placeholderTextColor="#696d79"
          keyboardType={opcoes.keyboardType || 'default'}
          multiline={opcoes.multiline || false}
          textAlignVertical={opcoes.multiline ? 'top' : 'center'}
        />
      </View>
    );
  }

  if (!filme) {
    return (
      <View style={styles.centralizado}>
        {mensagem ? <Text style={styles.erro}>{mensagem}</Text> : <ActivityIndicator color="#ef4444" />}
        {!!mensagem && <Pressable onPress={() => router.back()}><Text style={styles.voltar}>VOLTAR</Text></Pressable>}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
      <Text style={styles.introducao}>Altere as informações do filme.</Text>
      {campo('Título', titulo, setTitulo)}
      {campo('Gênero', genero, setGenero)}
      {campo('Ano de lançamento', ano, setAno, { keyboardType: 'numeric' })}
      {campo('Avaliação (0 a 10)', avaliacao, setAvaliacao, { keyboardType: 'decimal-pad' })}
      {campo('Descrição', descricao, setDescricao, { multiline: true })}
      {campo('Link do trailer (opcional)', trailerUrl, setTrailerUrl)}
      {!!mensagem && <Text style={styles.erro}>{mensagem}</Text>}
      <Pressable style={styles.botao} onPress={salvarAlteracoes} disabled={salvando}>
        {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotao}>SALVAR ALTERAÇÕES</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0c12' },
  conteudo: { padding: 20, paddingBottom: 40 },
  introducao: { color: '#a4a6af', fontSize: 14, marginBottom: 22 },
  grupo: { marginBottom: 15 },
  rotulo: { color: '#ff858b', fontSize: 12, fontWeight: '800', marginBottom: 8 },
  campo: { minHeight: 51, backgroundColor: '#171922', borderColor: '#2a2d37', borderWidth: 1, borderRadius: 13, color: '#fff', paddingHorizontal: 14, fontSize: 15 },
  campoDescricao: { minHeight: 115, paddingTop: 14 },
  erro: { color: '#ff9a9a', marginBottom: 14, textAlign: 'center' },
  voltar: { color: '#ff858b', fontWeight: '800', padding: 14 },
  botao: { minHeight: 54, backgroundColor: '#e53943', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  textoBotao: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  centralizado: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0c12', padding: 25 },
});
