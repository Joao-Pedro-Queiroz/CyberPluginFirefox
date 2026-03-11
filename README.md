# Cyber Privacy Inspector

Extensão para Firefox desenvolvida para a Avaliação Intermediária de
Cybersegurança.


## Dsenvolvedores

João Pedro Queiroz Viana\
Pedro Fardin

------------------------------------------------------------------------

## Objetivo

Detectar, analisar e bloquear mecanismos de rastreamento utilizados por
sites durante a navegação web, permitindo que o usuário visualize
indicadores de privacidade da página.

------------------------------------------------------------------------

## Funcionalidades

### Conceito C

-   Detecção de conexões com domínios de terceira parte
-   Análise de cookies
-   Identificação de cookies de sessão e persistentes
-   Detecção de supercookies
-   Análise de localStorage, sessionStorage e IndexedDB
-   Detecção heurística de cookie syncing
-   Detecção heurística de canvas fingerprint
-   Detecção de possíveis ameaças de hijacking
-   Cálculo de pontuação de privacidade da página

### Conceito B

-   Interface simples para o usuário
-   Identificação de rastreadores conhecidos
-   Bloqueio automático de rastreadores conhecidos
-   Relatório mostrando rastreadores bloqueados durante a navegação
-   Página de configuração para gerenciamento de bloqueios
    personalizados

### Conceito A

-   Diferenciação entre rastreadores de primeira parte e de terceira
    parte
-   Classificação exibida no relatório da extensão
-   Exibição da classificação também nos rastreadores bloqueados

------------------------------------------------------------------------

## Estrutura do Projeto

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

------------------------------------------------------------------------

## Como testar a extensão

1.  Abrir o Firefox
2.  Acessar: about:debugging
3.  Clicar em **Este Firefox**
4.  Clicar em **Carregar extensão temporária**
5.  Selecionar o arquivo `manifest.json`
6.  Abrir um site com rastreadores, por exemplo: https://g1.globo.com
7.  Clicar no ícone da extensão

A extensão mostrará: - Domínios de terceira parte - Rastreadores
conhecidos detectados - Rastreadores bloqueados - Análise de cookies -
Indicadores de armazenamento - Pontuação de privacidade

------------------------------------------------------------------------

## Exemplos de saída

### Rastreadores detectados

-   www.googletagmanager.com --- Terceira parte
-   securepubads.g.doubleclick.net --- Terceira parte
-   sb.scorecardresearch.com --- Terceira parte

### Rastreadores bloqueados

-   www.googletagmanager.com --- Rastreador conhecido --- Terceira parte
-   securepubads.g.doubleclick.net --- Rastreador conhecido --- Terceira
    parte

------------------------------------------------------------------------

## Observação

A extensão utiliza métodos heurísticos para identificar alguns
comportamentos de rastreamento. O objetivo do projeto é demonstrar
técnicas de análise de privacidade utilizadas por ferramentas reais de
proteção de navegação.