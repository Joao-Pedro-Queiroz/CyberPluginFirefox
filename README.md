# Cyber Privacy Inspector

Extensão para Firefox desenvolvida com o objetivo de analisar e mitigar mecanismos de rastreamento durante a navegação web.

---

## Desenvolvedores

João Pedro Queiroz Viana  
Pedro Fardin  

---

## 1. Objetivo

O Cyber Privacy Inspector foi desenvolvido para identificar, analisar e bloquear mecanismos de rastreamento utilizados por sites, permitindo ao usuário visualizar indicadores relevantes de privacidade e segurança durante a navegação.

A extensão atua de forma passiva e ativa, combinando análise de tráfego, inspeção de armazenamento local e bloqueio de requisições associadas a rastreadores conhecidos.

---

## 2. Visão Geral da Solução

A extensão monitora o comportamento das páginas acessadas e produz um relatório de privacidade contendo:

- conexões externas realizadas pela página
- uso de cookies e armazenamento local
- presença de rastreadores conhecidos
- tentativas de sincronização de identificadores
- indicadores de possíveis técnicas de fingerprinting
- classificação do nível de privacidade da navegação

Além disso, permite o bloqueio automático e manual de domínios associados a rastreamento.

---

## 3. Funcionalidades Implementadas

### 3.1 Monitoramento de Rede

- Identificação de requisições realizadas pela página
- Detecção de domínios de terceira parte
- Registro de domínios externos acessados

---

### 3.2 Análise de Cookies

- Coleta de cookies associados à página
- Classificação em:
  - primeira parte
  - terceira parte
- Identificação de:
  - cookies de sessão
  - cookies persistentes

---

### 3.3 Análise de Armazenamento (Supercookies)

- Detecção de uso de:
  - localStorage
  - sessionStorage
  - IndexedDB
- Identificação de possíveis mecanismos de persistência de dados no navegador

---

### 3.4 Detecção de Técnicas de Rastreamento

- Detecção heurística de:
  - cookie syncing
  - parâmetros de identificação em URLs
- Identificação de possíveis sinais de:
  - canvas fingerprint
  - técnicas de rastreamento baseadas em navegador

---

### 3.5 Identificação e Bloqueio de Rastreadores

- Comparação de domínios com uma lista de rastreadores conhecidos
- Bloqueio automático de requisições associadas a rastreadores
- Registro dos rastreadores bloqueados durante a navegação

---

### 3.6 Classificação de Rastreadores

- Diferenciação entre:
  - rastreadores de primeira parte
  - rastreadores de terceira parte
- Exibição dessa classificação no relatório da extensão

---

### 3.7 Gerenciamento de Bloqueios

- Interface para inclusão de domínios personalizados
- Aplicação de bloqueio manual pelo usuário

---

### 3.8 Pontuação de Privacidade

- Cálculo de um score de privacidade baseado em:
  - número de requisições externas
  - quantidade de cookies
  - presença de rastreadores
  - uso de armazenamento persistente
- Classificação do nível de privacidade da página

---

## 4. Estrutura do Projeto

```
CyberPluginFirefox/ 
├── icons/ 
│ └── icon.png 
├── background.js 
├── content.js 
├── manifest.json 
├── options.html 
├── popup.css 
├── popup.html 
├── popup.js 
├── trackerList.json 
└── README.md
```

---

## 5. Como Testar a Extensão

1. Abrir o Firefox  
2. Acessar:  
   about:debugging  
3. Clicar em **Este Firefox**  
4. Clicar em **Carregar extensão temporária**  
5. Selecionar o arquivo `manifest.json`  
6. Acessar um site com alto volume de rastreadores, por exemplo:  
   https://g1.globo.com  
7. Clicar no ícone da extensão  

---

## 6. Exemplos de Resultado

### Rastreadores detectados

- www.googletagmanager.com - Terceira parte  
- securepubads.g.doubleclick.net - Terceira parte  
- sb.scorecardresearch.com - Terceira parte  

### Rastreadores bloqueados

- www.googletagmanager.com - Rastreador conhecido - Terceira parte  
- securepubads.g.doubleclick.net - Rastreador conhecido - Terceira parte  

---

## 7. Considerações Técnicas

A extensão utiliza técnicas heurísticas para identificar padrões de rastreamento, como a presença de identificadores em requisições e o uso de armazenamento persistente.

O objetivo não é apenas bloquear rastreadores, mas também fornecer visibilidade sobre o comportamento de coleta de dados durante a navegação web, contribuindo para a conscientização sobre privacidade digital.
