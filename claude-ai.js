// Módulo de integración con Claude API (Anthropic)
// Funciones de IA para análisis, estrategia y redacción

const ClaudeAI = {
    // Configuración base
    apiKey: CONFIG.CLAUDE_API_KEY,
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',

    // Verificar si la API está configurada
    isConfigured() {
        return this.apiKey && this.apiKey !== 'TU_API_KEY_DE_CLAUDE';
    },

    // Llamada base a la API
    async callAPI(systemPrompt, userPrompt, maxTokens = 4000) {
        if (!this.isConfigured()) {
            throw new Error('Claude API no configurada. Agrega tu API Key en config.js');
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: maxTokens,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: userPrompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error en la API de Claude');
            }

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('Error llamando a Claude API:', error);
            throw error;
        }
    },

    // Análisis de expediente PDF
    async analizarExpediente(textoExpediente, contextoAdicional = '') {
        const systemPrompt = `Eres un asistente legal especializado en derecho argentino. Tu tarea es analizar expedientes judiciales y proporcionar un análisis detallado y profesional.

Legislación aplicable:
- Código Civil y Comercial de la Nación (Ley 26.994)
- Ley de Contrato de Trabajo (Ley 20.744)
- Ley de Riesgos del Trabajo (Ley 24.557)
- Código Procesal Civil y Comercial de la Nación

NO incluyas jurisprudencia específica de la CSJN ni referencias a fallos concretos.
Proporciona un análisis objetivo basado en la normativa vigente.`;

        const userPrompt = `Analiza el siguiente expediente judicial y proporciona:

1. **Resumen ejecutivo**: Síntesis de los hechos principales
2. **Identificación de partes**: Actor, demandado, terceros involucrados
3. **Tipo de proceso**: Clasificación del expediente
4. **Hechos relevantes**: Cronología y eventos clave
5. **Cuestiones jurídicas**: Problemas legales identificados
6. **Normativa aplicable**: Leyes y artículos relevantes
7. **Etapa procesal actual**: En qué fase se encuentra
8. **Elementos probatorios**: Pruebas presentadas o necesarias
9. **Puntos críticos**: Aspectos que requieren atención especial
10. **Recomendaciones iniciales**: Primeros pasos sugeridos

${contextoAdicional ? `Contexto adicional: ${contextoAdicional}\n\n` : ''}

EXPEDIENTE:
${textoExpediente}

IMPORTANTE: Este es un BORRADOR que debe ser revisado por el profesional. Proporciona un análisis objetivo y técnico.`;

        return await this.callAPI(systemPrompt, userPrompt, 4000);
    },

    // Generar estrategia procesal
    async generarEstrategia(expediente, tipoEstrategia, contexto = '') {
        const systemPrompt = `Eres un estratega legal especializado en derecho argentino. Generas estrategias procesales detalladas basadas en la legislación vigente.

Tu enfoque debe ser:
- Pragmático y realista
- Basado en la normativa argentina
- Orientado a resultados concretos
- Sin mencionar jurisprudencia específica

Legislación de referencia:
- CCyCN Ley 26.994
- LCT Ley 20.744
- LRT Ley 24.557
- CPCCN y códigos procesales provinciales`;

        const userPrompt = `Genera una estrategia procesal ${tipoEstrategia} para el siguiente caso:

EXPEDIENTE:
${JSON.stringify(expediente, null, 2)}

${contexto ? `CONTEXTO ADICIONAL:\n${contexto}\n\n` : ''}

La estrategia debe incluir:

1. **Análisis de la situación actual**
   - Fortalezas de la posición
   - Debilidades a mitigar
   - Oportunidades procesales
   - Riesgos identificados

2. **Objetivo estratégico principal**
   - Meta concreta del proceso
   - Resultados esperados
   - Criterios de éxito

3. **Plan de acción**
   - Pasos inmediatos
   - Acciones de mediano plazo
   - Preparación de largo plazo

4. **Líneas argumentales**
   - Fundamentos de hecho
   - Fundamentos de derecho
   - Base normativa

5. **Estrategia probatoria**
   - Pruebas a ofrecer
   - Pruebas a objetar
   - Diligencias necesarias

6. **Aspectos tácticos**
   - Timing de presentaciones
   - Negociación vs litigio
   - Gestiones extrajudiciales

7. **Riesgos y contingencias**
   - Escenarios adversos
   - Planes B y C
   - Mitigación de riesgos

8. **Recursos estimados**
   - Tiempo proyectado
   - Complejidad del caso
   - Puntos de revisión

IMPORTANTE: Esta es una propuesta que debe ser adaptada por el profesional según el caso concreto.`;

        return await this.callAPI(systemPrompt, userPrompt, 4000);
    },

    // Redactar escrito judicial
    async redactarEscrito(tipoEscrito, detalles, expediente = null) {
        const tipoInfo = TIPOS_ESCRITOS[tipoEscrito] || TIPOS_ESCRITOS.demanda;
        
        const systemPrompt = `Eres un redactor legal especializado en escritos judiciales argentinos. Redactas con precisión técnica y claridad.

Estilo de redacción:
- Formal y profesional
- Claro y conciso
- Técnicamente preciso
- Respetuoso con el tribunal

Base legal: Legislación argentina vigente (CCyCN, LCT, códigos procesales)
NO incluyas jurisprudencia específica ni referencias a fallos concretos.

Estructura del ${tipoInfo.nombre}:
${tipoInfo.estructura.map(s => `- ${s}`).join('\n')}`;

        const userPrompt = `Redacta un ${tipoInfo.nombre} con la siguiente información:

DETALLES:
${detalles}

${expediente ? `\nEXPEDIENTE RELACIONADO:\n${JSON.stringify(expediente, null, 2)}\n` : ''}

REQUISITOS:
1. Incluye todos los elementos de la estructura requerida
2. Usa lenguaje jurídico apropiado pero claro
3. Cita artículos de ley relevantes
4. Sigue el formato estándar de escritos argentinos
5. Incluye un petitorio claro y específico

IMPORTANTE: Este es un BORRADOR que debe ser revisado, adaptado y firmado por el abogado profesional antes de su presentación.

Al final del documento, incluye:
${DISCLAIMER_LEGAL}`;

        return await this.callAPI(systemPrompt, userPrompt, 4000);
    },

    // Redactar carta documento
    async redactarCartaDocumento(destinatario, domicilio, motivo, contenido) {
        const systemPrompt = `Eres un redactor legal especializado en cartas documento bajo la legislación argentina.

Estructura de una carta documento:
1. Datos del destinatario
2. Exposición de los hechos
3. Intimación o requerimiento
4. Base legal
5. Consecuencias del incumplimiento
6. Firma

Estilo: Formal, claro, preciso y contundente.`;

        const userPrompt = `Redacta una carta documento con los siguientes datos:

DESTINATARIO: ${destinatario}
DOMICILIO: ${domicilio}
MOTIVO: ${motivo}

CONTENIDO:
${contenido}

REQUISITOS:
1. Formato profesional de carta documento
2. Exposición clara de los hechos
3. Intimación específica
4. Plazo razonable para cumplir
5. Consecuencias jurídicas del incumplimiento
6. Base legal argentina aplicable

IMPORTANTE: Este es un BORRADOR. Debe ser revisado por el abogado antes del envío.

${DISCLAIMER_LEGAL}`;

        return await this.callAPI(systemPrompt, userPrompt, 3000);
    },

    // Redactar contrato
    async redactarContrato(tipoContrato, partes, clausulas) {
        const contratoInfo = TIPOS_CONTRATOS[tipoContrato] || TIPOS_CONTRATOS.compraventa;
        
        const systemPrompt = `Eres un redactor legal especializado en contratos bajo el Código Civil y Comercial argentino (Ley 26.994).

Tipo de contrato: ${contratoInfo.nombre}
Base legal: ${contratoInfo.base_legal}

Elementos esenciales:
${contratoInfo.elementos.map(e => `- ${e}`).join('\n')}

Estilo de redacción:
- Lenguaje jurídico claro
- Cláusulas específicas y completas
- Protección equilibrada de las partes
- Cumplimiento de normativa argentina`;

        const userPrompt = `Redacta un ${contratoInfo.nombre} completo con la siguiente información:

PARTES DEL CONTRATO:
${partes}

CLÁUSULAS Y CONDICIONES:
${clausulas}

REQUISITOS:
1. Incluye todos los elementos esenciales del contrato
2. Cláusulas claras sobre derechos y obligaciones
3. Condiciones de cumplimiento y plazo
4. Cláusula de resolución de conflictos
5. Jurisdicción aplicable
6. Lugar y fecha de firma
7. Conformidad con el CCyCN argentino

ESTRUCTURA:
- Encabezado con lugar y fecha
- Identificación completa de las partes
- Antecedentes (si aplica)
- Cláusulas numeradas
- Firmas

IMPORTANTE: Este es un BORRADOR que debe ser revisado por el abogado antes de su firma.

${DISCLAIMER_LEGAL}`;

        return await this.callAPI(systemPrompt, userPrompt, 4000);
    },

    // Generar caso práctico
    async generarCasoPractico(tipoDerecho) {
        const systemPrompt = `Eres un educador legal especializado en crear casos prácticos para formación de abogados en Argentina.

Tu objetivo es crear casos realistas pero ficticios que permitan practicar:
- Análisis de situaciones jurídicas
- Identificación de normativa aplicable
- Estrategia procesal
- Redacción de escritos

Base legal: Legislación argentina actual`;

        const userPrompt = `Genera un caso práctico de ${tipoDerecho} para un abogado argentino.

El caso debe incluir:

1. **Título del caso**: Nombre breve y descriptivo

2. **Hechos del caso**: Narración detallada de la situación
   - Personajes involucrados (nombres ficticios)
   - Cronología de eventos
   - Contexto relevante
   - Documentación disponible

3. **Cuestiones a resolver**:
   - 3-5 preguntas específicas
   - De menor a mayor complejidad
   - Que requieran análisis jurídico

4. **Elementos para considerar**:
   - Normativa aplicable
   - Plazos procesales
   - Estrategias posibles
   - Riesgos y oportunidades

5. **Pistas para la resolución**:
   - Sin dar la respuesta completa
   - Orientaciones metodológicas
   - Recursos a consultar

El caso debe ser:
- Realista pero claramente ficticio
- Educativo y desafiante
- Relevante para la práctica profesional
- Basado en situaciones comunes en Argentina`;

        return await this.callAPI(systemPrompt, userPrompt, 3500);
    },

    // Analizar texto de PDF extraído
    async procesarTextoPDF(texto) {
        const systemPrompt = `Eres un asistente que extrae y estructura información de documentos judiciales.

Tu tarea es:
1. Identificar el tipo de documento
2. Extraer información clave
3. Estructurar los datos
4. Resaltar elementos importantes`;

        const userPrompt = `Analiza el siguiente texto extraído de un PDF y proporciona:

1. Tipo de documento identificado
2. Datos principales extraídos
3. Estructura del documento
4. Información relevante para análisis legal

TEXTO:
${texto.substring(0, 8000)} ${texto.length > 8000 ? '...[texto truncado]' : ''}`;

        return await this.callAPI(systemPrompt, userPrompt, 2000);
    }
};

// Exportar para uso en la aplicación
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClaudeAI;
}
