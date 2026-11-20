# Kytky Plzeň: eshop a provozní systém

Vlastní eshop a provozní systém pro květinářství Kytky Plzeň (kytkyplzen.com), který nahradí Shoptet. Zákazník objedná kytici na konkrétní hodinu a adresu a zaplatí online, obsluha vše vyřídí z mobilu.

## Stav

- Fáze 0 (návrh) schválena, zvolen vizuální směr A „Pastel“.
- Fáze 1 (základ) hotová: katalog, detail produktu, admin denní nabídky z mobilu, sklad po prodejnách, rezervace se souběhem, nastavení, audit log.
- Fáze 2 (objednávka, sloty, doprava, Stripe, doklady, notifikace) následuje po otestování fáze 1.

## Technika

Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4, Drizzle ORM, Postgres (Neon na Vercelu, lokálně PGlite), Vercel Blob pro fotky, Vitest.

## Spuštění lokálně

```bash
pnpm install
cp .env.example .env.local   # volitelné, bez DATABASE_URL se použije PGlite v ./.data
pnpm dev                     # http://localhost:3000
```

První otevření `/admin` nabídne první nastavení: založí účet majitelky, vytvoří tabulky a nahraje ukázková data.

## Příkazy

| Příkaz | Co dělá |
|---|---|
| `pnpm dev` | vývojový server |
| `pnpm build` a `pnpm start` | produkční build a spuštění |
| `pnpm test` | jednotkové testy (rezervace skladu, dostupnost, peníze) |
| `pnpm lint`, `pnpm typecheck` | kontrola kódu |
| `pnpm db:generate` | vygeneruje SQL migraci ze schématu `src/db/schema.ts` |
| `pnpm db:migrate` | spustí migrace proti `DATABASE_URL` |
| `pnpm db:seed` | nahraje ukázková data do `DATABASE_URL` |

Migrace jdou spustit i z adminu (Nastavení, Aktualizovat databázi).

## Proměnné prostředí

Viz `.env.example`. Na Vercelu: `DATABASE_URL` (Neon), `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN` (nastaví propojení Blob store), `NEXT_PUBLIC_SITE_URL`.

## Struktura

```
src/app/(shop)      veřejný web
src/app/admin       administrace (přihlášení, nabídka, sklad, nastavení)
src/app/api         nahrávání fotek, health
src/modules         doménová logika: catalog, inventory, admin
src/db              schéma, klient, seed
drizzle/            SQL migrace
tests/              Vitest
docs/faze-0/        návrh: otázky, architektura, design, náhledy, mapa přesměrování
```

## Dokumenty fáze 0

| Soubor | Obsah |
|---|---|
| [docs/faze-0/00-pruzkum-znacky.md](docs/faze-0/00-pruzkum-znacky.md) | co jsme zjistili o značce, webu a současném ceníku dopravy |
| [docs/faze-0/01-otazky.md](docs/faze-0/01-otazky.md) | otázky s navrženými předpoklady |
| [docs/faze-0/02-architektura.md](docs/faze-0/02-architektura.md) | technologie, datový model, toky, plán fází |
| [docs/faze-0/03-design.md](docs/faze-0/03-design.md) | vizuální směry a klikatelné náhledy |
| [docs/faze-0/04-mapa-presmerovani.md](docs/faze-0/04-mapa-presmerovani.md) | návrh 301 přesměrování ze současných URL |

Ukázková data (ceny, sazby DPH, otevírací doby, texty) jsou jen ukázková a upravují se v administraci.
