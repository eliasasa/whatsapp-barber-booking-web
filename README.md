# WhatsApp Barber Booking Web

Frontend do painel de operacao para visualizar os agendamentos da barbearia.

## Comandos

```bash
npm run dev    # sobe em http://localhost:3002
npm run lint   # valida padrao e qualidade
npm run build  # build de producao
npm run start  # sobe build de producao
```

## Variaveis de ambiente

Opcional:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Se nao for definida, o frontend usa `http://localhost:3000` como padrao.

## Estrutura (padrao comercial)

```text
src/
	app/                       # rotas e layout do Next.js
	lib/                       # configuracao e utilitarios compartilhados
	types/                     # contratos de tipos do dominio
	features/
		appointments/
			api/                   # chamadas HTTP da feature
			components/            # componentes da feature
			index.ts               # ponto unico de exportacao
```

## Funcionalidade atual

- Listagem de agendamentos.
- Acao de cancelamento com confirmacao no frontend.
- Atualizacao imediata do status para "Cancelado" apos sucesso.

## Diretrizes

- Evite usar `any`; prefira tipos em `src/types`.
- Toda chamada HTTP nova deve passar por `src/lib/http.ts`.
- Organize telas por feature para facilitar escalabilidade.
