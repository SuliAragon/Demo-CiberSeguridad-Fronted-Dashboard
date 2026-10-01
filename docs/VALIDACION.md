# Validación de la entrega

Comprobado localmente el **1 de octubre de 2026**.

| Comprobación                | Resultado                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ESLint                      | Sin errores ni advertencias                                                                                   |
| TypeScript                  | Sin errores                                                                                                   |
| Vitest                      | 5 pruebas aprobadas                                                                                           |
| Formato                     | Archivos conformes con Prettier                                                                               |
| Compilación de producción   | Correcta                                                                                                      |
| Playwright sobre producción | 16 pruebas aprobadas: 8 en escritorio y 8 en móvil emulado                                                    |
| axe                         | Sin infracciones detectadas por las reglas WCAG A/AA seleccionadas en las tres páginas y el detalle de alerta |

Los flujos verificados incluyen asignación, investigación y resolución; persistencia tras recargar; búsqueda, filtros, orden y paginación; exportación de las filas filtradas; navegación entre alerta y activo; menú móvil, ayuda y restablecimiento; reintento ante fallos de API; guardados fallidos que conservan el estado anterior; y errores HTTP de entrada inválida o identificador inexistente.

Se inspeccionaron las capturas de la vista general, alertas, inventario y detalle, en escritorio y móvil. Las tablas se desplazan dentro de su contenedor sin ampliar la página. El inventario también puede presentarse en tarjetas.

Las pruebas móviles usan Chromium con emulación de iPhone, no un dispositivo físico ni Safari. La auditoría automática es parcial y no equivale a una certificación de accesibilidad. La configuración de GitHub Actions está incluida; su ejecución remota requiere subir el repositorio.
