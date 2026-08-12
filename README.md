# Contractgenerator Digi-Mee

Windows-applicatie waarmee medewerkers van Digi-Mee (Den Ideal vzw) uitleen-
contracten invullen en als PDF afdrukken. De gegevens van het toestel komen uit
Lend Engine, zodat merk, model en prijs niet handmatig ingetypt hoeven te worden.

---

## De applicatie installeren

1. Vraag het installatiebestand `ContractGenerator-Setup.exe` op bij de
   verantwoordelijke, of bouw het zelf (zie *De applicatie bouwen*).
2. Dubbelklik op het bestand. De installatie gebeurt automatisch en de app start
   daarna zelf op.
3. Windows kan waarschuwen dat de uitgever onbekend is. Dat komt doordat de app
   niet digitaal ondertekend is. Kies **Meer informatie** en daarna
   **Toch uitvoeren**.

Er is ook een versie zonder installatie: pak
`Contract Generator-win32-x64-1.0.0.zip` uit en dubbelklik op
`contract-generator.exe`. Handig als je geen beheerdersrechten hebt of de app op
een USB-stick wil meenemen.

### Bijwerken naar een nieuwe versie

Voer het nieuwe installatiebestand gewoon opnieuw uit. De vorige versie wordt
vervangen. Je API-sleutel en instellingen blijven behouden.

---

## De API-sleutel instellen

De app haalt gegevens over toestellen op uit Lend Engine. Daarvoor is één keer
een API-sleutel nodig. Zonder sleutel werkt de app verder gewoon, alleen de
knoppen met het vergrootglas (🔎) kunnen dan niets opzoeken.

**De sleutel invoeren:**

1. Start de app.
2. Druk op **Ctrl** + **,** (de komma-toets). Er verschijnt een venster met de
   titel *"U heeft het API-key beheer venster geopend."*
3. Plak de sleutel in het invoerveld.
4. Klik op **Accepteren**.

De sleutel wordt bewaard op de computer zelf en hoef je maar één keer in te
geven. Wil je hem later wijzigen, doorloop dan dezelfde stappen opnieuw.

**Een sleutel aanmaken:** dat gebeurt in Lend Engine zelf, onder
`https://digi-mee.denideal.be/admin` bij de API-instellingen. Vraag dit aan
iemand met beheerdersrechten.

> Krijg je de melding *"API key rejected. It may have expired."*? Dan is de
> sleutel verlopen of ingetrokken. Maak een nieuwe aan en voer die opnieuw in.

---

## Gegevens en teksten aanpassen

In de map `instellingen` staan de bestanden die je zonder programmeerkennis kan
aanpassen. Elk bestand heeft bovenaan uitleg staan, en in
[`instellingen/LEESMIJ.txt`](instellingen/LEESMIJ.txt) staat een overzicht.

| Bestand | Wat je ermee aanpast |
| --- | --- |
| `organisatie.json` | Naam, adres, e-mailadres, rekeningnummer, ondertekenaar |
| `voorwaarden.md` | De voorwaarden en afspraken onderaan het contract |
| `logo.png` | Het logo bovenaan het contract |

Open de bestanden met Kladblok of een andere teksteditor. Sluit daarna de app en
start ze opnieuw op.

> **Let op:** het contract is een juridisch document dat klanten ondertekenen.
> Overleg met de verantwoordelijke voor je de voorwaarden inhoudelijk wijzigt.

Als er een fout in een bestand staat, toont de app een melding met de naam van
het bestand en wat er mis is. Zet in dat geval de vorige versie terug.

> Deze bestanden zitten momenteel mee verpakt in de applicatie. Om ze op een
> geïnstalleerde computer aan te passen moet de app opnieuw gebouwd worden. Wie
> ze rechtstreeks in de installatiemap wil kunnen bewerken, vindt onderaan bij
> *Voor ontwikkelaars* hoe dat aangezet wordt.

---

## Prijzen

De prijs per periode van 6 maanden en de cirkelwaarde komen uit Lend Engine, uit
het toestel dat bij het T-nummer hoort. Ze staan dus **niet** in dit programma:
wil je een prijs wijzigen, doe dat in Lend Engine.

Vink **Sociaal tarief** aan voor klanten met een verhoogde tegemoetkoming. De
prijs per 6 maanden wordt dan automatisch één derde van de normale prijs. De
cirkelwaarde verandert niet.

---

## Een contract maken

1. Vul de gegevens van de klant in.
2. Vul het T-nummer van het toestel in en klik op 🔎 om merk en model op te
   halen.
3. Klik op 🔎 naast *Prijs per 6 maanden* om de prijs op te halen.
4. Klik onderaan op verzenden. Kies een map en de PDF wordt daar opgeslagen en
   meteen geopend.

---

## Voor ontwikkelaars

De app is gebouwd met [Electron](https://www.electronjs.org/) en heeft
Node.js 22.12 of nieuwer nodig.

```sh
npm install
npm start      # de app starten
npm test       # de tests draaien
npm run make   # installatiebestand en zip bouwen in out/make
```

**Hoe een contract tot stand komt:** het formulier in `src/index.html`
verzamelt de gegevens. Bij verzenden opent het hoofdproces een verborgen venster
op `src/contract/contract.html`, vult dat in en exporteert het met
`webContents.printToPDF`. Contracten zijn dus gewoon HTML en CSS.

De opmaak van een contract wijzig je in `src/contract/contract.html` en
`src/contract/style.css`. De teksten en organisatiegegevens staan bewust apart
in `instellingen/` en worden ingeladen via de attributen `data-org`,
`data-fill`, `data-visible` en `data-markdown`.

**Instellingen bewerkbaar maken na installatie:** zet in `forge.config.js`
`asar: true` om naar `asar: { unpack: 'instellingen/**' }`. De map blijft dan als
gewone bestanden naast de applicatie staan in plaats van in het archief, zodat ze
zonder herbouw aangepast kan worden.

**Enkel betalende contracten:** de niet-betalende (UiTPAS) en addendum-stromen
zijn uitgeschakeld, niet verwijderd. Zie de opmerking bij het veld
`Type contract` in `src/index.html` om ze terug te activeren.
