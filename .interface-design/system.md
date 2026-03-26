# Rafa Finance — Design System

## Intent

**Who:** Rafaela (médica) e seu marido. Usam para registrar plantões e consultas e acompanhar o que ainda não foi pago. Mobile frequente (entre plantões), desktop para revisão mensal.

**What:** A tensão central é "trabalhei, quanto ainda não recebi?" — cada registro nasce como dívida e resolve como pagamento confirmado.

**Feel:** Como um caderno de honorários bem cuidado. Calmo, organizado, elegante. Feminino e refinado sem ser decorativo.

---

## Domain

**Concepts:** plantão, honorários, data prevista × data recebida, banco, convênio, prontuário, folha de ponto

**Signature element:** A lógica de *atrasado* — quando a data prevista de pagamento passou e o status ainda é Pendente, o visual muda: borda esquerda vinho-escuro, badge "Atrasado", indicador "Xd de atraso" na célula de previsão. Tornando imediatamente legível o que precisa de ação.

---

## Palette

### Brand — Navy Blue (primário atual)
```
#1C4E80   ← primário (navegação ativa, logo, avatar)
#EEF4FB   ← fundo do item ativo na sidebar
```

### CSS Variables (globals.css)
```
--primary:    214.9932 22.5930% 64.5044%  ← azul acinzentado médio (~#7B9AB8)
--secondary:  212.7183 29.9127% 84.0160%  ← azul claro (~#B8CDD9)
--ring:       215.4 18.4% 47%             ← azul médio (~#647E94) — focus ring
--background: 48 33.3333% 97.0588%        ← creme quente (~#FAF8F5)
--card:       igual ao background
--accent:     46.1538 22.8070% 88.8235%   ← bege quente
--muted:      20.0031 6.8725% 89.9826%    ← cinza quente claro
--border:     24.0058 6.6869% 82.9784%    ← cinza quente (≈ #E5E1DB)
```

### Cores hardcoded na Navegação
```
Sidebar ativo bg:    #EEF4FB
Sidebar ativo color: #1C4E80
Sidebar inativo:     #7A756E
Bottom nav inativo:  #A8A09A
Surface/header:      #FFFFFF
Border:              #E5E1DB
```

### Semântico — Pendente (Âmbar)
```
badge-pending bg:       #FEE9CC   color: #8A500A
borda esquerda:         #d97706
```

### Semântico — Recebido (Sálvia)
```
badge-received bg:      #3D5E3F   color: #FFFFFF
borda esquerda:         #5A7B5C
```

### Semântico — Atrasado (Vinho-Rosa) ← SIGNATURE
```
badge-overdue bg:       #9B1D3E   color: #FFFFFF
borda esquerda:         #9B2040
row bg:                 #FAF4F6
```

### Superfícies
```
Fundo da página:  hsl(var(--background)) ≈ #FAF8F5 (creme aquecido)
Cards:            hsl(var(--card)) — igual ao fundo
Inputs:           #FFFFFF
Borders:          #E5E1DB (hardcoded) / hsl(var(--border))
```

### Texto
```
Principal:          hsl(var(--foreground)) ≈ quase preto
Secundário/labels:  hsl(var(--muted-foreground))
Nav nome usuário:   #1A1816
Nav secundário:     #7A756E
```

---

## Typography

**Fontes carregadas:** sistema (sem Google Fonts no layout.tsx)

| Role | Font | Onde |
|---|---|---|
| UI / navegação | Inter, sans-serif (hardcoded) | Navigation, labels de nav |
| Body geral | var(--font-sans) — system sans | Componentes via Tailwind |
| Títulos / seções | var(--font-serif) — ui-serif, Georgia | Cabeçalhos de modal, painel detalhe |

**Nota:** O design original previa Cormorant Garamond + Jost. O código atual usa Inter hardcoded na navegação e fonts do sistema nos demais componentes. Se quiser voltar à tipografia original, requer adicionar Google Fonts no layout.tsx.

---

## Depth Strategy

**Border-only** — limpo, adequado para ferramenta pessoal.

- Sem sombras decorativas
- Elevation via cor de superfície
- Cards: `border: 1px solid #E5E1DB` ou `border: 1px solid hsl(var(--border))`
- Inputs: fundo `#FFFFFF`, borda `#E5E1DB`

---

## Spacing Base Unit

`4px` (Tailwind padrão). Escala: 4, 8, 12, 16, 20, 24, 32, 48.

---

## Component Patterns

### Badges de status
```css
/* .badge-pending */
background-color: #FEE9CC;
color: #8A500A;

/* .badge-received */
background-color: #3D5E3F;
color: #FFFFFF;

/* .badge-overdue */
background-color: #9B1D3E;
color: #FFFFFF;
```

### Borda esquerda de cards (indicador de status)
```
Pendente (em dia):  #d97706
Pendente (atrasado): #9B2040
Recebido:           #5A7B5C
```

### Botão primário (.btn-primary)
```css
background: hsl(var(--primary));   /* ~#7B9AB8 — azul acinzentado */
color: hsl(var(--primary-foreground));  /* branco */
hover: opacity 85%
border-radius: 8px
```

### Botão secundário (.btn-secondary)
```css
background: hsl(var(--secondary));
border: 1px solid hsl(var(--border));
color: hsl(var(--secondary-foreground));
hover: hsl(var(--muted))
```

### Campo de formulário (.field)
```css
background: #FFFFFF;
border: 1px solid #E5E1DB;
border-radius: 8px;
font-size: 16px;   /* evita zoom iOS */
focus border: hsl(var(--ring));
focus shadow: 0 0 0 3px hsl(var(--ring) / 0.2);
```

### Navegação sidebar (item ativo)
```css
backgroundColor: #EEF4FB;
color: #1C4E80;
fontWeight: 600;
border-radius: 8px;
```

### Lógica de atrasado (SIGNATURE)
```ts
// utils.ts → daysOverdue(dataPrevista, status)
// Retorna 0 se não atrasado ou já recebido
// isOverdue = daysOverdue(...) > 0

// Quando isOverdue:
// - Row/card bg: #FAF4F6
// - Left border: #9B2040 (3-4px)
// - Badge: .badge-overdue  ("Atrasado")
// - Célula/campo previsão: color #9B1D3E + "{N}d de atraso"
```

### Chips do calendário (modo Trabalho)
```
Plantão:  background hsl(var(--primary))    color hsl(var(--primary-foreground))
Consulta: background hsl(var(--secondary))  color hsl(var(--secondary-foreground))
```

### Chips do calendário (modo Recebimentos)
```
background: #D1EDD4   color: #2F5E34
```

### Chips do calendário (modo Previsão)
```
Em dia:   background #FEF3C7  color #78350F
Atrasado: background #F5D7DF  color #7A1E35
```

---

## Files

| Arquivo | Papel |
|---|---|
| `src/app/globals.css` | CSS vars, componentes base (.field, .btn-primary, badges) |
| `tailwind.config.ts` | Tokens Tailwind (mapeia CSS vars) |
| `src/app/layout.tsx` | Root layout — sem Google Fonts atualmente |
| `src/lib/utils.ts` | `daysOverdue()`, `formatCurrency()`, `formatDate()` |
| `src/components/Navigation.tsx` | Sidebar + bottom nav (cores hardcoded em #1C4E80) |
| `src/components/dashboard/AtendimentosTable.tsx` | Lógica de atrasado na tabela |
| `src/components/calendar/CalendarClient.tsx` | Lógica de atrasado no calendário |
