# Presentar Sentinel en tres minutos

## Preparación

Ejecuta la aplicación, abre Ayuda y usa «Restablecer demo». Debes ver 8 alertas activas, 2 críticas, 12 activos y un índice de riesgo de 51. Todos los datos son ficticios y pertenecen a una instantánea del 1 de octubre de 2026.

## Recorrido

**0:00–0:30 · El problema.** Explica que un analista necesita distinguir rápidamente las prioridades. Muestra los indicadores, la distribución de gravedad y las alertas de mayor prioridad. Diferencia la gravedad del estado de investigación.

**0:30–1:30 · Una investigación.** En Alertas, pulsa «Revisar críticas», abre ALT-1048, consulta las evidencias y el activo afectado. Vuelve a la alerta, asigna a Ana García, cambia el estado a «En investigación» y guarda. Abre de nuevo y resuélvela. El contador crítico pasa de 2 a 1 y la alerta deja de aparecer entre las activas. Recarga para demostrar la persistencia local; entra en Resueltas para recuperarla.

**1:30–2:15 · Contexto del activo.** Abre Inventario, filtra por riesgo alto o crítico y consulta `api-prod-01`. Muestra propietario, vulnerabilidades, agente y alertas relacionadas. Aclara que su puntuación permanece en 92 hasta que se compruebe una remediación. Alterna a tarjetas y muestra la adaptación móvil.

**2:15–3:00 · Calidad y límites.** Exporta los resultados filtrados a CSV. Explica el manejo de carga, errores y guardado, las pruebas y el uso de una API REST de demostración. Cierra indicando qué revisaste o modificaste tú y cómo convertirías la demo en un producto conectado a datos reales.

## Preguntas que conviene poder responder

| Pregunta                          | Idea clave                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| ¿Por qué Next.js?                 | Rutas, layout compartido y endpoints REST en un proyecto fácil de ejecutar.                    |
| ¿Dónde viven los datos?           | Fixtures en servidor; estado compartido en React; cambios de demo en el navegador.             |
| ¿PATCH guarda en servidor?        | No. Valida y devuelve el resultado; la persistencia local es explícita.                        |
| ¿Qué ocurre cuando la API falla?  | Se muestra un error con reintento; un guardado fallido no cambia el estado visible.            |
| ¿Cómo se ordenan las alertas?     | Pendientes antes de resueltas, gravedad descendente y más recientes dentro de cada nivel.      |
| ¿Qué significa 51/100?            | Media redondeada de puntuaciones ficticias; no es una valoración real de una empresa.          |
| ¿Qué aportaste tú?                | Describe solo los cambios, revisión y validación que hayas realizado personalmente.            |
| ¿Cómo usaste IA?                  | Codex ayudó a construir la demo; explica qué comprobaste y qué decisiones puedes defender.     |
| ¿Qué harías con miles de activos? | Filtros/paginación en servidor, caché, validación de contratos y eventualmente virtualización. |

## Antes de enviar

Publica el repositorio con el README y las capturas. Recorre personalmente la demo, ejecuta las comprobaciones y sustituye los campos pendientes de la candidatura. Si publicas una demo, utiliza un host que ejecute Next.js y sus Route Handlers; una exportación estática o GitHub Pages no proporciona estos endpoints.
