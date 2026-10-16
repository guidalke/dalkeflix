import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { requisicao } from '../api';

function CartaoFavorito({ filme, indice, abrir, compacto = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${filme?.titulo || 'escolher favorito'}`}
      style={({ pressed }) => [styles.cartaoFavorito, compacto && styles.cartaoCompacto, pressed && styles.pressionado]}
      onPress={() => filme ? abrir(filme.id) : abrir()}
    >
      <View style={styles.cartaoTopo}>
        <Text style={styles.numeroCartao}>0{indice + 1}</Text>
        <Text style={filme ? styles.estrela : styles.estrelaVazia}>{filme ? '★' : '☆'}</Text>
      </View>
      {filme ? (
        <>
          <Text style={styles.tituloFilme} numberOfLines={2}>{filme.titulo}</Text>
          <Text style={styles.dadosFilme} numberOfLines={1}>{filme.genero}  ·  {filme.ano}</Text>
          <View style={styles.cartaoRodape}><Text style={styles.cartaoAcao}>VER DETALHES</Text><Text style={styles.setaPequena}>↗</Text></View>
        </>
      ) : (
        <>
          <Text style={styles.tituloVazio}>Seu próximo favorito</Text>
          <Text style={styles.dadosVazio}>Escolha no catálogo</Text>
          <View style={styles.cartaoRodape}><Text style={styles.cartaoAcao}>DESCOBRIR</Text><Text style={styles.setaPequena}>↗</Text></View>
        </>
      )}
    </Pressable>
  );
}

export default function Inicio() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const ampla = width >= 900;
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarFavoritos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');
      const filmes = await requisicao('/filmes');
      setFavoritos(filmes.filter((filme) => Boolean(filme.favorito)).slice(0, 3));
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregarFavoritos(); }, [carregarFavoritos]));

  const filmeDestaque = favoritos[0];
  const abrirDetalhes = (id) => id && router.push({ pathname: '/detalhes', params: { id } });
  const abrirCatalogo = () => router.push('/catalogo');

  return (
    <ScrollView style={styles.fundo} contentContainerStyle={styles.pagina}>
      <View style={[styles.conteudo, ampla && styles.conteudoAmplo]}>
        <View style={styles.topo}>
          <Pressable style={styles.marca} onPress={() => router.replace('/')}>
            <Image accessibilityLabel="Logo Dalkeflix" source={require('../../assets/logo-dalkeflix.png')} resizeMode="contain" style={styles.logo} />
            <View><Text style={styles.nomeMarca}>Dalkeflix</Text><Text style={styles.assinaturaMarca}>SEU CINEMA PARTICULAR</Text></View>
          </Pressable>
          <Pressable style={styles.linkTopo} onPress={abrirCatalogo}><Text style={styles.linkTopoTexto}>CATÁLOGO</Text><Text style={styles.linkSeta}>↗</Text></Pressable>
        </View>

        <View style={[styles.hero, ampla && styles.heroAmplo]}>
          <View style={[styles.heroTexto, ampla && styles.heroTextoAmplo]}>
            <View style={styles.selo}><View style={styles.pontoSelo} /><Text style={styles.seloTexto}>UMA CURADORIA SÓ SUA</Text></View>
            <Text style={[styles.titulo, !ampla && styles.tituloMobile]}>Histórias que{ '\n' }merecem <Text style={styles.tituloDestaque}>ser vistas.</Text></Text>
            <Text style={styles.descricao}>Sua coleção, seu próximo favorito. Guarde os filmes que ama e descubra qual história vem a seguir.</Text>
            <View style={styles.acoes}>
              <Pressable style={({ pressed }) => [styles.botaoPrincipal, pressed && styles.pressionado]} onPress={abrirCatalogo}>
                <Text style={styles.botaoPrincipalTexto}>EXPLORAR FILMES</Text><Text style={styles.botaoSeta}>→</Text>
              </Pressable>
              <Pressable style={styles.botaoSecundario} onPress={() => router.push('/cadastrar')}><Text style={styles.botaoSecundarioTexto}>＋  ADICIONAR</Text></Pressable>
            </View>
            <View style={styles.indicadores}><Text style={styles.indicadorNumero}>03</Text><Text style={styles.indicadorTexto}>ESPAÇOS PARA OS SEUS FAVORITOS</Text></View>
          </View>

          <Pressable style={[styles.painelDestaque, ampla && styles.painelAmplo, !ampla && styles.painelMobile]} onPress={() => filmeDestaque && abrirDetalhes(filmeDestaque.id)}>
            <View style={styles.orbeUm} /><View style={styles.orbeDois} /><View style={styles.linhaPoster} />
            <View style={styles.painelCabecalho}><Text style={styles.painelLabel}>EM DESTAQUE</Text><Text style={styles.painelEstrela}>✦</Text></View>
            <View style={styles.painelConteudo}>
              <Text style={styles.painelIndice}>{filmeDestaque ? 'DA SUA LISTA · 01' : 'A SUA PRÓXIMA SESSÃO'}</Text>
              {carregando ? <ActivityIndicator color="#f6b958" style={styles.loader} /> : filmeDestaque ? (
                <>
                  <Text style={styles.painelTitulo} numberOfLines={3}>{filmeDestaque.titulo}</Text>
                  <Text style={styles.painelDados}>{filmeDestaque.genero}  ·  {filmeDestaque.ano}</Text>
                  {filmeDestaque.avaliacao ? <Text style={styles.painelNota}>★  {filmeDestaque.avaliacao} / 10</Text> : null}
                </>
              ) : (
                <><Text style={styles.painelTitulo}>A próxima grande história</Text><Text style={styles.painelDados}>Marque um filme como favorito para vê-lo aqui.</Text></>
              )}
            </View>
            <View style={styles.painelRodape}><Text style={styles.painelRodapeTexto}>{filmeDestaque ? 'ABRIR FILME' : 'ENCONTRAR UM FILME'}</Text><Text style={styles.painelRodapeSeta}>↗</Text></View>
          </Pressable>
        </View>

        <View style={styles.secaoFavoritos}>
          <View style={styles.secaoCabecalho}>
            <View><Text style={styles.kicker}>A SUA SELEÇÃO</Text><Text style={styles.tituloFavoritos}>Favoritos da casa</Text></View>
            <View style={styles.contador}><Text style={styles.contadorTexto}>{favoritos.length}<Text style={styles.contadorLimite}> / 3</Text></Text></View>
          </View>
          {carregando ? <ActivityIndicator color="#e9a94e" style={styles.loaderFavoritos} /> : erro ? (
            <View style={styles.erroBox}><Text style={styles.mensagem}>{erro}</Text><Pressable onPress={carregarFavoritos}><Text style={styles.tentarNovamente}>TENTAR DE NOVO ↻</Text></Pressable></View>
          ) : (
            <View style={[styles.listaFavoritos, ampla && styles.listaAmpla]}>
              {[0, 1, 2].map((indice) => <CartaoFavorito key={favoritos[indice]?.id || `vazio-${indice}`} filme={favoritos[indice]} indice={indice} abrir={(id) => id ? abrirDetalhes(id) : abrirCatalogo()} compacto={!ampla} />)}
            </View>
          )}
        </View>

        <View style={styles.rodape}><Text style={styles.rodapeMarca}>Dalkeflix</Text><Text style={styles.rodapeTexto}>FEITO PARA QUEM AMA FILMES</Text><Text style={styles.rodapeAno}>SUA COLEÇÃO, NO SEU TEMPO</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: '#090a0e' },
  pagina: { paddingHorizontal: 24, paddingBottom: 24, backgroundColor: '#090a0e' },
  conteudo: { width: '100%', maxWidth: 1240, alignSelf: 'center' },
  conteudoAmplo: { paddingHorizontal: 20 },
  topo: { paddingTop: 26, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#25252b' },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 42, height: 48 },
  nomeMarca: { color: '#fff7ec', fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
  assinaturaMarca: { color: '#82818a', fontSize: 8, fontWeight: '800', letterSpacing: 1.8, marginTop: 3 },
  linkTopo: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 30, borderWidth: 1, borderColor: '#34333b' },
  linkTopoTexto: { color: '#e5e1dc', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  linkSeta: { color: '#e9a94e', fontSize: 14 },
  hero: { paddingTop: 42, paddingBottom: 44, gap: 34 },
  heroAmplo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 58, paddingBottom: 62, gap: 50 },
  heroTexto: { flex: 1, alignItems: 'flex-start' },
  heroTextoAmplo: { flexBasis: 0, minWidth: 0 },
  selo: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 },
  pontoSelo: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#e9a94e' },
  seloTexto: { color: '#e9a94e', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  titulo: { color: '#f9f4ec', fontSize: 58, lineHeight: 64, fontWeight: '900', letterSpacing: -2.2 },
  tituloMobile: { fontSize: 42, lineHeight: 46, letterSpacing: -1.4 },
  tituloDestaque: { color: '#e9a94e', fontStyle: 'italic' },
  descricao: { color: '#a7a3a0', fontSize: 15, lineHeight: 24, maxWidth: 470, marginTop: 18 },
  acoes: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 26 },
  botaoPrincipal: { height: 50, borderRadius: 11, backgroundColor: '#e54b50', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 24 },
  botaoPrincipalTexto: { color: '#fff9f2', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  botaoSeta: { color: '#fff9f2', fontSize: 19 },
  botaoSecundario: { height: 50, borderRadius: 11, paddingHorizontal: 16, borderWidth: 1, borderColor: '#3a3940', alignItems: 'center', justifyContent: 'center' },
  botaoSecundarioTexto: { color: '#e9e5df', fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  indicadorNumero: { color: '#f3b354', fontSize: 16, fontWeight: '900' },
  indicadores: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 37, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#24242b', width: '100%', maxWidth: 330 },
  indicadorTexto: { color: '#85828a', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  painelDestaque: { width: '100%', minHeight: 330, borderRadius: 20, padding: 22, overflow: 'hidden', backgroundColor: '#211819', borderWidth: 1, borderColor: '#533236', justifyContent: 'space-between', position: 'relative' },
  painelAmplo: { width: '44%', flexShrink: 0, minWidth: 0 },
  painelMobile: { minHeight: 265 },
  orbeUm: { position: 'absolute', width: 310, height: 310, borderRadius: 160, right: -70, top: -95, backgroundColor: '#7d3035', opacity: 0.36 },
  orbeDois: { position: 'absolute', width: 190, height: 190, borderRadius: 100, right: 30, top: 15, borderWidth: 1, borderColor: '#ce6860', opacity: 0.23 },
  linhaPoster: { position: 'absolute', width: 1, height: '140%', right: '31%', top: -20, backgroundColor: '#e99b70', opacity: 0.1, transform: [{ rotate: '27deg' }] },
  painelCabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  painelLabel: { color: '#e8b177', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  painelEstrela: { color: '#f4b85a', fontSize: 20 },
  painelConteudo: { maxWidth: 370, marginTop: 38, marginBottom: 28 },
  painelIndice: { color: '#d98474', fontSize: 9, fontWeight: '900', letterSpacing: 1.7, marginBottom: 12 },
  painelTitulo: { color: '#fff4e9', fontSize: 31, lineHeight: 35, fontWeight: '900', letterSpacing: -0.8 },
  painelDados: { color: '#c1aaa2', fontSize: 12, lineHeight: 19, marginTop: 10 },
  painelNota: { color: '#f3bb63', fontSize: 12, fontWeight: '800', marginTop: 13 },
  loader: { alignSelf: 'flex-start', paddingVertical: 15 },
  painelRodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#57373a' },
  painelRodapeTexto: { color: '#f0d6c1', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  painelRodapeSeta: { color: '#f3b45b', fontSize: 18 },
  secaoFavoritos: { paddingTop: 24, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#25252b' },
  secaoCabecalho: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 },
  kicker: { color: '#8c8990', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  tituloFavoritos: { color: '#f8f2e9', fontSize: 25, fontWeight: '900', letterSpacing: -0.6 },
  contador: { borderWidth: 1, borderColor: '#36333a', backgroundColor: '#15151b', borderRadius: 30, paddingHorizontal: 13, paddingVertical: 7 },
  contadorTexto: { color: '#eab35d', fontSize: 12, fontWeight: '900' },
  contadorLimite: { color: '#77747d' },
  listaFavoritos: { gap: 12 },
  listaAmpla: { flexDirection: 'row' },
  cartaoFavorito: { flex: 1, minHeight: 176, borderRadius: 15, padding: 16, backgroundColor: '#14141a', borderWidth: 1, borderColor: '#302f36' },
  cartaoCompacto: { minHeight: 162 },
  pressionado: { opacity: 0.82 },
  cartaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  numeroCartao: { color: '#77747d', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  estrela: { color: '#f2b44f', fontSize: 16 },
  estrelaVazia: { color: '#625d5e', fontSize: 19 },
  tituloFilme: { color: '#f5eee5', fontSize: 16, lineHeight: 20, fontWeight: '900', minHeight: 40 },
  dadosFilme: { color: '#96919a', fontSize: 11, marginTop: 6 },
  tituloVazio: { color: '#e2d9d0', fontSize: 14, fontWeight: '800' },
  dadosVazio: { color: '#827e86', fontSize: 11, marginTop: 6 },
  cartaoRodape: { marginTop: 'auto', paddingTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cartaoAcao: { color: '#c78364', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  setaPequena: { color: '#e6a751', fontSize: 14 },
  loaderFavoritos: { padding: 28 },
  erroBox: { padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#54373a', backgroundColor: '#1d1518' },
  mensagem: { color: '#e8b7aa', fontSize: 12 },
  tentarNovamente: { color: '#f1b65e', fontSize: 10, fontWeight: '900', marginTop: 12, letterSpacing: 1 },
  rodape: { paddingTop: 19, paddingBottom: 10, borderTopWidth: 1, borderTopColor: '#25252b', alignItems: 'center', gap: 7 },
  rodapeMarca: { color: '#e3ddd3', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  rodapeTexto: { color: '#77737d', fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
  rodapeAno: { color: '#514e57', fontSize: 8, letterSpacing: 1.1 },
});
