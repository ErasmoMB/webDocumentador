# Test Rápido de Memoria - Instrucciones

## Método 1: Memory Snapshots en Chrome DevTools (Más confiable)

1. Abre la app y ve a una sección (ej: Sección 6)
2. Abre **DevTools** (F12)
3. Ve a tab **Memory**
4. Selecciona **Heap snapshots** (no Allocation timeline)
5. Click en **Take snapshot** (guarda como Snapshot 1)
6. **Navega** a otra sección, espera 2 segundos
7. **Navega** a otra sección, espera 2 segundos
8. Repite 5-6 veces (total ~30 segundos de navegaciones)
9. Click en **Take snapshot** de nuevo (guarda como Snapshot 2)
10. En el dropdown arriba, selecciona **Snapshot 2**
11. En el dropdown que dice "All objects", cambia a **Objects allocated between Snapshot 1 and 2**

**Resultado esperado:**
- 🟢 Casi nada new → Memoria bajo control
- 🟠 Algunos arrays/objects → Hay acumulación
- 🔴 Mucho objects Array, HTMLCollection → Problema serio

---

## Método 2: Performance Timeline (Alternativo)

1. Ve a tab **Performance**
2. Click en círculo rojo para **Start recording**
3. **Navega 10 veces** entre secciones (30-40 segundos)
4. Click en cuadrado rojo para **Stop recording**
5. Espera a que se procese el gráfico
6. Mira la línea **JS Heap Size** (azul oscuro)

**Esperado:**
- Línea sube un poco, luego baja → ✅ GC funciona
- Línea siempre sube sin bajar → ❌ Memory leak

---

## Método 3: Console Real-time (Rápido)

Abre Console (F12 → Console) y ejecuta esto:

```javascript
// Toma medida inicial
const inicio = performance.memory.usedJSHeapSize;

// Navega 10 veces con delay
let count = 0;
const test = setInterval(() => {
  if (count >= 10) {
    clearInterval(test);
    const final = performance.memory.usedJSHeapSize;
    const diferencia = (final - inicio) / 1048576;
    console.log(`Diferencia: ${diferencia.toFixed(2)}MB`);
    return;
  }
  
  // Simula navegación (cambia el número de sección)
  document.querySelector('a[href*="section/' + (count % 10 + 1) + '"]')?.click?.();
  count++;
}, 2000); // Navega cada 2 segundos
```

**Resultado:**
- Si diferencia < 50MB → ✅ OK
- Si diferencia > 100MB → ❌ Leak

---

## ¿Cuál usar?

1. **Memory Snapshots** = Más preciso (recomendado)
2. **Performance Timeline** = Visual + fácil
3. **Console** = Más rápido

Intenta con **Memory Snapshots** primero.

