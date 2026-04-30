# Guía de Ejemplos Prácticos

## Ejemplos de Uso Real del Sistema

### 1. Página con Layout Responsivo

```tsx
import { Grid } from "~/components/grid";
import { Button } from "~/components/button";
import { Paper } from "~/components/paper";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4">
        {/* Encabezado */}
        <Paper backgroundColor="white" width="full" padding={8}>
          <h1 className="text-4xl font-bold">Mi App</h1>
        </Paper>

        {/* Grid responsivo: 1 columna en móvil, 3 en desktop */}
        <Grid 
          itemsPerLine={{ base: 1, md: 3 }} 
          className="mt-8"
        >
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <Paper key={num} backgroundColor="white" padding={4}>
              <h2>Tarjeta {num}</h2>
            </Paper>
          ))}
        </Grid>

        {/* Botones */}
        <div className="flex gap-4 mt-8">
          <Button backgroundColor="rose-700">Aceptar</Button>
          <Button backgroundColor="gray-200" textColor="gray-900">
            Cancelar
          </Button>
        </div>
      </div>
    </main>
  );
}
```

### 2. Usando Medidas Arbitrarias

```tsx
// Botón con ancho personalizado en rem
<Button 
  width="20rem"              // Medida arbitraria
  padding="1.5rem"           // Medida arbitraria
  backgroundColor="rose-700" // Clase Tailwind
>
  Botón ancho
</Button>

// Grid con gap personalizado
<Grid 
  itemsPerLine={3}
  className="gap-8"  // O: usar Tailwind gap-8, gap-6, etc.
>
  {items}
</Grid>
```

### 3. Composición de Componentes

```tsx
// Card reutilizable
function ProductCard({ product }: { product: Product }) {
  return (
    <Paper 
      backgroundColor="white"
      padding={6}
      className="flex flex-col gap-4"
    >
      <img src={product.image} alt={product.name} />
      <h3 className="text-lg font-bold">{product.name}</h3>
      <p className="text-gray-600">{product.description}</p>
      <Button 
        width="full"              // Ancho completo del Paper
        backgroundColor="rose-700"
      >
        Comprar
      </Button>
    </Paper>
  );
}

// Uso
<Grid itemsPerLine={{ base: 1, md: 2, lg: 4 }}>
  {products.map((p) => (
    <ProductCard key={p.id} product={p} />
  ))}
</Grid>
```

### 4. Estados Condicionales

```tsx
function PokemonCard({ pokemon, isSelected }: Props) {
  return (
    <Paper 
      backgroundColor={isSelected ? "amber-500" : "white"}
      padding={4}
      className={isSelected ? "ring-4 ring-amber-700" : ""}
    >
      <img src={pokemon.image} />
      <Button 
        onClick={() => selectPokemon(pokemon)}
        backgroundColor={isSelected ? "amber-700" : "rose-700"}
      >
        {isSelected ? "Seleccionado" : "Seleccionar"}
      </Button>
    </Paper>
  );
}
```

### 5. Sistema de Temas (Futura Expansión)

```tsx
// Concepto: crear un sistema de temas predefinidos
const themes = {
  primary: {
    backgroundColor: "blue-500",
    textColor: "white",
  },
  danger: {
    backgroundColor: "red-700",
    textColor: "white",
  },
  secondary: {
    backgroundColor: "gray-200",
    textColor: "gray-900",
  },
};

// Uso
<Button {...themes.primary}>Guardar</Button>
<Button {...themes.danger}>Eliminar</Button>
```

---

## Casos de Uso Avanzados

### A. Grid con Altura Fija

```tsx
<Grid 
  itemsPerLine={3}
  height="400px"  // Medida arbitraria
  backgroundColor="white"
>
  {items}
</Grid>
```

**Resultado:**
- Clase: `grid grid-cols-3 bg-white`
- Estilo: `{ height: "400px" }`

### B. Botones en Fila (Flex Row)

```tsx
// Container con flex
<div className="flex gap-4">
  <Button width="full">Opción 1</Button>
  <Button width="full">Opción 2</Button>
  <Button width="full">Opción 3</Button>
</div>
```

### C. Paper Transparente

```tsx
<Paper 
  backgroundColor="transparent"
  padding={0}
>
  {children}
</Paper>
```

---

## Patrones de Extensión Recomendados

### Patrón 1: Crear Componentes Base Específicos

En lugar de pasar props muy complejas, crear componentes especializados:

```typescript
// ❌ Evitar: demasiados props
<Button 
  backgroundColor="white"
  textColor="gray-900"
  borderColor="gray-300"
  padding={3}
>
  Secundario
</Button>

// ✅ Preferir: componente especializado
export function SecondaryButton({ children, ...props }) {
  return (
    <Button 
      backgroundColor="white"
      textColor="gray-900"
      borderColor="gray-300"
      padding={3}
      {...props}
    >
      {children}
    </Button>
  );
}

// Uso
<SecondaryButton>Secundario</SecondaryButton>
```

### Patrón 2: Usar Constantes para Valores Reutilizados

```typescript
// constants.ts
export const GRID_RESPONSIVE = {
  default: { base: 1, md: 2, lg: 3 },
  full: { base: 1, sm: 1 },
  compact: { base: 2, md: 4, lg: 6 },
};

export const BUTTON_SIZES = {
  small: { padding: 2 },
  medium: { padding: 4 },
  large: { padding: 6 },
};

// Uso
<Grid itemsPerLine={GRID_RESPONSIVE.default}>
  {items}
</Grid>

<Button {...BUTTON_SIZES.large}>Grande</Button>
```

### Patrón 3: Utilidades para Colores

```typescript
// colors.ts
export const buttonColors = {
  primary: { backgroundColor: "blue-500" },
  danger: { backgroundColor: "red-700" },
  success: { backgroundColor: "green-600" },
  warning: { backgroundColor: "amber-500" },
};

// Uso
<Button {...buttonColors.danger}>Eliminar</Button>
```

---

## Performance Considerations

### ✅ Bien

```tsx
// Memoizar componentes reutilizados
const CardItem = React.memo(({ item }) => (
  <Paper padding={4}>
    {item.name}
  </Paper>
));
```

### ⚠️ Cuidado

```tsx
// ❌ Crear componentes inline en render
{items.map((item) => (
  <Paper key={item.id}>
    {/* Esto recrea el Paper cada render */}
    {item.content}
  </Paper>
))}
```

---

## Testing

Ejemplo de pruebas unitarias:

```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "~/components/button";

describe("Button", () => {
  it("renders with custom backgroundColor", () => {
    render(<Button backgroundColor="rose-700">Click</Button>);
    const button = screen.getByText("Click");
    expect(button).toHaveClass("bg-rose-700");
  });

  it("applies inline style for arbitrary sizes", () => {
    render(<Button width="250px">Click</Button>);
    const button = screen.getByText("Click");
    expect(button).toHaveStyle({ width: "250px" });
  });

  it("handles disabled state", () => {
    render(<Button disabled>Click</Button>);
    const button = screen.getByText("Click");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-50");
  });
});
```
