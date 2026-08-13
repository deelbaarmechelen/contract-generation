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

De app haalt gegevens over toestellen op uit Lend Engine. Daarvoor is een
**refresh token** nodig. Zonder token werkt de app verder gewoon, alleen de
knoppen met het vergrootglas (🔎) kunnen dan niets opzoeken.

**De token invoeren:**

1. Start de app.
2. Druk op **Ctrl** + **,** (de komma-toets). Er verschijnt een venster met de
   titel *"U heeft het API-sleutel beheer venster geopend."*
3. Plak de refresh token in het invoerveld.
4. Klik op **Accepteren**.

De token wordt bewaard op de computer zelf. Lend Engine geeft twee soorten
sleutels: een *access token* die ongeveer een uur geldig is, en een
*refresh token* die ongeveer een maand meegaat. **Geef de refresh token in** —
de app haalt daarmee zelf telkens een verse access token op.

**Een token aanmaken:** dat gebeurt in Lend Engine zelf, onder
`https://digi-mee.denideal.be/admin` bij de API-instellingen. Vraag dit aan
iemand met beheerdersrechten.

> Krijg je de melding *"De API-sleutel is verlopen of ongeldig"*? Dan is de
> refresh token ouder dan een maand of ingetrokken. Maak een nieuwe aan en voer
> die opnieuw in. Reken erop dat dit ongeveer maandelijks nodig is.

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

Het vinkje staat bovenaan bij de klantgegevens, omdat het gekend moet zijn
voordat de prijs opgehaald wordt. Vink je het pas achteraf aan, dan verandert de
al ingevulde prijs **niet** vanzelf — het veld *Prijs per 6 maanden* geeft dan
een waarschuwing dat het bedrag niet meer bij het tarief past, met het bedrag dat
het wél zou moeten zijn. Klik opnieuw op 🔎 bij de assettag, of pas het bedrag
met de hand aan.

Een prijs die je zelf intypte wordt niet gecontroleerd: de app weet dan niet wat
het bedrag zou moeten zijn.

---

## Een contract maken

1. Zoek de klant op in Lend Engine en kopieer de link uit de adresbalk van hun
   pagina. Plak die bovenaan bij *Lend Engine-link* en klik op 🔎.
2. Klantnummer, naam, adres, e-mailadres en telefoonnummer worden ingevuld.
   Kijk na of het de juiste klant is.
3. Vink *Sociaal tarief* aan als de klant een verhoogde tegemoetkoming heeft.
   Doe dat vóór stap 5: het vinkje wordt gelezen op het moment dat je de prijs
   opvraagt.
4. Vul de overige gegevens van de klant aan.
5. Vul het T-nummer van het toestel in en klik op 🔎. Merk, model, prijs per
   6 maanden en cirkelwaarde worden in één keer ingevuld.
6. Klik onderaan op verzenden. Kies een map en de PDF wordt daar opgeslagen en
   meteen geopend.

Elke opzoeking heeft één 🔎-knop, en die staat telkens naast het veld dat je
zelf invult: de link bij de klant, het T-nummer bij het toestel. De velden die
daarmee ingevuld worden, hebben zelf geen knop meer.

De link naar de klant komt zelf niet op het contract; ze dient enkel om de
gegevens op te halen.

> **Waarom een link en geen klantnummer?** De API van Lend Engine kan niet op
> klantnummer zoeken. Ze kan enkel zoeken op e-mailadres, voornaam, achternaam
> en aanmaakdatum, of één klant ophalen via het nummer in de link. Daarom vult
> de app het klantnummer net andersom in: het komt uit de opgehaalde klant.

> **Controleer altijd de ingevulde naam.** Omdat er op nummer wordt opgezocht,
> geeft een verkeerd geplakte link gewoon een *andere* klant terug in plaats van
> een foutmelding.

Plak je per ongeluk de link van een toestel of een uitlening, dan meldt de app
dat de link niet naar een klant wijst. De app gebruikt dat nummer dus niet: elk
nummer bestaat ook als klantnummer, dus anders zou er zomaar een willekeurige
andere klant ingevuld worden.

De opzoeking overschrijft nooit een veld dat al ingevuld is met een leeg
antwoord. Wat in Lend Engine leeg staat, blijft dus staan zoals jij het typte.

**Adressen** staan in Lend Engine op één lijn. De app splitst ze in straatnaam,
huisnummer en bus. De gangbare Belgische schrijfwijzen worden herkend:
`48 bus 3`, `48 bus3`, `48 b 3`, `48 bs 3`, `48/3` en `48 - 3`. Een losse letter
achter het nummer (`48A`) hoort bij het huisnummer, niet bij de bus.

**E-mailadressen** worden in Lend Engine bewust verminkt (`naam_@_domein.be`,
`naam_at_domein.be`) zodat Lend Engine de klant geen mails stuurt. Op het
contract hoort het echte adres te staan, dus de app zet de `@` terug. Adressen
die al gewoon geschreven zijn, blijven ongemoeid — ook als er toevallig "at" in
staat, zoals *nathalie@…*.

> Staat er in Lend Engine bij de klant een *Gestructureerde Mededeling*, dan
> wordt die overgenomen. Anders blijft de mededeling die de app zelf berekent
> staan.

**De gestructureerde mededeling** wordt met de hand ingetypt in Lend Engine en
staat er dus in allerlei schrijfwijzen: `+++123/4567/89012+++`, `123/4567/89012`,
`***123/4567/89012***`, met spaties, of gewoon twaalf cijfers na elkaar. De app
kijkt enkel naar de cijfers en zet de `+++` en `/` zelf terug.

Staan er geen twaalf cijfers, dan wordt het veld níét ingevuld: een half of fout
overgetypt nummer laat de app liever open dan het als gecontroleerd op het
contract te zetten. Het controlegetal wordt daarna nog door het formulier zelf
nagerekend.

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
