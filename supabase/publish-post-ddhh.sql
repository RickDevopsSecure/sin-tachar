-- Sin Tachar — publicar artículo de Derechos humanos. ⚠️ Córrelo tras el redeploy de Vercel.
do $$
declare admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'ricardo.martinez@inbest.cloud';
  if admin_id is null then raise exception 'No encontré ese usuario. Regístrate o cambia el email.'; end if;
  insert into public.posts
    (author_id, category_slug, slug, title_es, title_en, excerpt_es, excerpt_en, body_es, body_en, cover_image_url, status, published_at)
  values
    (admin_id, 'derechos-humanos', 'quienes-cuidan-la-tierra',
     'Quienes cuidan la tierra: los defensores que América Latina sigue enterrando', 'Those Who Guard the Land: The Defenders Latin America Keeps Burying',
     'En 2025, América Latina volvió a ser la región más letal para quienes defienden derechos humanos: al menos 358 personas asesinadas, la mayoría por defender la tierra. Las cifras, con nombre y fuente —y lo que todavía no sabemos.', 'In 2025, Latin America was again the deadliest region for human rights defenders: at least 358 people killed, most for defending the land. The figures, named and sourced —and what we still don''t know.',
     'En 2025, América Latina volvió a ser la región más letal del mundo para quienes defienden derechos humanos. No es una consigna: es lo que documentan, con nombres y cifras, las organizaciones que llevan más de una década contando cuerpos. Detrás de cada número hay una persona que decidió que un bosque, un río o su comunidad valían el riesgo.

Front Line Defenders registró al menos 358 personas defensoras asesinadas en 28 países durante 2025, según su Global Analysis 2025/26, publicado en junio de 2026. Los cinco países con más asesinatos fueron Colombia (165), México (43), Palestina (43), Brasil (22) y Honduras (13). Solo Colombia y México concentraron 208 casos: más de la mitad del total global registrado ese año.

El perfil de las víctimas dice tanto como las cifras. Quienes trabajaban por la tierra, el ambiente y los derechos campesinos fueron el grupo más atacado, con el 23.46% de los casos; les siguieron las personas defensoras de los derechos de los pueblos indígenas, con el 17.03%. No es casualidad: donde hay un territorio en disputa por minería, tala o agroindustria, suele haber alguien de la comunidad diciendo que no.

Global Witness, que mide específicamente a las personas defensoras de la tierra y el ambiente, contó 146 asesinadas o desaparecidas en el mundo durante 2024, y 117 de ellas —el 82%— en América Latina. Colombia encabezó por tercer año consecutivo, con 48 casos; Guatemala saltó de 4 a 20; México registró al menos 18 y Brasil al menos 12. El acumulado entre 2012 y 2024 llega a 2,253 personas. Los pueblos indígenas, que son cerca del 6% de la población mundial, fueron casi un tercio de las víctimas.

Matar no es la única forma de silenciar. Tanto Global Witness como CIVICUS advierten un cambio de táctica: la criminalización. El CIVICUS Monitor señala que las autoridades usan cada vez más el derecho penal para etiquetar a activistas como "criminales" o "terroristas", con cargos vagos, campañas de desprestigio y prisión preventiva prolongada. En Guatemala, la propia Comisión Interamericana de Derechos Humanos describió la criminalización como una práctica extendida, sostenida desde sectores del Ministerio Público y del poder judicial. Es una violencia más lenta, pero igual de eficaz para apagar una voz.

Hay un dato de contexto que rara vez se menciona. En 2025 la protección misma entró en crisis: Front Line Defenders documentó que 60 organizaciones perdieron en conjunto 45 millones de dólares anuales en apoyo directo a la protección, tras los recortes a la ayuda oficial al desarrollo. Menos escudos, los mismos blancos.

Conviene decir con claridad qué no sabemos. Estas cifras son mínimos verificados, no totales: dependen de lo que cada organización logró documentar y confirmar, y muchos casos quedan sin registrar, sobre todo en zonas de conflicto o bajo control de economías ilegales. Además, las metodologías difieren —Front Line Defenders cuenta a todo tipo de personas defensoras; Global Witness, solo a las de tierra y ambiente—, así que sus números no son directamente comparables ni se pueden sumar. Nombramos lo documentado sabiendo que la realidad probablemente es peor.

Detrás de cada una de estas cifras hay una persona que amaba un lugar y se atravesó para protegerlo. Nombrar el número es lo mínimo que podemos hacer; no olvidar es lo que sigue. ¿Conoces a alguien que defiende su territorio cerca de ti? Cuéntanoslo. Esta conversación se sostiene entre quienes se niegan a mirar para otro lado.', 'In 2025, Latin America was once again the deadliest region in the world for those who defend human rights. This is not a slogan: it is what the organizations that have spent more than a decade counting bodies document, with names and figures. Behind every number is a person who decided that a forest, a river, or their community was worth the risk.

Front Line Defenders recorded at least 358 human rights defenders killed across 28 countries in 2025, according to its Global Analysis 2025/26, published in June 2026. The five countries with the most killings were Colombia (165), Mexico (43), Palestine (43), Brazil (22), and Honduras (13). Colombia and Mexico alone accounted for 208 cases: more than half of the global total recorded that year.

The profile of the victims says as much as the figures. Those working for land, the environment, and peasant rights were the most attacked group, at 23.46% of cases; they were followed by defenders of Indigenous peoples'' rights, at 17.03%. It is no accident: wherever there is territory contested by mining, logging, or agribusiness, there tends to be someone from the community saying no.

Global Witness, which measures land and environmental defenders specifically, counted 146 killed or disappeared worldwide in 2024, and 117 of them —82%— in Latin America. Colombia led for the third consecutive year, with 48 cases; Guatemala jumped from 4 to 20; Mexico recorded at least 18 and Brazil at least 12. The cumulative toll between 2012 and 2024 reaches 2,253 people. Indigenous peoples, who make up about 6% of the world''s population, were nearly a third of the victims.

Killing is not the only way to silence someone. Both Global Witness and CIVICUS warn of a shift in tactics: criminalization. The CIVICUS Monitor notes that authorities increasingly use criminal law to label activists as "criminals" or "terrorists," through vague charges, smear campaigns, and prolonged pretrial detention. In Guatemala, the Inter-American Commission on Human Rights itself described criminalization as a widespread practice, sustained by sectors of the Attorney General''s Office and the judiciary. It is a slower violence, but just as effective at extinguishing a voice.

There is a piece of context that is rarely mentioned. In 2025, protection itself entered a crisis: Front Line Defenders documented that 60 organizations together lost 45 million dollars a year in direct protection support, following cuts to official development aid. Fewer shields, the same targets.

It is worth being clear about what we do not know. These figures are verified minimums, not totals: they depend on what each organization managed to document and confirm, and many cases go unrecorded, especially in zones of conflict or under the control of illegal economies. The methodologies also differ —Front Line Defenders counts all kinds of defenders; Global Witness, only those of land and environment— so their numbers are not directly comparable and cannot be added together. We name what is documented knowing that the reality is likely worse.

Behind each of these figures is a person who loved a place and stood in the way to protect it. Naming the number is the least we can do; not forgetting is what comes next. Do you know someone defending their land near you? Tell us. This conversation is held up by those who refuse to look away.',
     '/covers/ddhh-defensores.svg', 'published', now())
  on conflict (slug) do nothing;
end $$;
