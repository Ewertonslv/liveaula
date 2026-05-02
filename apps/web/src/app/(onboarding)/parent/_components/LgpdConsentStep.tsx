'use client';
import { useRef, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

const LGPD_TEXT = `TERMO DE CONSENTIMENTO PARENTAL — LGPD ART. 14

Este Termo de Consentimento Parental é celebrado em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018), especialmente em seu Artigo 14, que trata do tratamento de dados pessoais de crianças e adolescentes.

1. DADOS COLETADOS
A plataforma liveaula coleta os seguintes dados do menor sob sua responsabilidade:
- Nome completo
- Série/ano escolar
- Matéria(s) estudada(s)
- Registros das aulas (conteúdo, duração, observações do professor)
- Foto de perfil (opcional, mediante upload do responsável)

2. FINALIDADE DO TRATAMENTO
Os dados são utilizados exclusivamente para:
- Registro e acompanhamento das aulas particulares
- Comunicação entre professor e responsável
- Exibição do histórico de aulas para o responsável

3. COMPARTILHAMENTO
Os dados do menor são compartilhados apenas com o professor responsável pelas aulas. Não compartilhamos com terceiros para fins comerciais.

4. DIREITOS DO TITULAR
Você, como responsável legal, tem direito a: acessar, corrigir, deletar e solicitar portabilidade dos dados do menor a qualquer momento, através das configurações da plataforma ou pelo email privacidade@liveaula.com.

5. REVOGAÇÃO
Este consentimento pode ser revogado a qualquer momento. A revogação implica na impossibilidade de utilização do serviço de acompanhamento.

6. CONTATO DPO
Encarregado de Proteção de Dados: dpo@liveaula.com

Ao aceitar este termo, você declara ser responsável legal pelo menor e que as informações fornecidas são verdadeiras.`;

export function LgpdConsentStep({ onAccept }: { onAccept: () => void }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (isAtBottom) setHasScrolled(true);
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await apiFetch('/consent', {
        method: 'POST',
        body: JSON.stringify({ consentType: 'LGPD_PARENTAL_ART14', version: '1.0' }),
      });
      onAccept();
    } catch {
      // Se falhar, ainda permite continuar (idempotente)
      onAccept();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Termo de Consentimento LGPD</h2>
        <p className="text-sm text-gray-500 mt-1">Leia o termo completo para continuar</p>
      </div>

      <div
        onScroll={handleScroll}
        className="p-6 h-72 overflow-y-auto text-sm text-gray-600 leading-relaxed whitespace-pre-line"
      >
        {LGPD_TEXT}
        <div ref={bottomRef} />
      </div>

      {!hasScrolled && (
        <div className="px-6 py-2 bg-amber-50 border-t border-amber-100">
          <p className="text-xs text-amber-700">↓ Role até o final para habilitar o botão de aceite</p>
        </div>
      )}

      <div className="p-6 border-t">
        <button
          onClick={handleAccept}
          disabled={!hasScrolled || isLoading}
          className="w-full py-3 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Registrando...' : 'Li e aceito os termos'}
        </button>
      </div>
    </div>
  );
}
