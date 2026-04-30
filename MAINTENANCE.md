# Mantenimiento y Extensión del Sistema

## Cómo Mantener el Código Limpio

### ✅ Reglas de Oro

1. **Los mapas estáticos son sagrados** - Nunca generes clases dinámicamente
2. **Las medidas arbitrarias van a `style`** - Nunca a className si contienen px/rem/%
3. **Los tipos siempre sincronizados** - Si añades opción, actualiza el type
4. **Un mapa, un tipo** - Cada mapa tiene su correspondiente type

---

## Agregar Nuevas Características

### Escenario 1: Agregar un Nuevo Color

**Paso 1:** Actualizar el mapa en `style-utils.ts`
```typescript
export const colorMap: Record<ColorOption, string> = {
  // Colores existentes...
  "blue-500": "bg-blue-500",    // ← NUEVO
};
```

**Paso 2:** Actualizar el tipo
```typescript
export type ColorOption = "transparent" | "white" | ... | "blue-500";  // ← NUEVO
```

**Paso 3:** Usar
```tsx
<Button backgroundColor="blue-500">Azul</Button>
```

**Verificación:**
- [ ] El color aparece en ambos mapas (si lo necesita: colorMap, textColorMap, borderColorMap)
- [ ] El type está actualizado
- [ ] El color existe en Tailwind (verificar tailwind.config.js)

---

### Escenario 2: Agregar Soporte para Más Columnas en Grid

**Paso 1:** Actualizar `gridColsMap` en `grid.tsx`
```typescript
export const gridColsMap: Record<number, string> = {
  // Existentes...
  7: "grid-cols-7",   // ← NUEVO
  8: "grid-cols-8",   // ← NUEVO
};
```

**Paso 2:** Usar
```tsx
<Grid itemsPerLine={7}>
  {items}
</Grid>
```

---

### Escenario 3: Crear un Nuevo Componente (ej: Modal)

**Template:**
```typescript
import { useCommonStyles, type CommonStyleProps } from "./style-utils";

type ModalProps = CommonStyleProps & {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export function Modal({
  children,
  isOpen,
  onClose,
  backgroundColor = "white",
  padding = 8,
  ...commonStyleProps
}: ModalProps) {
  if (!isOpen) return null;

  // 1. Usar useCommonStyles
  const customStyles = useCommonStyles({
    backgroundColor,
    padding,
    ...commonStyleProps,
  });

  // 2. Definir clases base
  const baseClasses = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
  const contentClasses = "rounded-lg shadow-xl max-w-md";

  // 3. Combinar
  const finalClassName = `${contentClasses} ${customStyles.className}`;

  // 4. Aplicar al elemento
  return (
    <div className={baseClasses} onClick={onClose}>
      <div 
        className={finalClassName}
        style={customStyles.style}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
```

---

## Debugging

### Problema: Clase Tailwind Desaparece en Producción

**Síntoma:** El botón se ve bien en desarrollo pero sin color en producción.

**Causa:** Tailwind JIT no vio la clase (probablemente dinámica).

**Solución:**
1. Verificar en `style-utils.ts` que el color está en `colorMap`
2. Verificar que el color se escribe literalmente en el mapa
3. Reconstruir (a veces Tailwind cache viejo)

```bash
# Limpiar caché de Tailwind
rm -rf node_modules/.cache
npm run build
```

---

### Problema: Medida No Se Aplica

**Síntoma:** `width="250px"` no funciona.

**Diagnóstico:**

1. Abrir DevTools → Inspeccionar elemento
2. Ver si tiene `style="width: 250px"` (debe estar en Styles)
3. Si NO está:
   - Verificar que `isArbitrarySize()` detecta "250px"
   - Verificar que llega a `style` en `useCommonStyles()`

**Verificación rápida:**
```tsx
<Button width="250px" className="debug">Click</Button>
```

Luego en DevTools:
```
<button class="flex ... debug" style="width: 250px">Click</button>
```

---

### Problema: Grid No Responde

**Síntoma:** `itemsPerLine={{ base: 1, md: 3 }}` no cambia columnas.

**Diagnóstico:**

1. Verificar que `breakpoint: md` corresponde a 768px en Tailwind
2. Verificar que el número está en `gridColsMap`
3. Inspeccionar elemento → debe tener clases: `grid-cols-1 md:grid-cols-3`

