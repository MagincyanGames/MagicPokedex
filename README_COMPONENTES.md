# MagicPokedex - Documentación General del Sistema de Componentes

## 📚 Índice de Documentación

Hay 4 documentos principales para entender y trabajar con el sistema:

1. **[API_REFERENCE.md](./API_REFERENCE.md)** - Referencia rápida de todos los componentes y tipos
   - Firmas de funciones
   - Props disponibles
   - Ejemplos básicos
   - Cheatsheet

2. **[COMPONENT_SYSTEM.md](./COMPONENT_SYSTEM.md)** - Arquitectura profunda del sistema
   - Por qué funciona así (problemas de Tailwind JIT)
   - Cómo se diseñó la solución
   - Patrones de uso
   - Troubleshooting detallado

3. **[EXAMPLES.md](./EXAMPLES.md)** - Ejemplos de código real
   - Layouts completos
   - Casos de uso avanzados
   - Patrones de extensión
   - Performance tips

4. **[MAINTENANCE.md](./MAINTENANCE.md)** - Guía de mantenimiento y extensión
   - Cómo agregar nuevas características
   - Debugging de problemas
   - Testing
   - Migración segura
   - Ideas de mejoras futuras

---

## 🎯 Quick Start - ¿Dónde Empezar?

### Si eres nuevo en el sistema:
1. Lee la sección "Visión General" de [COMPONENT_SYSTEM.md](./COMPONENT_SYSTEM.md)
2. Busca tu caso de uso en [EXAMPLES.md](./EXAMPLES.md)
3. Consulta la API en [API_REFERENCE.md](./API_REFERENCE.md)

### Si quieres agregar una feature:
1. Lee [MAINTENANCE.md](./MAINTENANCE.md) - Sección "Agregar Nuevas Características"
2. Verifica el ejemplo correspondiente
3. Sigue el checklist de calidad

### Si tienes un problema:
1. Consulta [COMPONENT_SYSTEM.md](./COMPONENT_SYSTEM.md) - Sección "Troubleshooting"
2. Si no está, lee [MAINTENANCE.md](./MAINTENANCE.md) - Sección "Debugging"

---

## 🏗️ Estructura del Proyecto

```
app/
├── components/
│   ├── style-utils.ts     ← Núcleo del sistema (mapas + useCommonStyles)
│   ├── button.tsx          ← Consumidor del sistema
│   ├── grid.tsx            ← Consumidor avanzado
│   ├── paper.tsx           ← Consumidor existente
│   └── ...otros            ← Otros componentes
│
└── routes/
    ├── home.tsx            ← Ejemplo: usando componentes
    ├── dex.tsx             ← Ejemplo: grid con Paper y Button
    └── ...otros

COMPONENT_SYSTEM.md        ← Esta documentación
API_REFERENCE.md           ← Referencia rápida
EXAMPLES.md                ← Ejemplos de código
MAINTENANCE.md             ← Guía de extensión
README.md                  ← General del proyecto
```

---

## 📖 Glosario de Términos

| Término | Significado |
|---------|------------|
| **Tailwind JIT** | Just-In-Time compiler. Analiza código JSX estáticamente para generar CSS |
| **Static Map** | Objeto con claves y valores que el compilador puede ver literalmente |
| **Arbitrary Value** | CSS dinámico en runtime (px, rem, %, calc) que no puede ser estático |
| **CommonStyleProps** | Objeto de configuración compartido entre Button, Grid, Paper |
| **Responsive Value** | Objeto con breakpoints: `{ base: val, md: val, lg: val }` |
| **Breakpoint** | Punto de quiebre de responsive: base (móvil), sm, md, lg, xl |
| **Inline Style** | CSS aplicado directamente al elemento con `style={{}}` |
| **Class Name** | Clase CSS de Tailwind aplicada al elemento con `className` |

---

## 🔄 Flujo de Datos Típico

```
Props de Componente
    ↓
useCommonStyles()
    ↓
    ├─ Si es valor predefinido (color, token) → className (Tailwind)
    └─ Si es valor arbitrario (px, rem, %) → style (inline)
    ↓
Retorna: { className: string, style: CSSProperties }
    ↓
Aplicar al elemento:
    <button className={className} style={style}>
```

---

## ✅ Checklist de Comprensión

Si entiendes todo esto, estás listo:

- [ ] Sé por qué Tailwind JIT necesita valores literales
- [ ] Sé qué diferencia hay entre `"full"` y `"100%"`
- [ ] Puedo usar Button, Grid y Paper con confianza
- [ ] Puedo agregar un nuevo color sin romper nada
- [ ] Entiendo qué va a `className` y qué a `style`
- [ ] Puedo crear un nuevo componente siguiendo el patrón
- [ ] Puedo debuggear problemas de estilo
- [ ] Sé dónde buscar cada cosa en la documentación

---

## 🆘 Problemas Comunes y Soluciones Rápidas

### Problema: Estilos Desaparecen en Build

```bash
# Probable: Tailwind no ve las clases
# Solución: Verificar que están en mapas estáticos

# Verificar style-utils.ts
export const colorMap = {
  "rose-700": "bg-rose-700",  // Debe estar LITERAL aquí
};
```

### Problema: Medida No Funciona

```tsx
// ❌ INCORRECTO
<Button width={250}>Text</Button>  // Sin unidad, ambiguo

// ✅ CORRECTO
<Button width="250px">Text</Button>
<Button width={250}>Text</Button>  // Se convierte a 250px automáticamente
```

### Problema: Color Personalizado No Aparece

```tsx
// ❌ INCORRECTO - No en mapa
<Button backgroundColor="my-custom-color">

// ✅ CORRECTO - Está en mapa
<Button backgroundColor="rose-700">

// Si necesitas custom: Agregarlo al mapa primero
```

---

## 📝 Comentarios en el Código

Cada archivo tiene comentarios JSDoc que explican:

### `style-utils.ts`
- Qué es `isArbitrarySize()` y por qué existe
- Cómo `useCommonStyles()` decide entre clase y estilo
- Por qué los mapas son estáticos

### `button.tsx`
- Comportamiento por defecto (flex, centered)
- Qué hace el disabled state
- Cómo se combinan las clases

### `grid.tsx`
- Cómo funciona el mapping de `itemsPerLine`
- Por qué existe `gridColsMap`
- Cómo parsear responsive values

---

## 🚀 Próximos Pasos

1. **Estabilizar:** Asegurar que todo funciona en prod
2. **Documentar Casos Reales:** Agregar ejemplos de tu app
3. **Extender:** Agregar más componentes (Modal, Tabs, etc.)
4. **Optimizar:** Profiling de performance
5. **Automatizar:** Scripts para agregar colores/componentes

---

## 📞 Contacto / Notas

Este sistema fue diseñado para ser:
- ✅ **Extensible** - Fácil de agregar características
- ✅ **Tipo-Seguro** - TypeScript valida todo
- ✅ **Reutilizable** - Componentes comparten CommonStyleProps
- ✅ **Eficiente** - Usa Tailwind JIT correctamente
- ✅ **Documentado** - Código comentado + 4 documentos

Si encuentras un problema o necesitas mejorar algo, consulta [MAINTENANCE.md](./MAINTENANCE.md).

---

**Última actualización:** 30 Abril 2026
**Versión del Sistema:** 1.0 (Stable)
