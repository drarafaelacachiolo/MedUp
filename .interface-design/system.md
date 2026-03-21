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

### Brand — Vinho
```
--wine:       #5B2D45   ← primário (botões, logo, destaque)
--wine-mid:   #7A3D5C   ← hover de botões primários
--wine-light: #9A5070   ← focus rings, acentos leves
```

### Accent — Malva e Blush
```
--mauve:       #B5747D   ← acento secundário
--blush:       #D8B8B0   ← bordas suaves, backgrounds de hover
--blush-light: #EDD8D3   ← tints muito sutis
```

### Semântico — Pendente (Âmbar)
```
--amber:       #C4752A
--amber-light: #D98A3C
badge-pending bg:  #FEE9CC  color: #8A500A
```

### Semântico — Recebido (Sálvia)
```
--forest:       #5A7A5C
--forest-light: #7A9E7C
badge-received bg: #E0EDE2  color: #3D5E3F
```

### Semântico — Atrasado (Rosa-Vinho) ← SIGNATURE
```
--overdue:     #9B1D3E
--overdue-mid: #C0405E
badge-overdue bg:  #F8E5EB  color: #9B1D3E
card bg atrasado:  #FAF4F6
```

### Superfícies
```
--surface-base:  #F7EFE9   ← base da página (creme aquecido)
--surface-card:  #FDFAF8   ← cards (quase branco, quente)
--surface-input: #F2E8E3   ← fundo de inputs (levemente mais escuro)
```

### Texto
```
--ink:       #26101C   ← texto principal (quase preto vinhoso)
--ink-mid:   #5C3749   ← texto secundário
--ink-light: #8B6575   ← labels, metadados
--ink-faint: #B8909F   ← placeholders, desabilitados
```

### Bordas (rgba derivado do vinho)
```
--border:        rgba(91, 45, 69, 0.12)
--border-mid:    rgba(91, 45, 69, 0.22)
--border-strong: rgba(91, 45, 69, 0.40)
```

---

## Typography

| Role | Font | Weights |
|---|---|---|
| Display / Títulos | Cormorant Garamond | 400, 500, 600, 700 |
| Body / UI | Jost | 300, 400, 500, 600 |
| Números / Tabela | Jost tabular-nums | 400, 600 |

**CSS vars:**
```
--font-display: (next/font/google Cormorant_Garamond)
--font-sans:    (next/font/google Jost)
```

**Usage:**
- `h1`, `h2`, `h3`, `.section-title` → `font-family: var(--font-display)`
- Corpo, labels, botões, inputs → `font-family: var(--font-sans)`
- Valores monetários → tabular-nums em Jost

---

## Depth Strategy

**Border-only** — limpo, adequado para ferramenta pessoal.

- Não usar sombras decorativas
- Elevation via cor de superfície (surface-card é levemente mais claro que surface-base)
- Cards: `border: 1px solid var(--border)` + `background: var(--surface-card)`
- Bordas são rgba, não hex — se misturam sutilmente com o fundo

---

## Spacing Base Unit

`4px` (Tailwind padrão). Escala: 4, 8, 12, 16, 20, 24, 32, 48.

---

## Component Patterns

### Badge de tipo de atendimento
```
Plantão: bg #F3ECF0  color #5B2D45
Consulta: bg #F0EBF5  color #7A3D5C
```

### Borda esquerda de cards (indicador de status)
```
Pendente (em dia): var(--amber)
Pendente (atrasado): var(--overdue)
Recebido: var(--forest)
```

### Botão primário
```css
background: var(--wine)
hover: var(--wine-mid)
font: var(--font-sans), letter-spacing: 0.01em
```

### Campo de formulário
```css
background: var(--surface-input)
border: var(--border-mid)
focus border: var(--wine-light)
focus shadow: rgba(154, 80, 112, 0.15)
```

### Abas de tipo (Todos / Plantões / Consultas)
```
Active: background var(--wine), color white
Inactive: transparent, color var(--ink-mid)
Container border: var(--border-mid)
```

### Lógica de atrasado (SIGNATURE)
```ts
// utils.ts → daysOverdue(dataPrevista, status)
// Retorna 0 se não atrasado ou já recebido
// isOverdue = daysOverdue(...) > 0

// Quando isOverdue:
// - Row bg: #FAF4F6
// - Left border: var(--overdue)
// - Badge: .badge-overdue ("Atrasado")
// - Célula previsão: color var(--overdue) + "{N}d de atraso"
```

---

## Files

| Arquivo | Papel |
|---|---|
| `src/app/globals.css` | CSS vars, componentes base |
| `tailwind.config.ts` | Tokens de cor e fonte |
| `src/app/layout.tsx` | Google Fonts (next/font) |
| `src/lib/utils.ts` | `daysOverdue()` |
| `src/components/dashboard/AtendimentosTable.tsx` | Lógica de atrasado |
