import { db, type ProviderRow } from './db.js';

type SeedProvider = Omit<ProviderRow, 'id'>;

const PROVIDERS: SeedProvider[] = [
  {
    name: 'Ana María Gómez',
    title: 'Dra.',
    category: 'medica',
    specialty: 'Medicina general',
    bio: 'Médica de familia con enfoque en prevención y atención cercana. Atiende resfriados, presión arterial, diabetes y chequeos generales.',
    languages: 'Español,Inglés',
    years: 12,
    price_usd: 49,
    rating: 4.9,
    avatar: '👩🏽‍⚕️',
  },
  {
    name: 'Carlos Rivera',
    title: 'Dr.',
    category: 'medica',
    specialty: 'Pediatría',
    bio: 'Pediatra dedicado a la salud de niñas y niños. Controles de crecimiento, vacunas, fiebre y dudas de crianza.',
    languages: 'Español,Inglés',
    years: 15,
    price_usd: 55,
    rating: 4.8,
    avatar: '👨🏽‍⚕️',
  },
  {
    name: 'Lucía Fernández',
    title: 'Dra.',
    category: 'medica',
    specialty: 'Salud de la mujer',
    bio: 'Ginecóloga con trato humano. Salud reproductiva, anticoncepción, menopausia y chequeos preventivos.',
    languages: 'Español',
    years: 10,
    price_usd: 60,
    rating: 4.9,
    avatar: '👩🏻‍⚕️',
  },
  {
    name: 'Andrés Vargas',
    title: 'Lic.',
    category: 'medica',
    specialty: 'Nutrición',
    bio: 'Nutricionista clínico. Planes de alimentación para diabetes, control de peso y salud digestiva adaptados a la comida latina.',
    languages: 'Español,Inglés',
    years: 8,
    price_usd: 45,
    rating: 4.7,
    avatar: '🥗',
  },
  {
    name: 'Sofía Ramírez',
    title: 'Lic.',
    category: 'psicologica',
    specialty: 'Psicología · Ansiedad y depresión',
    bio: 'Psicóloga clínica especializada en ansiedad, depresión y estrés. Terapia cognitivo-conductual en un espacio seguro y sin juicios.',
    languages: 'Español',
    years: 9,
    price_usd: 70,
    rating: 5.0,
    avatar: '🧑🏽‍⚕️',
  },
  {
    name: 'Diego Morales',
    title: 'Lic.',
    category: 'psicologica',
    specialty: 'Psicología · Terapia individual',
    bio: 'Acompaño procesos de duelo, autoestima, migración y adaptación cultural. Enfoque humanista y cálido.',
    languages: 'Español,Inglés',
    years: 11,
    price_usd: 70,
    rating: 4.9,
    avatar: '👨🏻‍⚕️',
  },
  {
    name: 'Valentina Castro',
    title: 'Dra.',
    category: 'psicologica',
    specialty: 'Psiquiatría',
    bio: 'Psiquiatra. Evaluación y manejo de medicación para depresión, ansiedad, insomnio y TDAH, en coordinación con tu terapeuta.',
    languages: 'Español,Inglés',
    years: 14,
    price_usd: 90,
    rating: 4.8,
    avatar: '👩🏼‍⚕️',
  },
  {
    name: 'Patricia Núñez',
    title: 'Lic.',
    category: 'psicologica',
    specialty: 'Terapia de pareja y familia',
    bio: 'Terapeuta familiar. Comunicación, conflictos de pareja y crianza. Sesiones para parejas y familias.',
    languages: 'Español',
    years: 13,
    price_usd: 80,
    rating: 4.9,
    avatar: '👩🏽',
  },
];

/** Inserta los proveedores de ejemplo si la tabla está vacía. */
export function seedProviders(): void {
  const count = (db.prepare('SELECT COUNT(*) AS n FROM providers').get() as { n: number }).n;
  if (count > 0) return;

  const insert = db.prepare(
    `INSERT INTO providers (name, title, category, specialty, bio, languages, years, price_usd, rating, avatar)
     VALUES (@name, @title, @category, @specialty, @bio, @languages, @years, @price_usd, @rating, @avatar)`,
  );
  const tx = db.transaction((rows: SeedProvider[]) => rows.forEach((r) => insert.run(r)));
  tx(PROVIDERS);
  console.log(`🌱  Sembrados ${PROVIDERS.length} proveedores de ejemplo.`);
}
