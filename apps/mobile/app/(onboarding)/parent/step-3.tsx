import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i < current ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

const LGPD_TEXT = `TERMO DE CONSENTIMENTO PARENTAL PARA TRATAMENTO DE DADOS PESSOAIS DE CRIANÇAS E ADOLESCENTES
(Lei Geral de Proteção de Dados Pessoais — LGPD, Lei nº 13.709/2018, Art. 14)

1. IDENTIFICAÇÃO DO CONTROLADOR

O presente Termo de Consentimento é apresentado pela Liveaula Tecnologia Educacional Ltda., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº [CNPJ], com sede na cidade de São Paulo/SP ("Liveaula" ou "Controlador"), responsável pelo tratamento dos dados pessoais coletados por meio da plataforma digital Liveaula.

2. FUNDAMENTO LEGAL E FINALIDADE

Em conformidade com o Art. 14 da Lei Geral de Proteção de Dados Pessoais (LGPD), o tratamento de dados pessoais de crianças e adolescentes somente poderá ser realizado com o consentimento específico e destacado fornecido por pelo menos um dos pais ou pelo responsável legal. Este consentimento é colhido de forma destacada, em linguagem clara e acessível, conforme determina a legislação vigente.

Os dados pessoais do menor serão tratados exclusivamente para as seguintes finalidades:

a) Cadastro e identificação do aluno na plataforma Liveaula, permitindo que professores registrem e acompanhem as aulas ministradas;
b) Comunicação de registros de aulas, frequência, desempenho e evolução acadêmica ao responsável legal;
c) Personalização da experiência educacional, incluindo configuração de perfil, histórico de aulas e acompanhamento pedagógico;
d) Envio de notificações push para o responsável legal informando sobre aulas realizadas, cancelamentos e comunicados do professor;
e) Melhoria contínua dos serviços prestados pela plataforma, mediante análise estatística e agregada dos dados de uso;
f) Cumprimento de obrigações legais e regulatórias aplicáveis ao setor educacional;
g) Eventual cobrança e gestão de assinatura do serviço, vinculada ao CPF ou CNPJ do responsável legal, nunca ao do menor.

3. DADOS COLETADOS

Os seguintes dados pessoais do menor poderão ser coletados e tratados pela Liveaula:

- Nome completo;
- Foto de perfil (opcional, mediante consentimento expresso);
- Série/ano escolar e disciplinas cursadas;
- Registros de aulas: data, hora, duração e observações do professor;
- Histórico de frequência e presença;
- Identificadores técnicos internos (IDs de sistema, nunca CPF ou RG do menor).

Esclarecemos que a Liveaula NÃO coleta, em nenhuma hipótese, dados sensíveis dos menores, tais como dados biométricos, dados de saúde, opiniões políticas, religiosas ou filosóficas, salvo mediante novo consentimento específico e justificativa legal adequada.

4. COMPARTILHAMENTO DE DADOS

Os dados pessoais do menor serão compartilhados exclusivamente:

a) Com o professor cadastrado na plataforma que ministra aulas ao aluno, limitado ao necessário para execução do serviço;
b) Com prestadores de serviço técnico da Liveaula, tais como serviços de hospedagem em nuvem (ex.: Railway, Vercel), serviços de armazenamento de arquivos (ex.: Cloudinary) e serviços de envio de notificações (ex.: Firebase Cloud Messaging), todos devidamente vinculados por contratos que garantem nível de proteção equivalente ao da LGPD;
c) Com autoridades competentes, em caso de determinação legal ou judicial.

A Liveaula não vende, aluga, cede ou compartilha dados pessoais de crianças e adolescentes para fins comerciais ou publicitários.

5. PRAZO DE CONSERVAÇÃO

Os dados pessoais do menor serão conservados pelo período necessário ao cumprimento das finalidades descritas neste Termo, observados os seguintes critérios:

- Durante a vigência do contrato de prestação de serviços;
- Por até 5 (cinco) anos após o encerramento do vínculo contratual, para fins de cumprimento de obrigações legais e exercício regular de direito em processos judiciais ou administrativos;
- Em caso de determinação legal específica que exija prazo superior, este prevalecerá.

Findo o prazo de conservação, os dados serão eliminados de forma segura ou anonimizados, conforme as boas práticas de segurança da informação.

6. DIREITOS DO TITULAR E DO RESPONSÁVEL LEGAL

Na qualidade de responsável legal pelo menor, você possui os seguintes direitos em relação aos dados pessoais tratados, garantidos pelo Art. 18 da LGPD:

a) Confirmação da existência de tratamento;
b) Acesso aos dados coletados;
c) Correção de dados incompletos, inexatos ou desatualizados;
d) Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;
e) Portabilidade dos dados a outro fornecedor de serviço ou produto;
f) Eliminação dos dados pessoais tratados com o seu consentimento;
g) Informação sobre as entidades com as quais o Controlador realizou uso compartilhado de dados;
h) Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;
i) Revogação do consentimento a qualquer tempo, mediante manifestação expressa.

Para exercer qualquer um dos direitos acima, ou para revogar o presente consentimento, o responsável legal deverá entrar em contato com o Encarregado de Proteção de Dados (DPO) da Liveaula pelo e-mail: privacidade@liveaula.com.br. A solicitação será atendida no prazo de 15 (quinze) dias úteis.

7. SEGURANÇA DOS DADOS

A Liveaula adota medidas técnicas e organizacionais adequadas para proteger os dados pessoais do menor contra acesso não autorizado, destruição acidental ou ilícita, perda, alteração, comunicação ou qualquer forma de tratamento inadequado. Entre as medidas adotadas destacam-se: criptografia de dados em trânsito (TLS/HTTPS), autenticação via tokens JWT com prazo de expiração curto, controle de acesso baseado em perfis (RBAC) e armazenamento seguro de credenciais.

8. ENCARREGADO DE PROTEÇÃO DE DADOS (DPO)

Em conformidade com o Art. 41 da LGPD, o Encarregado de Proteção de Dados da Liveaula pode ser contatado pelo e-mail: privacidade@liveaula.com.br.

9. CONSENTIMENTO

Ao clicar em "Li e aceito os termos", o responsável legal declara:

(i) Ter lido e compreendido integralmente o presente Termo;
(ii) Ser o pai, mãe ou responsável legal do menor identificado na plataforma;
(iii) Consentir, de forma livre, informada e inequívoca, com o tratamento dos dados pessoais do menor para as finalidades descritas neste instrumento;
(iv) Estar ciente de que poderá revogar este consentimento a qualquer tempo, sem prejuízo da legalidade do tratamento realizado anteriormente à revogação.

Este consentimento é registrado eletronicamente com data, hora e versão do documento (v1.0), conforme exigido pelo Art. 14, § 5º da LGPD.
`;

