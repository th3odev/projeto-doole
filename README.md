# DOOLE | Marketplace Sustentável e Realtime ♻️

![Static Badge](https://img.shields.io/badge/STATUS-PROT%C3%93TIPO%20INICIAL%2FMVP-success)
![Static Badge](https://img.shields.io/badge/Chat%20e%20Lances-Realtime-blue)

## Preview
Acesse o protótipo funcional completo em produção:
👉 [**https://doole.vercel.app/**](https://doole.vercel.app/)

---

## Visão Geral
**DOOLE** é um **marketplace inteligente e sustentável** que conecta pessoas e empresas para dar um novo destino a itens usados, unindo **praticidade, tecnologia e impacto positivo** através da economia circular.

O projeto foi construído como um **MVP funcional** que simula o fluxo completo de compra e negociação, destacando:
1.  **Chat em Tempo Real:** Comunicação instantânea entre comprador e vendedor.
2.  **Sistema de Ofertas:** Lances e gestão de propostas.
3.  **Backend funcional:** Utilização do Supabase para toda a infraestrutura (Autenticação, DB, Realtime).

---

## Funcionalidades Implementadas (Status Atual)

O projeto está com o fluxo completo de negociação comprador ↔ vendedor funcional.

### Core System
- **Autenticação:** Login e Cadastro completos via **Supabase Auth**.
- **Itens:** CRUD de itens (venda/doação) com **upload de múltiplas imagens**.
- **Notificações:** Sistema Realtime com alertas contextuais e **títulos de itens dinâmicos** (ex: "Seu lance no *Notebook* foi aceito!").
- **Deploy:** CI/CD contínuo via **Vercel** (Integrado ao GitHub).

### Realtime & Negociação
- **Sistema de Ofertas:** Criação, Aceite e Recusa de lances com validações.
- **Chat Realtime:** Modal de chat global, lista de conversas e mensagens instantâneas entre as partes.
- **Integração Oferta ↔ Chat:** Uma conversa é **aberta** assim que o vendedor aceita uma oferta.

---

## Identidade Visual

**Nome:** Doole (Remete ao leilão "dole 1, dole 2, dole 3") também soa como doe e doou-lhe.
**Logo:** Tipografia arredondada, com os "👀" (Olhos) simbolizando **curiosidade, busca descoberta**.
**Fontes:** *Poppins* (títulos/interface) e *Inter* (textos e UI).

### **Paleta de Cores**

| Cor | Código | Uso Ideal |
| :--- | :--- | :--- |
| Preto carvão | `#141414` | Textos, Títulos |
| Laranja | `#FF550C` | **CTA, Ícones de Ação** |
| Azul petróleo | `#032B43` | Botões Secundários |

---

##  Estrutura do Projeto

### **Telas Principais**
1.  **Landing Page (Home):** Apresentação da proposta e CTA.
2.  **Login/Cadastro:** Autenticação via Supabase Auth.
3.  **Listagem de Itens:** Cards interativos com filtros e busca.
4.  **Página do Produto:** Galeria e modal de oferta com opções para o lance .
5.  **Adicionar Produto:** Formulário com upload de fotos.
6.  **Perfil:** Itens cadastrados, lances feitos e gerenciamento de ofertas.
7.  **Chat Global:** Modal Realtime acessível em todas as páginas.

---

## 💻 Stack Técnica
![Static Badge](https://img.shields.io/badge/HTML5-orange)
![Static Badge](https://img.shields.io/badge/CSS3-blue)
![Static Badge](https://img.shields.io/badge/JavaScript-yellow)
![Static Badge](https://img.shields.io/badge/Bootstrap5-purple)
![Static Badge](https://img.shields.io/badge/Supabase-green)
![Static Badge](https://img.shields.io/badge/Vercel-black)
![Static Badge](https://img.shields.io/badge/Figma-pink)

---
##  Design e Prototipagem (Figma)

O desenvolvimento do Doole seguiu um fluxo de trabalho que priorizou o design e o planejamento visual antes da codificação, garantindo um "norte" claro para o desenvolvimento.

**Metodologia:**

1.  **Fundação:** Iniciei com a criação da **Identidade Visual (Branding)** e da **Paleta de Cores** para dar vida ao conceito e propósito do projeto.
2.  **Estrutura (Wireframe):** Criei os primeiros **wireframes** para definir o fluxo do usuário e a hierarquia das informações nas telas principais.
3.  **Protótipo Final:** Evoluí para o **protótipo interativo de alta fidelidade** no Figma, estabelecendo o UI/UX completo e os componentes visuais.
4.  **Desenvolvimento Híbrido:** Embora a prototipagem inicial tenha sido essencial, muitos **aprimoramentos finos de UI/UX** foram feitos diretamente no código (durante o desenvolvimento) para otimizar CSS.

> *É difícil prototipar sem uma identidade, e difícil criar uma identidade sem um branding; por isso, fiz o branding, a identidade e, só então, o protótipo, garantindo que o código tivesse uma base sólida para seguir.*

**Acesse o Protótipo no Figma:**
👉 [[Wireframe e Protótipo no Figma]](https://www.figma.com/design/4LNw9BCEgi7Ow09LlBesEO/doole---movitalent?node-id=0-1&t=Kr5wGepaA11q5NYH-1)

---
## 🐱‍👤 Nota Pessoal e Aprendizados

Pretendo dar continuidade aprimorando o projeto e nos estudos para o mesmo, foi bastante divertido :).
Ele não está 100% longe de estar 100% mas eu realmente dei meu melhor até o momento e vou continuar dando...
Tenho algumas coisas em mente que posso implementar e melhorar.

**Obrigado pela atenção ☕**
