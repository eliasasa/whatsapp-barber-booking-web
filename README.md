# WhatsApp Barber Booking Web

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-20232A?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)

Painel web para operação da barbearia, com autenticação, gestão de agendamentos, clientes, serviços, disponibilidade e configurações do bot.

## Backend

Este frontend consome a API deste repositório:

https://github.com/eliasasa/whatsapp-barber-booking

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

## Funcionalidades implementadas

- Login com JWT (armazenado em localStorage).
- Rotas protegidas com redirecionamento automático para /login quando necessário.
- Injeção automática de Authorization Bearer Token nas chamadas HTTP.
- Tratamento centralizado de erro de API e respostas vazias (ex.: DELETE/204).
- Listagem, busca, filtro e cancelamento de agendamentos.
- Criação e edição de agendamentos com validação de disponibilidade e bloqueios.
- Campo de endereço no fluxo de agendamento.
- CRUD de clientes.
- CRUD de serviços, incluindo pausa/reativação.
- Configurações operacionais: status do bot (pausar/retomar), reinício do bot, mensagem de boas-vindas, agenda semanal de disponibilidade, bloqueios de agenda e clientes bloqueados.
- Modais de confirmação via portal para cobrir a tela inteira.
- Navbar oculta na rota de login.

## Rotas principais

- /login
- /
- /agendamentos
- /agendamentos/novo
- /agendamentos/editar
- /clientes
- /clientes/novo
- /clientes/[id]/editar
- /servicos
- /servicos/novo
- /servicos/[id]/editar
- /configuracoes

## Requisitos

- Node.js 20+
- npm 10+

## Configuração

Crie um arquivo .env.local na raiz do projeto:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Se a variável não for definida, o frontend usa http://localhost:3000 por padrão.

## Como rodar

1. Suba o backend primeiro (repositório da API).
2. Instale as dependências do frontend.
3. Rode o frontend.

```bash
npm install
npm run dev
```

Frontend: http://localhost:3002

## Screenshots

Visão do painel em desktop e mobile. As imagens estão em `public/assets/images`.

<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; align-items:start">

	<figure style="margin:0">
		<img src="/assets/images/services.png" alt="Serviços" style="width:100%; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.45)" />
		<figcaption style="font-size:13px; color:#999; margin-top:8px">Serviços — desktop</figcaption>
	</figure>

	<figure style="margin:0">
		<img src="/assets/images/appointments-mobile.png" alt="Agendamentos mobile" style="width:100%; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.45)" />
		<figcaption style="font-size:13px; color:#999; margin-top:8px">Agendamentos — mobile</figcaption>
	</figure>

	<figure style="margin:0">
		<img src="/assets/images/config-mobile.png" alt="Configurações mobile" style="width:100%; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.45)" />
		<figcaption style="font-size:13px; color:#999; margin-top:8px">Configurações — mobile</figcaption>
	</figure>

	<figure style="margin:0">
		<img src="/assets/images/config-desktop.png" alt="Configurações desktop" style="width:100%; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.45)" />
		<figcaption style="font-size:13px; color:#999; margin-top:8px">Configurações — desktop</figcaption>
	</figure>

</div>

Observação: o Next.js serve arquivos estáticos colocados na pasta `public`, portanto as imagens ficarão acessíveis em `/assets/images/<nome>`.
	app/                # rotas e layout
	components/         # UI e layout compartilhado
	features/           # módulos por domínio (appointments, clients, services, bot, availability, auth)
	hooks/              # hooks reutilizáveis
	lib/                # config e utilitários de infraestrutura
	providers/          # providers globais (auth, toast, etc.)
	styles/             # estilos globais
	types/              # contratos de tipos
```

## Observações

- Projeto com textos e formatos focados em pt-BR.
- Em desenvolvimento, o dev indicator do Next pode ser desativado em next.config.ts.

## Licença

MIT. Veja [LICENSE](LICENSE).

## Screenshots

- Serviços (desktop):

	![Serviços](/assets/images/services.png)

- Agendamentos (mobile):

	![Agendamentos - Mobile](/assets/images/appointments-mobile.png)

- Configurações (mobile):

	![Configurações - Mobile](/assets/images/config-mobile.png)

- Configurações (desktop):

	![Configurações - Desktop](/assets/images/config-desktop.png)
