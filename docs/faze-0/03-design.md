# Návrh designu: dva vizuální směry

Klikatelné náhledy (primárně pro mobil, otevřete v telefonu):

**Živě na Vercelu (oba směry, přepínač A/B nahoře):** https://kytkyplzen-nahled.vercel.app

Zdroj nasazené stránky je `docs/faze-0/nahledy/nahled-vercel.html` (fotky načítá z CDN současného webu).

| Směr | Náhled online | Soubor v repozitáři |
|---|---|---|
| A „Pastel“ | https://claude.ai/artifact/DJQSncpPNrGMBKV9Dj2PX4 | `docs/faze-0/nahledy/smer-a.html` |
| B „Ateliér“ | https://claude.ai/artifact/2hdN6UXjt7PR88BDUjYuHm | `docs/faze-0/nahledy/smer-b.html` |

Oba náhledy obsahují stejných šest obrazovek: a) úvod s denní nabídkou, b) detail kytice, c) objednávka, d) stránka platebního odkazu, e) admin nová kytice, f) admin přehled objednávek dne. Přepínáte je záložkami nahoře nebo klepáním na tlačítka uvnitř. Ceny, časy a pásma dopravy jsou ukázkové. Fotky jsou skutečné fotky z kytkyplzen.com, aby byl vidět reálný dojem.

Odkazy na náhledy jsou soukromé, dokud je nenasdílíte z menu Sdílet. Soubory v repozitáři jdou otevřít i offline.

## Společné zásady obou směrů

- Fotka je první a největší prvek na každé zákaznické obrazovce. Nic s ní nesoutěží, barvy UI jsou klidné, aby kytice vynikly.
- Minimum kroků: objednávka je jedna obrazovka s šesti bloky, žádný průvodce se šipkami. Detail má jedno hlavní tlačítko s cenou, které se drží u spodního okraje.
- Dotykové plochy nejméně 48 px, hlavní tlačítka 52 px, chipy 40 px. Admin je ovladatelný palcem jedné ruky: akce jsou dole, navigace dole, časté volby jako chipy.
- Rychlé načtení: žádné velké knihovny, obrázky ve správné velikosti, serverové vykreslování, systémové chování formulářů.
- Stavy mají tvar i barvu (chip s textem), ne jen barvu. Zelená, oranžová a červená jsou vyhrazené pro stav, nikdy pro značku.
- Admin „Nová kytice“ je stavěný na 30 sekund: fotka na celou šířku, velká cena, počet kusů krokovačem, prodejna přepínačem, „Zveřejnit“ jedním klepnutím, s pamětí posledních hodnot.

## Směr A „Pastel“

**Zdůvodnění.** Navazuje přímo na současnou značku: růžová ze Shoptetu a loga, ručně psané akcenty jako na bannerech, přátelský a hravý tón. Zákazníci z Instagramu (8 tisíc sledujících) poznají značku okamžitě. Hodí se k většině nabídky (kytice 300 až 1 500 Kč, dárky, plyšáci).

- **Paleta:** značková růžová `#E06C9F` (tlačítka), světlá růžová `#FF92D5` (akcenty, logo), tmavší růžová `#B23D76` pro text na bílé (kontrast 5,2:1), pudrové plochy `#FFE9F4`, teplá bílá `#FFFBFD`, inkoust `#2B1E27`, šedofialová pro vedlejší text `#7D6C76`.
- **Typografie:** Nunito (zaoblený bezpatkový, váhy 400 až 800) pro vše, Caveat (ručně psaný) jen pro krátké emocionální popisky („čt 19. 11.“, „my to uvážeme“). Logo zůstává stávající skriptové.
- **Komponenty:** zaoblené karty 18 px s jemným rámečkem, pilulkové chipy, růžové plné tlačítko s cenou vpravo, přepínače ve značkové růžové, admin s růžovou hlavičkou a bílým obsahem.
- **Kdy je to správná volba:** chcete zachovat kontinuitu s Instagramem a Shoptetem a oslovit hlavně dárkové nákupy mladší klientely.
- **Riziko:** u prémiových a svatebních kytic za 2 000 až 5 000 Kč může působit méně exkluzivně.

## Směr B „Ateliér“

**Zdůvodnění.** Posouvá značku k floristickému ateliéru: klidný chladnější podklad, inkoustově zelená jako hlavní barva UI, růžová zůstává jako podpis značky v akcentech. Patkové písmo v nadpisech dodává kyticím cenu. Lépe nese prémiovou a svatební část nabídky, kterou Instagram zdůrazňuje v bio.

- **Paleta:** inkoustově zelená `#1C2520` (text, aktivní prvky, admin), lesní zelená `#2F5C44` (tlačítka), značková růže `#C94C83` (akcenty, odkazy, upozornění), pudrová `#F4E7EC`, chladná slonová `#F5F4F0` jako podklad, šedozelená `#6D746F` pro vedlejší text.
- **Typografie:** Fraunces (patkové s optickými řezy, váha 300 až 400, kurziva pro akcenty) pro nadpisy a ceny, Manrope (bezpatkové) pro text a ovládání. Nadpisy sekcí jsou větší a klidnější, popisky velkými písmeny s prostrkáním.
- **Komponenty:** fotky bez rámečku s rádiusem 10 px, denní nabídka v jednom sloupci na celou šířku (jedna kytice, jeden pohled), chipy a stavové štítky hranatější, aktivní prvky tmavé místo růžových, admin s tmavou hlavičkou a růžovým upozorněním na novou objednávku.
- **Kdy je to správná volba:** chcete s novým webem zvednout vnímanou hodnotu a jednotně obsloužit i svatby a prémiové růže.
- **Riziko:** větší odklon od dnešní vizuality; Instagram a výlohy by se měly postupně sladit.

## Doporučení

Pokud nemáte záměr značku posouvat, doporučuji **směr A** pro zákaznickou část a z B převzít jednosloupcové zobrazení denní nabídky a klidnější admin. Pokud chcete růst v prémiovém segmentu, zvolte **B** celý. Kombinace je možná, protože obě verze sdílejí stejnou kostru obrazovek a liší se tokeny (barvy, písma, rádiusy) a několika rozvrženími.

## Co potřebuji k rozhodnutí

1. Volba směru A, B, nebo A s prvky B.
2. Zdrojový soubor loga (pokud existuje).
3. Případné připomínky k obrazovkám, které zapracuji před fází 1.
