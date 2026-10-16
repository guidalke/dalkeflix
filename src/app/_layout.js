import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#11131b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0b0c12' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="catalogo" options={{ title: 'Catálogo' }} />
        <Stack.Screen name="detalhes" options={{ title: 'Detalhes do filme' }} />
        <Stack.Screen name="cadastrar" options={{ title: 'Cadastrar filme' }} />
        <Stack.Screen name="editar" options={{ title: 'Editar filme' }} />
      </Stack>
    </>
  );
}
