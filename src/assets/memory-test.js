/**
 * TEST DE MEMORIA - Ejecutar en Console (F12)
 * 
 * Navega automáticamente entre secciones y muestra memoria en tiempo real
 * 
 * Uso:
 * 1. Abre F12 (DevTools)
 * 2. Ve a Console
 * 3. Copia y pega este código
 * 4. Presiona Enter
 */

(function() {
  const secciones = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let indiceActual = 0;
  let iteraciones = 0;
  const maxIteraciones = 50;
  const intervaloNavegacion = 1000; // 1 segundo entre navegaciones

  console.clear();
  console.log('%c=== TEST DE MEMORIA ===', 'color: #00ff00; font-size: 16px; font-weight: bold;');
  console.log('Navegando entre secciones cada 1 segundo...');
  console.log('Se detendrá después de 50 navegaciones\n');

  const inicio = performance.now();
  
  function obtenerMemoria() {
    if (performance.memory) {
      const mb = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      const mbTotal = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
      return { actual: mb, total: mbTotal };
    }
    return { actual: 'N/A', total: 'N/A' };
  }

  function navegar() {
    iteraciones++;
    const sección = secciones[indiceActual];
    
    // Simular navegación usando router
    const routerEvent = new CustomEvent('navigate-section', { 
      detail: { sectionId: sección } 
    });
    window.dispatchEvent(routerEvent);
    
    const memoria = obtenerMemoria();
    const tiempoDecorrido = ((performance.now() - inicio) / 1000).toFixed(1);
    
    console.log(
      `%c[${iteraciones}/${maxIteraciones}] Sección ${sección} | Memoria: ${memoria.actual}MB / ${memoria.total}MB | Tiempo: ${tiempoDecorrido}s`,
      iteraciones % 2 === 0 ? 'color: #ffaa00;' : 'color: #00aaff;'
    );

    indiceActual = (indiceActual + 1) % secciones.length;

    if (iteraciones < maxIteraciones) {
      setTimeout(navegar, intervaloNavegacion);
    } else {
      finalizarTest();
    }
  }

  function finalizarTest() {
    const memoria = obtenerMemoria();
    const tiempoTotal = ((performance.now() - inicio) / 1000).toFixed(1);
    
    console.log('\n%c=== TEST COMPLETADO ===', 'color: #ff6600; font-size: 14px; font-weight: bold;');
    console.log(`Total navegaciones: ${iteraciones}`);
    console.log(`Tiempo total: ${tiempoTotal}s`);
    console.log(`Memoria final: ${memoria.actual}MB`);
    
    if (memoria.actual < 500) {
      console.log('%c✓ EXCELENTE - Memoria bajo control', 'color: #00ff00; font-weight: bold;');
    } else if (memoria.actual < 1000) {
      console.log('%c⚠ ACEPTABLE - Algo de acumulación', 'color: #ffaa00; font-weight: bold;');
    } else {
      console.log('%c✗ PROBLEMA - Memoria sigue creciendo', 'color: #ff0000; font-weight: bold;');
    }
  }

  navegar();
})();
