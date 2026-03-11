# Cyber Privacy Inspector

Extensão Firefox desenvolvida para a atividade de Cybersegurança.

## Conceito C
- Detecção de domínios de terceira parte
- Análise de cookies
- Detecção de localStorage, sessionStorage e IndexedDB
- Detecção heurística de canvas fingerprint
- Detecção heurística de cookie syncing
- Sinais heurísticos de hijacking
- Pontuação de privacidade

## Conceito B
- Identificação de rastreadores conhecidos
- Bloqueio automático de rastreadores conhecidos
- Relatório de rastreadores bloqueados
- Interface para gerenciamento de bloqueios personalizados

## Como testar
1. Abra o Firefox
2. Acesse about:debugging
3. Clique em "Este Firefox"
4. Clique em "Carregar extensão temporária"
5. Selecione o arquivo manifest.json
6. Acesse um site com anúncios e rastreadores
7. Clique no ícone da extensão