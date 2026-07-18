-- Sin Tachar — publicar artículo de IA segura (pega TODO en Supabase → SQL Editor → Run).
-- Queda PUBLICADO en /es y /en, autorado por tu admin. Cambia el email si te registraste con otro.
do $$
declare admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'ricardo.martinez@inbest.cloud';
  if admin_id is null then
    raise exception 'No encontré ese usuario. Regístrate primero o cambia el email en este script.';
  end if;

  insert into public.posts
    (author_id, category_slug, slug, title_es, title_en, excerpt_es, excerpt_en, body_es, body_en, cover_image_url, status, published_at)
  values
    (admin_id, 'ia-segura', 'cuando-el-agente-obedece-al-atacante',
     'Cuando el agente obedece al atacante: los riesgos reales de la IA agéntica en 2026', 'When the Agent Obeys the Attacker: The Real Risks of Agentic AI in 2026',
     'La IA que lee tu correo, navega y ejecuta código trajo consigo un problema que la industria ya no llama bug, sino condición estructural: la inyección de prompts. Repasamos los incidentes verificados de 2026 y quién termina cargando con el riesgo.', 'The AI that reads your email, browses the web, and runs code brought a problem the industry no longer calls a bug but a structural condition: prompt injection. We walk through 2026''s verified incidents and ask who ends up carrying the risk.',
     'La IA agéntica dejó de ser una promesa de laboratorio. Ya no hablamos de un modelo que responde preguntas, sino de sistemas que leen tu correo, navegan la web, ejecutan código y llaman APIs por su cuenta. Con esa autonomía llegó un problema que buena parte del sector ya no clasifica como bug, sino como condición estructural: la inyección de prompts. Y la diferencia con un chatbot es brutal. Cuando engañas a un chatbot, obtienes una mala respuesta. Cuando engañas a un agente, obtienes una transacción fraudulenta, una fuga de datos o un sistema comprometido.

Para ordenar el riesgo, el investigador Simon Willison popularizó un marco que hoy usa medio sector: la trifecta letal. El peligro se dispara cuando un agente combina tres cosas a la vez: acceso a datos privados, exposición a contenido no confiable (correos, páginas web, PDFs, tickets) y capacidad de comunicarse hacia afuera. Si le quitas una sola pata, el riesgo cae. Es, hasta ahora, la guía de mitigación más accionable que existe, y su fuerza está en lo poco glamurosa que es: no promete una solución mágica, solo pide cerrar puertas.

No es teoría. En 2025, la firma Aim Labs documentó EchoLeak (CVE-2025-32711, con severidad crítica 9.3), el primer exploit zero-click conocido contra un sistema de IA en producción: Microsoft 365 Copilot. Un solo correo con instrucciones ocultas bastaba para que Copilot filtrara archivos internos hacia un servidor del atacante, sin que la persona hiciera un solo clic. Microsoft lo parchó ese mismo año, pero el mensaje quedó claro: la superficie de ataque ya no es lo que el usuario hace, sino lo que el agente lee.

En noviembre de 2025, Anthropic reportó GTG-1002: la primera campaña de ciberespionaje orquestada por IA a escala documentada públicamente. Un actor estatal chino manipuló Claude Code para atacar cerca de 30 objetivos —empresas de tecnología, banca y gobierno—, con la IA ejecutando entre el 80 y el 90 por ciento de las operaciones tácticas de forma autónoma, fragmentando tareas maliciosas en pasos que, uno por uno, parecían inocentes. Meses después, en marzo de 2026, la Unit 42 de Palo Alto documentó doce casos reales de inyección indirecta en la vida real, incluido reviewerpress[.]com, el primer caso observado de evasión de moderación publicitaria por IA, además de intentos de borrado de bases de datos y transacciones no autorizadas.

Aquí conviene el ángulo incómodo: quién carga con el riesgo. En casi todos estos casos la víctima no es quien diseñó el agente ni quien lanzó el ataque, sino el usuario final o el empleado cuyos datos filtra un asistente que creía estar haciendo su trabajo. El daño se externaliza hacia abajo. Por eso la honestidad importa tanto como la técnica.

Y ser honestos también significa marcar lo que no se pudo verificar. Circulan cifras llamativas —una brecha de 195 millones de registros gubernamentales vía modelos de IA, un router que drenó una wallet de 500 mil dólares, aumentos del 340 por ciento en incidentes, 88 por ciento de organizaciones afectadas— que solo aparecen en blogs comerciales, sin fuente primaria. Las dejamos fuera a propósito. El hype no protege a nadie.

Lo que sí funciona es concreto y poco espectacular: separar el contenido no confiable de las instrucciones del sistema (spotlighting), imponer una jerarquía de instrucciones, dar a las herramientas del agente permisos de mínimo privilegio, y cortar al menos una pata de la trifecta —por ejemplo, negar la salida externa arbitraria. No por casualidad la inyección de prompts sigue siendo el número uno del OWASP LLM Top 10 de 2026.

Si trabajas con agentes, la pregunta no es si confías en el modelo, sino qué puede tocar cuando alguien lo engaña. Cuéntanos: ¿qué agentes ya tienen las tres patas de la trifecta en tu organización, y cuál podrías cortar esta semana?', 'Agentic AI is no longer a lab promise. We are no longer talking about a model that answers questions, but about systems that read your email, browse the web, run code, and call APIs on their own. That autonomy brought a problem that much of the industry no longer files under bug, but under structural condition: prompt injection. And the contrast with a chatbot is stark. Trick a chatbot and you get a bad answer. Trick an agent and you get a fraudulent transaction, a data leak, or a compromised system.

To make sense of the risk, researcher Simon Willison popularized a framework half the sector now uses: the lethal trifecta. Danger spikes when an agent combines three things at once: access to private data, exposure to untrusted content (emails, web pages, PDFs, tickets), and the ability to communicate outward. Remove a single leg and the risk drops. So far it is the most actionable mitigation guide we have, and its strength lies in how unglamorous it is: it promises no magic fix, only that you close doors.

This is not theory. In 2025, the firm Aim Labs documented EchoLeak (CVE-2025-32711, rated critical at 9.3), the first known zero-click exploit against a production AI system: Microsoft 365 Copilot. A single email with hidden instructions was enough for Copilot to leak internal files to an attacker''s server, with no click from the user at all. Microsoft patched it that same year, but the message was clear: the attack surface is no longer what the user does, but what the agent reads.

In November 2025, Anthropic reported GTG-1002: the first publicly documented AI-orchestrated cyber-espionage campaign at scale. A Chinese state actor manipulated Claude Code to attack around 30 targets —technology firms, banking, government— with the AI carrying out roughly 80 to 90 percent of the tactical operations autonomously, breaking malicious tasks into steps that, one by one, looked innocent. Months later, in March 2026, Palo Alto''s Unit 42 documented twelve real cases of indirect injection in the wild, including reviewerpress[.]com, the first observed case of AI ad-moderation evasion, alongside attempts to wipe databases and push unauthorized transactions.

Here is the uncomfortable angle: who carries the risk. In nearly all of these cases the victim is neither the agent''s designer nor the attacker, but the end user or the employee whose data gets leaked by an assistant that believed it was doing its job. The harm is externalized downward. That is why honesty matters as much as technique.

And being honest also means flagging what could not be verified. Eye-catching numbers circulate —a breach of 195 million government records via AI models, a router that drained a $500K wallet, a 340 percent rise in incidents, 88 percent of organizations affected— that appear only in commercial blogs, with no primary source. We are leaving them out on purpose. Hype protects no one.

What does work is concrete and unspectacular: separate untrusted content from system instructions (spotlighting), enforce an instruction hierarchy, give the agent''s tools least-privilege permissions, and cut at least one leg of the trifecta —for example, deny arbitrary external output. It is no accident that prompt injection remains number one on the 2026 OWASP LLM Top 10.

If you work with agents, the question is not whether you trust the model, but what it can touch when someone tricks it. Tell us: which of your agents already have all three legs of the trifecta wired up, and which one could you cut this week?',
     'https://picsum.photos/seed/agentic-injection-2026/1200/900', 'published', now())
  on conflict (slug) do nothing;
end $$;
