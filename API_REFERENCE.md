# API Reference Rápida

## CommonStyleProps

Type union para propiedades de estilo compartidas entre componentes.

```typescript
type CommonStyleProps = {
  width?: SizeValue;              // Número, "full", "screen", o unidad CSS
  height?: SizeValue;             // Igual a width
  backgroundColor?: ColorOption;  // Color de fondo
  textColor?: TextColorOption;    // Color de texto
  borderColor?: ColorOption;      // Color del borde
  padding?: number | string;      // Espaciado interno
  justifyContent?: JustifyContent; // Alineación horizontal (flexbox)
  alignItems?: AlignItems;        // Alineación vertical (flexbox)
};
```

### Tipos Válidos

#### SizeValue
```typescript
// Números (se convierten a px)
width={100}           // → width: 100px
height={50}

// Tokens de Tailwind
width="full"          // → w-full
width="screen"        // → w-screen
width="auto"          // → w-auto

// Unidades CSS
width="90%"           // → width: 90%
width="2rem"          // → width: 2rem
width="calc(100% - 2rem)"  // → width: calc(100% - 2rem)
```

#### ColorOption
```typescript
"transparent" | "white" | "gray-200" | "red-700" | "red-800" | 
"indigo-900" | "amber-500" | "rose-700" | "rose-800"
```

#### TextColorOption
```typescript
"white" | "gray-900" | "gray-700" | "amber-100" | "amber-300" | "transparent"
```

#### JustifyContent
```typescript
"start" | "end" | "center" | "between" | "around" | "evenly"
// Mapea a: justify-start, justify-end, justify-center, justify-between, etc.
```

#### AlignItems
```typescript
"start" | "end" | "center" | "baseline" | "stretch"
// Mapea a: items-start, items-end, items-center, items-baseline, items-stretch
```

---

## Button

```typescript
function Button({
  children: ReactNode,
  className?: string,
  disabled?: boolean,
  width?: SizeValue,
  height?: SizeValue,
  backgroundColor?: ColorOption,     // default: "rose-700"
  textColor?: TextColorOption,        // default: "white"
  borderColor?: ColorOption,          // default: "rose-800"
  padding?: number | string,          // default: 6 (1.5rem)
  justifyContent?: JustifyContent,    // default: "center"
  alignItems?: AlignItems,            // default: "center"
  style?: CSSProperties,
  ...buttonHTMLAttributes
}: ButtonProps): JSX.Element
```

### Comportamiento
- Automáticamente `display: flex` para centrar contenido
- Sombra y rounded corners por defecto
- Smooth transition en hover
- Opacity 50% cuando está disabled

### Ejemplos

```tsx
// Básico
<Button>Enviar</Button>

// Con colores personalizados
<Button 
  backgroundColor="blue-500" 
  textColor="white"
>
  Guardar
</Button>

// Con tamaño personalizado
<Button width="full" padding="1rem">
  Ancho completo
</Button>

// Disabled
<Button disabled>No disponible</Button>
```

---

## Grid

```typescript
function Grid({
  children: ReactNode,
  className?: string,
  itemsPerLine?: ResponsiveValue<number>,     // default: { base: 1, md: 3 }
  width?: SizeValue,
  height?: SizeValue,
  backgroundColor?: ColorOption,
  textColor?: TextColorOption,
  borderColor?: ColorOption,
  padding?: number | string,
  justifyContent?: JustifyContent,
  alignItems?: AlignItems,
  style?: CSSProperties,
}: GridProps): JSX.Element
```

### Comportamiento
- Usa CSS Grid para layouts
- Gap por defecto es 4 (1rem)
- Responsive: `itemsPerLine={{ base: 1, md: 3 }}` → 1 columna móvil, 3 desktop

### Ejemplos

```tsx
// Básico (3 columnas)
<Grid>
  <Item />
  <Item />
  <Item />
</Grid>

// Responsivo: 1 móvil, 2 tablet, 3 desktop
<Grid itemsPerLine={{ base: 1, md: 2, lg: 3 }}>
  {items}
</Grid>

// Con altura fija
<Grid height="500px" itemsPerLine={2}>
  {items}
</Grid>

// Con fondo
<Grid 
  itemsPerLine={4}
  backgroundColor="white"
  padding={6}
>
  {items}
</Grid>
```

### ResponsiveValue<number>

```typescript
// Forma larga (más control)
itemsPerLine={{ 
  base: 1,      // Móvil por defecto
  sm: 1,        // Small (640px+)
  md: 2,        // Medium (768px+)
  lg: 3,        // Large (1024px+)
  xl: 4,        // Extra large (1280px+)
}}

// Forma corta (solo base)
itemsPerLine={3}  // Siempre 3 columnas
```

---

## Paper

```typescript
function Paper({
  children: ReactNode,
  className?: string,
  width?: SizeValue,
  height?: SizeValue,
  backgroundColor?: ColorOption,     // default: "white"
  borderColor?: ColorOption,          // default: "gray-200"
  borderRadius?: number | string,     // default: 30
  shadowSize?: ShadowSize,            // default: "xl"
  padding?: number | string,
}: PaperProps): JSX.Element
```

### Comportamiento
- Contenedor visual con sombra y border
- Padding por defecto: 8 (2rem)
- Border radius por defecto: 30px
- Sombra extra large por defecto

### Ejemplos

```tsx
// Básico
<Paper>
  Contenido
</Paper>

// Transparente
<Paper backgroundColor="transparent" padding={0}>
  {children}
</Paper>

// Card pequeña
<Paper padding={3} shadowSize="md">
  Contenido
</Paper>
```

---

## useCommonStyles

Hook interno (no usar directamente en componentes normales).

```typescript
function useCommonStyles(props: CommonStyleProps): {
  className: string;    // Clases Tailwind concatenadas
  style: CSSProperties; // Estilos inline para medidas arbitrarias
}
```

### Qué hace
1. Valida cada propiedad
2. Si es predefinida (ej. color) → usa clase Tailwind
3. Si es arbitraria (ej. px, rem, %) → usa inline style
4. Retorna ambos para aplicar al elemento

---

## Constantes y Mapas

### colorMap
```typescript
const colorMap = {
  "rose-700": "bg-rose-700",
  "rose-800": "bg-rose-800",
  // ... más colores
};
```

### gridColsMap
```typescript
const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  // ... hasta 6
};
```

---

## Tipado TypeScript

Todos los componentes son fully typed. Puedes usarlos con autocompletion:

```typescript
import type { CommonStyleProps } from "~/components/style-utils";

// Usar en tus propios componentes
type MyComponentProps = CommonStyleProps & {
  customProp?: string;
};
```

---

## Troubleshooting Rápido

| Error | Solución |
|-------|----------|
| Color no existe | Agregarlo a `colorMap` en style-utils.ts |
| Grid sin columnas | Número no en `gridColsMap`, agregarlo |
| Estilos desaparecen | Usar clase Tailwind, no dynamic string |
| Medida no funciona | Asegurar formato correcto (px, rem, %) |
| Conflicto de estilos | Inline style tiene prioridad, usar className |

---

## Cheatsheet

```tsx
// Button
<Button width="200px" padding="1rem">Click</Button>

// Grid responsivo
<Grid itemsPerLine={{ base: 1, md: 3 }}>
  {items}
</Grid>

// Colores
backgroundColor="rose-700"
textColor="white"
borderColor="gray-200"

// Medidas
width="full"        // Tailwind
width="250px"       // Inline
width="calc(100% - 2rem)"  // Inline con calc

// Alineación
justifyContent="center"
alignItems="center"
```
