# Otázky, které mě blokují

Rozdělené podle toho, kdy odpověď potřebuji. Kde to jde, navrhuji výchozí předpoklad. Když odpověď nepřijde, postupuji podle předpokladu a hodnotu nechám upravitelnou v adminu.

## Blokuje fázi 1 (katalog, admin nabídky, sklad)

1. **Nabídka a sklad po prodejnách.** Má každá prodejna vlastní denní nabídku hotových kytic (kytice fyzicky leží buď na Sedláčkově, nebo na Hamburku), zatímco kytice na míru, růže a doplňky jsou společné? Předpoklad: ano, přesně takhle.
2. **Rozváží obě prodejny?** Nebo rozvoz jede vždy z jedné? Předpoklad: obě, systém vybere bližší prodejnu se skladem, obsluha může změnit.
3. **Otevírací doba.** Web říká Sedláčkova Po–Ne 8–18, Hamburk Po–So 8–18 a Ne 9–18. Wolt říká 8:30–17:30. Co platí? Předpoklad: údaje z webu.
4. **Pojmenování kytic.** Dnes jsou produkty „kytka 207“. Chcete při přidávání z mobilu psát krátký název, nebo stačí automatické „Kytice 207“ a název je nepovinný? Předpoklad: název nepovinný, systém dosadí pořadové číslo.
5. **Účty a vlastnictví.** Založím projekty na Vercel (hosting), Neon (Postgres), Vercel Blob (fotky). Na jaký e-mail mají být účty, aby zůstaly majetkem firmy? Doménu kytkyplzen.com spravuje kdo (kde je DNS)? Potřebuji to i pro odesílání e-mailů z vlastní domény.
6. **Logo.** Mám jen SVG ze Shoptetu (300 × 100 px). Existuje zdrojový soubor loga a případně brand manuál? Pokud ne, pracuji s tím, co je.

## Blokuje fázi 2 (objednávka, doprava, platby, doklady)

7. **Sloty.** Jak dlouhý má být slot (1 h, 2 h?), kolik rozvozů zvládnete za slot, a do kolika hodin lze objednat na dnešek? Předpoklad do seed dat: sloty 2 h (10–12, 12–14, 14–16, 16–18), kapacita 4 na slot a prodejnu, uzávěrka 3 h před začátkem slotu, odběr v otevírací době po 30 minutách.
8. **Doprava, výchozí režim.** Na webu dnes běží 35 Kč/km do 20 km od Sedláčkovy. Chcete začít s tím (režim „za km“), nebo s pásmy? Doprava zdarma od nějaké částky? Předpoklad: režim „za km“ se současnými hodnotami, pásma připravená jako druhá ukázková tabulka, doprava zdarma vypnutá.
9. **Jak objednáváte taxi.** Volá obsluha dispečink, nebo používá aplikaci? Platí se taxi hotově z kasy, nebo na fakturu? Ovlivní to jen pole „skutečná cena taxi“ a to, zda chcete evidovat i jméno taxislužby.
10. **Stripe účet.** Máte Stripe účet, nebo mám založit nový v testovacím režimu na firemní e-mail? Apple Pay vyžaduje ověření domény, to uděláme až při spuštění.
11. **Sazby DPH.** Potřebuji potvrzení od účetní, jaké sazby používáte dnes: řezané květiny, hrnkové rostliny, čokoláda, plyšák, váza, doprava, balení. Od roku 2024 jsou podle mé znalosti řezané květiny v základní sazbě 21 %, potraviny 12 %. Nejsem daňový poradce, sazby budou nastavitelné na každém produktu, ale výchozí hodnoty chci mít správně.
12. **Doklady.** Jaký formát číselné řady (například 2026-0001 nebo 260001)? Jedna řada pro všechny zdroje, nebo zvlášť pro web a prodejnu? Má se daňový doklad vystavit až po zaplacení (navrhuji ano, u B2C online platby je to standard)? Jaký účetní software účetní používá (Pohoda, Money, iDoklad), ať připravím export ve správném tvaru?
13. **Platba na místě.** U objednávek z telefonu a z prodejny s platbou na místě: stačí stav „zaplatí na místě“ a doklad vystaví pokladna, nebo má doklad vystavit i náš systém? Předpoklad: pokladna, náš systém jen eviduje „zaplaceno na místě“.
14. **Storno.** Do kdy může zákazník objednávku zrušit a dostat peníze zpět? Předpoklad: do uzávěrky slotu zdarma, potom jen po domluvě (obsluha vrátí ručně z adminu).
15. **Vzkaz na kartičku.** Limit znaků a typy kartiček? Předpoklad: 150 znaků, typy „klasická“, „narozeniny“, „výročí“, „kondolence“, „bez kartičky“.
16. **Poskytovatelé e-mailu a SMS.** Navrhuji Resend pro e-mail (vlastní doména) a pro SMS českého poskytovatele s API (například SMSbrána nebo GoSMS, cena asi 1 Kč za SMS). Máte preferenci? Ověřovací SMS u věrnostního programu něco stojí, počítejte s tím.

## Blokuje fázi 3 a 4 (Instagram, řidič, věrnost)

17. **Zpráva pro zákazníka na Instagramu.** Posílá se ručně kopírováním (ano podle zadání). Chcete zprávu i ve druhé variantě pro telefon (SMS s odkazem)? Předpoklad: ano, obě.
18. **Odkaz pro řidiče.** Jak dlouho má platit (předpoklad: do konce dne doručení plus 2 hodiny)? Má řidič vidět jméno příjemce? Předpoklad: jméno a telefon ano, cenu a vzkaz ne.
19. **Věrnostní program.** Výchozí procento zpět v bodech (předpoklad 5 %, 1 bod = 1 Kč), expirace bodů (předpoklad 12 měsíců), minimální uplatnění (předpoklad 100 bodů), VIP úrovně podle roční útraty (předpoklad: Stříbrná od 5 000 Kč, Zlatá od 15 000 Kč, vyšší procento). Jsou to jen ukázky, vše půjde změnit.
20. **Pokladna v prodejnách.** Až budete vědět, jaká je (značka a zda má API nebo export), napojím adaptér. Do té doby je režim Prodejna ruční.

## Blokuje fázi 5 (migrace, spuštění)

21. **Shoptet.** Chcete přenést historii objednávek a zákazníků, nebo stačí produkty a fotky? Předpoklad: jen produkty, fotky a texty; historie zůstane v exportu Shoptetu.
22. **Jazyky.** Instagram bio je i anglicky. Stačí čeština, s přípravou na angličtinu později? Předpoklad: ano.
23. **Texty.** Obchodní podmínky a GDPR dodáte, platí. Potřebuji je nejpozději před spuštěním plateb, stávající texty ze Shoptetu mezitím použiji jako zástupné.
24. **Měření.** Máte GA4 property a Meta Pixel / Business Manager? Pokud ne, založíme při spuštění.
