# Mapa přesměrování 301 (návrh)

Zdroj: sitemap kytkyplzen.com k 19. 11. 2026, 140 URL. Cílové adresy jsou návrh struktury nového webu a upřesní se ve fázi 5. Tabulka bude v adminu editovatelná (entita `redirect`), přesměrování se nasadí při přepnutí domény.

## Navrhovaná struktura nového webu

| Nová adresa | Obsah |
|---|---|
| `/` | úvod s denní nabídkou |
| `/kytice` | katalog hotových kytic, filtr prodejny a dostupnosti |
| `/kytice/[slug]` | detail produktu |
| `/kytice-na-miru` | kytice na míru v cenové hladině |
| `/doplnky`, `/doplnky/[slug]` | váza, čokoláda, plyšáci |
| `/inspirace` | galerie dřívějších prací bez košíku, s poptávkou |
| `/svatby` | svatební servis, poptávkový formulář |
| `/objednavka` | košík a objednávka |
| `/p/[token]` | platební odkaz |
| `/r/[token]` | odkaz pro řidiče |
| `/prodejny`, `/kontakt`, `/jak-to-funguje`, `/recenze` | informační stránky |
| `/obchodni-podminky`, `/ochrana-osobnich-udaju` | právní texty |
| `/ucet` | zákazník: body, příležitosti, objednávky |

## Pravidla

| Stará adresa (vzor) | Nová adresa | Poznámka |
|---|---|---|
| `^/$` | `/` | úvod s denní nabídkou |
| `^/produkty/$` | `/kytice` | katalog |
| `^/ihned-k-odeslani/$` | `/kytice?dostupnost=dnes` | hotové kytice dnes |
| `^/galerie-2-2-2/$` | `/inspirace` | galerie bez košíku, s poptávkou |
| `^/svatebni/$` | `/svatby` | poptávkový formulář |
| `^/ruze/$` | `/kytice/ruze` | růže na kusy |
| `^/plysaci/$` | `/doplnky` | doplňky |
| `^/kvetiny-(\d+)-(\d+)(-2)?/$` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `^/prodejny/$` | `/prodejny` |  |
| `^/kontakty/$` | `/kontakt` |  |
| `^/recenze/$` | `/recenze` | pokud recenze nepřeneseme, pak /kontakt |
| `^/jak-nakupovat/$` | `/jak-to-funguje` |  |
| `^/obchodni-podminky/$` | `/obchodni-podminky` |  |
| `^/podminky-ochrany-osobnich-udaju/$` | `/ochrana-osobnich-udaju` |  |
| `^/nase-novinky/$` | `/` | blog nemá obsah |
| `^/test/$` | `/` | testovací stránka |
| `^/produkty/necham-to-na-floristce(-\d+-kc)?/$` | `/kytice-na-miru` | výběr hladiny na cílové stránce |
| `^/produkty/raffaello-80-g/$` | `/doplnky/raffaello-80-g` |  |
| `^/produkty/ruze-ekvador-70cm/$` | `/kytice/ruze-ekvador-70-cm` |  |
| `^/produkty/ruze-mondial-ekvador-70cm/$` | `/kytice/ruze-mondial-70-cm` |  |
| `^/produkty/chryzy/$` | `/kytice/chryzantemy` |  |
| `^/produkty/kytice-premiovych--ruzi-z-ekvadoru/$` | `/kytice/premiove-ruze` | prémiová na předobjednávku |
| `^/produkty/ekvadorske-ruze-51-ks/$` | `/kytice/51-ekvadorskych-ruzi` | prémiová na předobjednávku |
| `^/plysaci/(.+)/$` | `/doplnky/\1` |  |
| `^/svatebni/(korsaz|kytka)-(\d+)(-2)?/$` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `^/galerie-2-2-2/kytka-(\d+)/$` | `/inspirace` | galerie |
| `^/kvetiny-\d+-\d+/kytka-(\d+)/$` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `^/(ihned-k-odeslani|produkty)/kytka-(\d+)(-2)?/$` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |

## Všech 140 URL ze sitemapy

