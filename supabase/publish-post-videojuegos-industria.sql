-- Sin Tachar — (BONUS) artículo inaugural de Videojuegos: crisis laboral de la industria.
-- Opcional. Córrelo DESPUÉS del redeploy de Vercel.

-- Categoría Videojuegos (idempotente)
insert into public.categories (slug,name_es,name_en,sort_order)
  values ('videojuegos','Videojuegos','Video games',5) on conflict (slug) do nothing;
update public.categories set sort_order=6 where slug='ia-segura';

do $$
declare admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'ricardo.martinez@inbest.cloud';
  if admin_id is null then raise exception 'No encontré ese usuario. Regístrate o cambia el email.'; end if;

  insert into public.posts
    (author_id, category_slug, slug, title_es, title_en, excerpt_es, excerpt_en, body_es, body_en, cover_image_url, status, published_at)
  values
    (admin_id, 'videojuegos', 'record-y-despido-costo-humano-del-videojuego',
     'El récord y el despido: quién paga la edad de oro del videojuego', 'The Record and the Layoff: Who Pays for Gaming''s Golden Age',
     'La industria del videojuego facturó una cifra histórica mientras despedía a decenas de miles de personas. Detrás del récord hay una crisis laboral que trabajadores, sindicatos y actores de voz empezaron a disputar.', 'The video game industry booked record revenue while laying off tens of thousands of people. Behind the record lies a labor crisis that workers, unions, and voice actors have begun to fight back against.',
     'En 2025 la industria del videojuego facturó una cifra que sus fundadores difícilmente habrían imaginado: alrededor de 201.600 millones de dólares. El mismo año, cerca de nueve mil personas que hacían esos juegos se quedaron sin trabajo. Esa es la fractura que define al medio en 2026: nunca se ganó tanto dinero, y nunca se despidió a tanta gente que lo generaba. El récord y el despido conviven en la misma hoja de cálculo, y entre ambos hay nombres, hipotecas y años de oficio.

El dato duele más al mirarlo de cerca. 2024 fue el peor año registrado por el sector: entre 14.800 y 15.600 puestos eliminados, según las estimaciones que compilan medios y analistas —no existe un censo oficial, así que conviene leerlas como cálculos agregados—, con un primer trimestre que concentró 8.619 despidos, el trimestre más alto de la historia de la industria. 2025 trajo unos 9.175, una cifra menor pero todavía por encima de la crisis de 2022. Y en julio de 2026, Microsoft anunció alrededor de 9.000 despidos globales, de los cuales unos 3.200 cayeron sobre su división de videojuegos, tocando estudios como Obsidian, id Software y ZeniMax Online.

No son solo números: son estudios enteros que dejaron de existir. Arkane Austin, Ready at Dawn, Volition y Riot Forge cerraron en 2024; Cliffhanger Games, de EA, en mayo de 2025; y Ubisoft Leamington. Cada cierre borra una cultura de trabajo, una manera de contar historias, una comunidad. Y el momento suele ser cruel: según los reportes, los recortes de Microsoft de julio de 2026 llegaron apenas un día antes del lanzamiento del DLC de DOOM: The Dark Ages, contenido que los mismos trabajadores despedidos habían terminado a marchas forzadas. El crunch, esa jornada extenuante que la industria normalizó durante décadas, no fue recompensado con estabilidad, sino con la carta de despido.

Frente a ese patrón, algo cambió: los trabajadores dejaron de aceptarlo en silencio. En julio de 2024, Bethesda Game Studios —241 personas entre artistas, diseñadores y programadores— se convirtió en el primer sindicato "wall-to-wall" de Microsoft, reconocido a través de la Communications Workers of America. Desde 2022, más de 3.500 trabajadores de Xbox se han sindicalizado. Y cuando los recortes de julio de 2026 alcanzaron a 440 puestos sindicalizados, la respuesta fue inédita: el 15 de julio de 2026 hubo marchas simultáneas en seis estudios de Xbox, la primera acción laboral multiestudio coordinada del sector, acompañada de cargos por prácticas laborales injustas en Estados Unidos y Canadá.

La otra gran batalla se libró en el terreno que más nos importa aquí: la inteligencia artificial. Los actores de voz y de captura de movimiento agrupados en SAG-AFTRA iniciaron huelga el 26 de julio de 2024, la suspendieron el 11 de junio de 2025 y ratificaron el acuerdo con un 95,04% a favor. Lograron aumentos compuestos y, sobre todo, protecciones concretas frente a la IA: consentimiento y divulgación obligatorios para crear réplicas digitales de su voz o su imagen, con derecho a suspender ese consentimiento durante una huelga. Es una de las primeras veces que una industria escribe, en un contrato, que la persona debe autorizar que una máquina la imite. No es una victoria menor: es una definición de dónde termina la eficiencia y empieza la dignidad.

Aquí no celebramos la épica del videojuego sin mirar quién la sostiene. Detrás de cada mundo abierto, cada doblaje que nos eriza la piel, cada final que recordamos años después, hay gente cuyo trabajo se volvió invisible justo cuando el negocio nunca estuvo mejor. La pregunta que deja 2026 no es cuánto factura la industria, sino a qué costo humano lo hace, y qué le debemos a quienes construyen los mundos donde jugamos.

¿Cómo lo ves tú? ¿Puede un medio seguir llamándose arte si trata así a sus artistas? Cuéntanos en los comentarios: queremos leerte.', 'In 2025 the video game industry booked a figure its founders could scarcely have imagined: roughly 201.6 billion dollars. That same year, close to nine thousand of the people who make those games lost their jobs. This is the fracture that defines the medium in 2026: never has so much money been made, and never have so many of the people generating it been let go. The record and the layoff share the same spreadsheet, and between the two there are names, mortgages, and years of craft.

The numbers hurt more up close. 2024 was the worst year on record for the sector: between 14,800 and 15,600 positions eliminated, according to estimates compiled by media outlets and analysts — there is no official census, so they are best read as aggregate calculations — with a first quarter that alone accounted for 8,619 layoffs, the highest single quarter in the industry''s history. 2025 brought around 9,175, a smaller figure but still above the 2022 crisis. And in July 2026, Microsoft announced roughly 9,000 global layoffs, some 3,200 of them falling on its gaming division, hitting studios such as Obsidian, id Software, and ZeniMax Online.

These are not just numbers: they are entire studios that ceased to exist. Arkane Austin, Ready at Dawn, Volition, and Riot Forge closed in 2024; EA''s Cliffhanger Games in May 2025; and Ubisoft Leamington. Each closure erases a working culture, a way of telling stories, a community. And the timing tends to be cruel: according to reports, Microsoft''s July 2026 cuts arrived barely a day before the launch of the DOOM: The Dark Ages DLC — content that the very workers being laid off had finished under grueling pressure. Crunch, the punishing overwork the industry normalized for decades, was rewarded not with stability but with a pink slip.

Against that pattern, something shifted: workers stopped accepting it in silence. In July 2024, Bethesda Game Studios — 241 people spanning artists, designers, and programmers — became Microsoft''s first "wall-to-wall" union, recognized through the Communications Workers of America. Since 2022, more than 3,500 Xbox workers have unionized. And when the July 2026 cuts reached 440 union positions, the response was unprecedented: on July 15, 2026, there were simultaneous marches at six Xbox studios, the first coordinated multi-studio labor action in the sector''s history, backed by unfair labor practice charges in the United States and Canada.

The other great battle was fought on the terrain we care about most here: artificial intelligence. The voice and motion-capture performers of SAG-AFTRA began their strike on July 26, 2024, suspended it on June 11, 2025, and ratified the agreement with 95.04% in favor. They won compound raises and, above all, concrete protections against AI: mandatory consent and disclosure to create digital replicas of their voice or likeness, with the right to withdraw that consent during a strike. It is one of the first times an industry has written into a contract that a person must authorize a machine to imitate them. This is no minor victory: it is a definition of where efficiency ends and dignity begins.

We do not celebrate the epic scale of video games without asking who holds it up. Behind every open world, every performance that raises the hairs on your arm, every ending we remember years later, there are people whose work became invisible precisely when the business had never been better. The question 2026 leaves us is not how much the industry earns, but at what human cost — and what we owe to those who build the worlds we play in.

How do you see it? Can a medium still call itself art if it treats its artists this way? Tell us in the comments: we want to hear from you.',
     '/covers/videojuegos-despidos.svg', 'published', now())
  on conflict (slug) do nothing;
end $$;