**Checklist:**
- [ ] Número existe en `gridColsMap`
- [ ] Viewport es >= 768px
- [ ] Clase generada es exacta: `md:grid-cols-3`
- [ ] No hay override en CSS

---

## Testing del Sistema

### Test 1: Verificar Mapas

```typescript
// Verificar que todos los mapas tienen valores válidos
const testMaps = () => {
  Object.values(colorMap).forEach(cls => {
    // Debe empezar con "bg-"
    console.assert(cls.startsWith("bg-"), `Invalid: ${cls}`);
  });
};
```

### Test 2: Verificar Componentes

```typescript
// Button con color debe tener clase correcta
const testButtonColor = () => {
  const { container } = render(
    <Button backgroundColor="rose-700">Test</Button>
  );
  expect(container.querySelector("button")).toHaveClass("bg-rose-700");
};

// Button con medida arbitraria debe tener estilo inline
const testButtonArbitrarySize = () => {
  const { container } = render(
    <Button width="250px">Test</Button>
  );
  const style = container.querySelector("button")?.getAttribute("style");
  expect(style).toContain("width: 250px");
};
```

---

## Migración Segura

Si necesitas cambiar el sistema:

### Opción 1: Versión con Breaking Changes
1. Crear rama `refactor/new-system`
2. Implementar cambios
3. Actualizar todos los componentes que usan el sistema
4. Merge cuando esté completo

### Opción 2: Versión Backwards Compatible
1. Mantener funcionalidad antigua
2. Agregar nueva funcionalidad
3. Deprecar (marcar como obsoleto pero funcional)
4. Documentar ruta de migración

**Ejemplo deprecation:**
```typescript
export function Button({
  ...
  borderRadius = "full",  // Heredado
  // borderRadius = "50", // Deprecado: usar "full"
}: ButtonProps) {
  // Compatibilidad
  const radius = borderRadius === 50 ? "full" : borderRadius;
  // ...
}
```

---

## Performance Tips

### 1. Memoizar Componentes Reutilizados

```tsx
export const CardItem = React.memo(function CardItem({ item }: Props) {
  return <Paper padding={4}>{item.name}</Paper>;
});
```

### 2. Evitar Crear Funciones en Render

```tsx
// ❌ Crea nueva función cada render
<Button onClick={() => alert("hi")}>Click</Button>

// ✅ Usar useCallback
const handleClick = useCallback(() => alert("hi"), []);
<Button onClick={handleClick}>Click</Button>
```

### 3. Evitar Props Innecesarios

```tsx
// ❌ Pasa props que no cambian
{items.map((item) => (
  <Card key={item.id} padding={8} />
))}

// ✅ Definir fuera de map
const DEFAULT_PADDING = 8;
{items.map((item) => (
  <Card key={item.id} padding={DEFAULT_PADDING} />
))}
```

---

## Checklist de Calidad

Antes de mergear cambios:

- [ ] Los tipos están actualizados (TypeScript no tiene errores)
- [ ] Los mapas incluyen nuevas opciones
- [ ] El CSS se genera en build (no purga)
- [ ] Funciona en móvil (640px viewport)
- [ ] Funciona en desktop (1920px viewport)
- [ ] No hay estilos en conflicto
- [ ] Documented en COMPONENT_SYSTEM.md si es relevante
- [ ] Incluidas en EXAMPLES.md si es frecuente
- [ ] Updated API_REFERENCE.md si cambian tipos públicos

---

## Futuros Mejoras Potenciales

1. **Variables CSS Personalizadas**
   ```tsx
   <Button style={{"--primary": "blue"}}>Click</Button>
   ```

2. **Dark Mode**
   ```tsx
   <Button darkMode={{ bg: "slate-900", text: "white" }}>
   ```

3. **Animaciones**
   ```tsx
   <Button animation="pulse">Click</Button>
   ```

4. **Variantes Predefinidas**
   ```tsx
   <Button variant="primary" size="large">
   ```

5. **Sistema de Temas Global**
   ```tsx
   <ThemeProvider theme="dark">
     <App />
   </ThemeProvider>
   ```

---

## Referencias Externas

- Tailwind CSS: https://tailwindcss.com/docs
- React Docs: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs/
