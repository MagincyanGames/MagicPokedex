# Sistema de Componentes - Documentación de Arquitectura

## Índice
1. [Visión General](#visión-general)
2. [Problemas Solucionados](#problemas-solucionados)
3. [Arquitectura Core](#arquitectura-core)
4. [Guía de Uso](#guía-de-uso)
5. [Cómo Extender](#cómo-extender)
6. [Patrones Comunes](#patrones-comunes)

---

## Visión General

Este sistema proporciona un conjunto de componentes React reutilizables (`Button`, `Grid`, `Paper`) con un subsistema de estilos unificado (`CommonStyleProps`) que permite:

- ✅ Soporte de **cualquier unidad CSS** (px, rem, %, em, vh, vw, calc)
- ✅ **Diseño responsivo** nativo (sin breakpoints manuales)
- ✅ **Tipado fuerte** con TypeScript
- ✅ Compatibilidad con Tailwind CSS sin perder funcionalidad
- ✅ Máxima reutilización de código entre componentes

---

## Problemas Solucionados

### Problema 1: Tailwind JIT No Ve Clases Dinámicas

**El Problema:**
Tailwind CSS utiliza un compilador **Just-In-Time (JIT)** que escanea archivos JSX en busca de nombres de clases *completos* y literales. Si generamos clases dinámicamente con template literals (`` `bg-${color}` ``), Tailwind no puede verlas y las **purga del CSS final**.

```tsx
// ❌ INCORRECTO - Tailwind nunca lo verá
const bgColor = "rose-700";
const className = `bg-${bgColor}`; // Tailwind ve: "bg-$", no es una clase válida
```

**La Solución:**
Usar **mapas estáticos** donde cada clase se escribe explícitamente. Tailwind ve cada valor:

```tsx
// ✅ CORRECTO - Tailwind ve todas estas clases
const colorMap = {
  "rose-700": "bg-rose-700",    // Tailwind ve: bg-rose-700 ✓
  "rose-800": "bg-rose-800",    // Tailwind ve: bg-rose-800 ✓
  "white": "bg-white",           // Tailwind ve: bg-white ✓
};
```

### Problema 2: Medidas Arbitrarias No Pueden Ser Dinámicas

**El Problema:**
Los valores arbitrarios de Tailwind (`` w-[90%] ``) también requieren sintaxis literal. No puedes hacer `w-[${width}]` dinámicamente.

**La Solución:**
Usar el objeto `style={{}}` de React para medidas dinámicas, y clases Tailwind solo para valores predefinidos:

```tsx
// Para Tailwind predefinidos: usa clases
if (isStaticToken) {
  classes.push(`w-${width}`);  // width = "full" → "w-full"
} else {
  // Para valores CSS dinámicos: usa inline style
  style.width = width;  // width = "90%" → style.width = "90%"
}
```

---

## Arquitectura Core

### 1. `style-utils.ts` - Núcleo del Sistema

**Componentes Clave:**

#### a) Mapas Estáticos
```typescript
// Estos mapas son los pilares del sistema.
// Tailwind puede ver cada valor escrito literalmente.
export const colorMap: Record<ColorOption, string> = {
  "rose-700": "bg-rose-700",
  "rose-800": "bg-rose-800",
  // ... más colores
};
```

**¿Por qué es importante?** El compilador de Tailwind realiza análisis estático. Ver `"bg-rose-700"` literalmente en el código permite que Tailwind incluya ese CSS. Ver `` `bg-${variable}` `` no funciona.

#### b) Helper: `isArbitrarySize()`
```typescript
export const isArbitrarySize = (val: string | number | undefined) => {
  if (typeof val === "number") return true;
  if (typeof val === "string" && /px|rem|em|vh|vw|%|calc/.test(val)) return true;
  return false;
};
```

**Propósito:** Detectar si un valor debe ir a `style={{}}` (inline) o a `className` (Tailwind).

**Ejemplos:**
- `100` → inline (unknown token, treat as px)
- `"full"` → class (Tailwind token)
- `"90%"` → inline (CSS unit detected)
- `"screen"` → class (Tailwind token)

#### c) Función Core: `useCommonStyles()`
```typescript
export function useCommonStyles(props: CommonStyleProps) {
  const classes: string[] = [];
  const style: CSSProperties = {};

  // Colores: siempre clases (están en mapas)
  if (props.backgroundColor) classes.push(colorMap[props.backgroundColor]);

  // Tamaños: inteligentes (clases si Tailwind token, inline si arbitrario)
  if (props.width) {
    if (isArbitrarySize(props.width)) {
      style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
    } else {
      classes.push(`w-${props.width}`);
    }
  }

  return { className: classes.join(" "), style };
}
```

**Retorna:** Un objeto con dos propiedades:
- `className` - String de clases Tailwind (puede ser vacío)
- `style` - Objeto de CSS inline (puede estar vacío)

**Flujo:**
1. Para cada propiedad: decide si es clase o estilo
2. Acumula clases en array
3. Acumula estilos en objeto
4. Retorna ambos para aplicarlos al elemento

---

### 2. `button.tsx` - Ejemplo de Consumidor

```typescript
export function Button({ 
  backgroundColor = "rose-700",
  padding = 6,
  ...props 
}: ButtonProps) {
  
  // Paso 1: Generar clases + estilos
  const customStyles = useCommonStyles({
    backgroundColor,
    padding,
    // ... más props
  });

  // Paso 2: Definir clases base (siempre predefinidas)
  const baseClasses = "flex transition-all duration-200";

  // Paso 3: Combinar
  const finalClassName = `${baseClasses} ${customStyles.className}`;

  // Paso 4: Aplicar al elemento
  return (
    <button 
      className={finalClassName} 
      style={customStyles.style}
    >
      {children}
    </button>
  );
}
```

**Patrón:**
1. Extraer props
2. Llamar `useCommonStyles()`
3. Definir clases base
4. Combinar
5. Aplicar al elemento

---

### 3. `grid.tsx` - Ejemplo Avanzado

**Desafío especial:** Las columnas (`grid-cols-1`, `grid-cols-3`, etc.) deben ser **estáticas y predefinidas** para que Tailwind las vea.

**Solución:**
```typescript
// Mapa estático: Tailwind ve cada grid-cols-* explícitamente
export const gridColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  // ... hasta 6
};

// Uso en el componente
const baseColsClass = gridColsMap[colsConfig.base] || "";
const mdColsClass = colsConfig.md ? `md:${gridColsMap[colsConfig.md]}` : "";
```

**Resultado:**
- `itemsPerLine={{ base: 1, md: 3 }}` genera: `"grid-cols-1 md:grid-cols-3"`
- Ambas clases son vistas por Tailwind → CSS se incluye ✓

---

## Guía de Uso

### Caso 1: Botón Simple

```tsx
import { Button } from "~/components/button";

export function MyComponent() {
  return (
    <Button 
      backgroundColor="rose-700"
      padding={4}
    >
      Haz clic
    </Button>
  );
}
```

**Resultado:**
- Clase: `"flex rounded-full shadow-xl bg-rose-700 p-4 text-white border border-rose-800"`
- Estilo: `{}`

---

### Caso 2: Botón con Medidas Arbitrarias

```tsx
<Button 
  width="250px"          // ❌ Clase no puede ser dinámico
  padding="1.5rem"       // ❌ Clase no puede ser dinámico
  backgroundColor="rose-700"  // ✅ Clase: bg-rose-700
>
  Botón ancho
</Button>
```

**Resultado:**
- Clase: `"flex rounded-full shadow-xl bg-rose-700 text-white border border-rose-800"`
- Estilo: `{ width: "250px", padding: "1.5rem" }`

**¿Por qué funciona?**
1. `useCommonStyles()` detecta `"250px"` y `"1.5rem"` como arbitrarios
2. Los coloca en el objeto `style` en lugar de intentar crear clases
3. El navegador aplica ambos: clases Tailwind + estilos inline

---

### Caso 3: Grid Responsivo

```tsx
<Grid 
  itemsPerLine={{ base: 1, md: 3 }}  // 1 columna en móvil, 3 en desktop
  width="full"
  backgroundColor="white"
>
  <Item />
  <Item />
  <Item />
</Grid>
```

**Resultado:**
- En móvil: `"grid gap-4 grid-cols-1 bg-white w-full"`
- En desktop (md): `"grid gap-4 grid-cols-1 md:grid-cols-3 bg-white w-full"`

---

## Cómo Extender

### Patrón A: Agregar un Nuevo Color

1. **Actualizar el mapa estático:**
```typescript
// En style-utils.ts
export const colorMap: Record<ColorOption, string> = {
  // ... colores existentes
  "blue-500": "bg-blue-500",  // ← AGREGAR AQUÍ
};
```

2. **Actualizar el tipo:**
```typescript
export type ColorOption = "transparent" | "white" | ... | "blue-500";  // ← AGREGAR
```

3. **Usar:**
```tsx
<Button backgroundColor="blue-500">Botón azul</Button>
```

### Patrón B: Agregar Más Columnas al Grid

```typescript
// En grid.tsx
export const gridColsMap: Record<number, string> = {
  // ... 1 a 6
  7: "grid-cols-7",   // ← AGREGAR
  8: "grid-cols-8",   // ← AGREGAR
};
```

### Patrón C: Crear un Nuevo Componente

**Requisitos:**
1. Aceptar `CommonStyleProps` como prop union
2. Llamar `useCommonStyles()`
3. Combinar clases base + generadas

**Ejemplo: Card Component**

```typescript
import { useCommonStyles, type CommonStyleProps } from "./style-utils";

type CardProps = CommonStyleProps & {
  children: ReactNode;
  className?: string;
};

export function Card({
  children,
  className = "",
  backgroundColor = "white",
  borderRadius = 12,
  padding = 6,
  shadowSize = "md",
  ...commonStyleProps
}: CardProps) {
  const customStyles = useCommonStyles({
    backgroundColor,
    padding,
    ...commonStyleProps
  });

  const baseClasses = "block rounded-lg shadow-md";
  const finalClassName = `${baseClasses} ${customStyles.className} ${className}`.trim();

  return (
    <div className={finalClassName} style={customStyles.style}>
      {children}
    </div>
  );
}
```

---

## Patrones Comunes

### Patrón 1: Composición de Componentes

```tsx
// ✅ Bien: Componente interior hereda estilos
<Card backgroundColor="gray-200" padding={8}>
  <Button>Botón dentro de Card</Button>
</Card>
```

### Patrón 2: Sobrescribir Estilos

```tsx
// ✅ Bien: className sobrescribe
<Button className="mb-4">
  Botón con margen inferior
</Button>
```

### Patrón 3: Medidas Responsivas

```tsx
// Nota: Por ahora NO tenemos soporte responsivo en props individuales
// Pero sí en Grid:
<Grid itemsPerLine={{ base: 1, md: 2, lg: 4 }}>
  {items}
</Grid>
```

### Patrón 4: Valores Calculados

```tsx
// ✅ Bien: usar calc() en estilos arbitrarios
<Button width="calc(100% - 2rem)">
  Ancho menos margen
</Button>
```

---

## Checklist: Antes de Cambiar Algo

- [ ] ¿Agregué nuevos valores a mapas? (colorMap, borderColorMap, gridColsMap)
- [ ] ¿Actualizé los tipos de TypeScript? (ColorOption, BorderOption, etc.)
- [ ] ¿Los nuevos valores son **literales exactos**? (Tailwind necesita verlos)
- [ ] ¿Probé en móvil Y desktop?
- [ ] ¿Probé con medidas arbitrarias (px, rem, %)?
- [ ] ¿El CSS se aplica correctamente? (sin purgar)

---

## Troubleshooting

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Botón sin color | Color no en `colorMap` | Agregarlo al mapa en `style-utils.ts` |
| Grid sin columnas | Número no en `gridColsMap` | Agregarlo al mapa en `grid.tsx` |
| Medida no se aplica | Formato incorrecto (ej. `100` sin px) | Usar `"100px"` o `100` se trata como px |
| Clase Tailwind desaparece | Tailwind no vio la clase (dinámica) | Escribirla literal en el código |
| Estilos en conflicto | Clase Tailwind + estilo inline | El inline siempre gana (CSS cascade) |

---

## Archivo de Referencia Rápida

```typescript
// style-utils.ts
- colorMap: colores de fondo
- textColorMap: colores de texto
- borderColorMap: colores de borde
- isArbitrarySize(): detectar CSS units
- useCommonStyles(): generar clases + estilos
- CommonStyleProps: tipo principal

// button.tsx
- Usa useCommonStyles()
- Flexbox por defecto (centra contenido)
- Soporta colores, tamaños, padding

// grid.tsx
- gridColsMap: mapeo columnas
- Responsive via itemsPerLine prop
- Hereda CommonStyleProps
```
