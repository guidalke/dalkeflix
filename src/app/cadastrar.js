import { useState } from 'react';
import { useRouter } from 'expo-router';
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

export default function Cadastrar() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [ano, setAno] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function cadastrarFilme() {
    const campos = [titulo, genero, ano, avaliacao, descricao];
    if (campos.some((campo) => !campo.trim())) {
      setSalvo(false);
      setMensagem('Preencha todos os campos.');
      return;
    }

    const anoNumerico = Number(ano);
    const notaNumerica = Number(avaliacao);
    if (!Number.isInteger(anoNumerico) || anoNumerico < 1888 || anoNumerico > new Date().getFullYear() + 5) {
      setSalvo(false);
      setMensagem('Informe um ano válido.');
      return;
    }
    if (!Number.isFinite(notaNumerica) || notaNumerica < 0 || notaNumerica > 10) {
      setSalvo(false);
      setMensagem('A avaliação precisa estar entre 0 e 10.');
      return;
    }

    try {
      setEnviando(true);
      setMensagem('');
      await requisicao('/filmes', {
        method: 'POST',
        body: JSON.stringify({
          titulo,
          genero,
          ano: anoNumerico,
          avaliacao: notaNumerica,
          descricao,
          trailerUrl: trailerUrl.trim(),
        }),
      });
      setSalvo(true);
      setMensagem('Filme cadastrado com sucesso!');
    } catch (error) {
      setSalvo(false);
      setMensagem(error.message);
    } finally {
      setEnviando(false);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
      <Text style={styles.introducao}>Preencha as informações para adicionar um filme à coleção.</Text>
      {campo('Título', titulo, setTitulo)}
      {campo('Gênero', genero, setGenero)}
      {campo('Ano de lançamento', ano, setAno, { keyboardType: 'numeric' })}
      {campo('Avaliação (0 a 10)', avaliacao, setAvaliacao, { keyboardType: 'decimal-pad' })}
      {campo('Descrição', descricao, setDescricao, { multiline: true })}
      {campo('Link do trailer (opcional)', trailerUrl, setTrailerUrl)}

      {!!mensagem && <Text style={salvo ? styles.sucesso : styles.erro}>{mensagem}</Text>}
      {!salvo && (
        <Pressable style={styles.botao} onPress={cadastrarFilme} disabled={enviando}>
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotao}>CADASTRAR FILME</Text>}
        </Pressable>
      )}
      {salvo && (
        <Pressable style={styles.botaoVoltar} onPress={() => router.replace('/catalogo')}>
          <Text style={styles.textoBotaoVoltar}>VOLTAR AO CATÁLOGO</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0c12' },
  conteudo: { padding: 20, paddingBottom: 40 },
  introducao: { color: '#a4a6af', fontSize: 14, marginBottom: 22, lineHeight: 21 },
  grupo: { marginBottom: 15 },
  rotulo: { color: '#ff858b', fontSize: 12, fontWeight: '800', marginBottom: 8 },
  campo: { minHeight: 51, backgroundColor: '#171922', borderColor: '#2a2d37', borderWidth: 1, borderRadius: 13, color: '#fff', paddingHorizontal: 14, fontSize: 15 },
  campoDescricao: { minHeight: 115, paddingTop: 14 },
  erro: { color: '#ff9a9a', marginBottom: 14 },
  sucesso: { color: '#86efac', marginBottom: 14 },
  botao: { minHeight: 54, backgroundColor: '#e53943', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  textoBotao: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  botaoVoltar: { alignItems: 'center', paddingVertical: 18 },
  textoBotaoVoltar: { color: '#ff9ba1', fontSize: 12, fontWeight: '800' },
});