| Stará | Nová | Poznámka |
|---|---|---|
| `/` | `/` | úvod s denní nabídkou |
| `/podminky-ochrany-osobnich-udaju/` | `/ochrana-osobnich-udaju` |  |
| `/recenze/` | `/recenze` | pokud recenze nepřeneseme, pak /kontakt |
| `/prodejny/` | `/prodejny` |  |
| `/test/` | `/` | testovací stránka |
| `/jak-nakupovat/` | `/jak-to-funguje` |  |
| `/produkty/` | `/kytice` | katalog |
| `/kontakty/` | `/kontakt` |  |
| `/galerie-2-2-2/` | `/inspirace` | galerie bez košíku, s poptávkou |
| `/obchodni-podminky/` | `/obchodni-podminky` |  |
| `/nase-novinky/` | `/` | blog nemá obsah |
| `/plysaci/` | `/doplnky` | doplňky |
| `/ihned-k-odeslani/` | `/kytice?dostupnost=dnes` | hotové kytice dnes |
| `/svatebni/` | `/svatby` | poptávkový formulář |
| `/ruze/` | `/kytice/ruze` | růže na kusy |
| `/kvetiny-400-500/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-500-600/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-600-800/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-800-1000/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-1000-1300/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-1300-1500/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-1500-2000-2/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-2500-3000/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-2000-2500/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-3000-3500/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/kvetiny-3500-4000/` | `/kytice-na-miru` | cenová pásma nahrazuje kytice na míru s volbou částky |
| `/produkty/raffaello-80-g/` | `/doplnky/raffaello-80-g` |  |
| `/produkty/necham-to-na-floristce/` | `/kytice-na-miru` | výběr hladiny na cílové stránce |
| `/produkty/necham-to-na-floristce-1000-kc/` | `/kytice-na-miru` | výběr hladiny na cílové stránce |
| `/produkty/necham-to-na-floristce-1500-kc/` | `/kytice-na-miru` | výběr hladiny na cílové stránce |
| `/produkty/necham-to-na-floristce-2000-kc/` | `/kytice-na-miru` | výběr hladiny na cílové stránce |
| `/produkty/ruze-ekvador-70cm/` | `/kytice/ruze-ekvador-70-cm` |  |
| `/produkty/ruze-mondial-ekvador-70cm/` | `/kytice/ruze-mondial-70-cm` |  |
| `/produkty/chryzy/` | `/kytice/chryzantemy` |  |
| `/produkty/kytice-premiovych--ruzi-z-ekvadoru/` | `/kytice/premiove-ruze` | prémiová na předobjednávku |
| `/produkty/ekvadorske-ruze-51-ks/` | `/kytice/51-ekvadorskych-ruzi` | prémiová na předobjednávku |
| `/plysaci/medvidek-bily-40cm/` | `/doplnky/medvidek-bily-40cm` |  |
| `/plysaci/medvidek-30cm/` | `/doplnky/medvidek-30cm` |  |
| `/plysaci/medvidek-40cm-brownie/` | `/doplnky/medvidek-40cm-brownie` |  |
| `/plysaci/kralicek-40cm/` | `/doplnky/kralicek-40cm` |  |
| `/kvetiny-2000-2500/kytka-10101/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10102/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10103/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10104/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10105/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10106/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10107/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10108/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10109/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10110/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10111/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10112/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10113/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10114/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10115/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10116/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10117/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10118/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10119/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10120/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10121/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10122/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10123/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10124/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10125/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10126/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10127/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10128/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10129/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10130/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10131/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10132/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10133/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10134/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10135/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10136/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10137/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10138/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10139/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10140/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10142/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10141/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10143/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10144/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10145/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10146/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10147/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10148/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10149/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10150/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10151/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10152/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10153/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10154/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10155/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10156/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10157/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10158/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10159/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/kvetiny-2000-2500/kytka-10160/` | `/inspirace` | portfolio po pásmech; při přenosu galerie /inspirace/kytka-\1 |
| `/galerie-2-2-2/kytka-10161/` | `/inspirace` | galerie |
| `/galerie-2-2-2/kytka-10162/` | `/inspirace` | galerie |
| `/galerie-2-2-2/kytka-10163/` | `/inspirace` | galerie |
| `/svatebni/kytka-10101-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10102-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10103-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10104-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10105-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10106-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10107-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10108-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10109-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10110-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10111-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/korsaz-10112/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/korsaz-10113/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10114-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10115-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10116-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10117-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10118-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10119-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10120-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10121-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10122-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10123-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10124-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/kytka-10125-2/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/svatebni/korsaz-10126/` | `/svatby` | portfolio položky bez košíku; pokud přeneseme galerii, cíl /inspirace/\1-\2 |
| `/produkty/kytka-201/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/produkty/kytka-202202/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/produkty/kytka-203203/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/produkty/kytka-204204/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/ihned-k-odeslani/kytka-205-2/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/ihned-k-odeslani/kytka-206/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/ihned-k-odeslani/kytka-207/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/ihned-k-odeslani/kytka-208/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/ihned-k-odeslani/kytka-210/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/ihned-k-odeslani/kytka-211/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
| `/ihned-k-odeslani/kytka-212/` | `/kytice` | denní kytice mají krátkou životnost; staré URL vedou na aktuální nabídku |