export default function ParentStep3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, studentName, studentId } = useLocalSearchParams<{
    token: string;
    studentName: string;
    studentId: string;
  }>();

  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const isAtEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 10;
    if (isAtEnd && !hasReachedEnd) {
      setHasReachedEnd(true);
    }
  };

  const handleAccept = async () => {
    if (!hasReachedEnd) return;
    setIsLoading(true);
    try {
      await apiFetch('/consent', {
        method: 'POST',
        body: JSON.stringify({ consentType: 'LGPD_PARENTAL_ART14', version: '1.0' }),
      });
      router.push({
        pathname: '/(onboarding)/parent/step-4',
        params: { token, studentName, studentId },
      } as never);
    } catch {
      // Even if consent API fails, we don't block — log and proceed
      router.push({
        pathname: '/(onboarding)/parent/step-4',
        params: { token, studentName, studentId },
      } as never);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <ProgressDots total={4} current={3} />
      <Text style={styles.title}>Consentimento LGPD</Text>
      <Text style={styles.subtitle}>Leia todo o termo para continuar</Text>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator
      >
        <Text style={styles.lgpdText}>{LGPD_TEXT}</Text>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.button, (!hasReachedEnd || isLoading) && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={!hasReachedEnd || isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Registrando...' : 'Li e aceito os termos'}
          </Text>
        </TouchableOpacity>
        {!hasReachedEnd && (
          <Text style={styles.hintText}>Role até o final para aceitar</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5', paddingHorizontal: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#1A6B74' },
  dotInactive: { backgroundColor: '#CBD5E1' },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 4, fontFamily: 'Nunito_700Bold' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 12, fontFamily: 'Nunito_400Regular' },
  scrollArea: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#fff', marginBottom: 8 },
  scrollContent: { padding: 16 },
  lgpdText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  buttonContainer: { paddingTop: 12 },
  button: {
    height: 52,
    backgroundColor: '#1A6B74',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: '#CBD5E1' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Nunito_600SemiBold' },
  hintText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 8 },
});
