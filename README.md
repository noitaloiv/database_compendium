# Databaskompendium 2IS007 – plattform v1

Ett GitHub Pages-kompatibelt Jekyll-repository för ett webbaserat kompendium
till **Informationssystem A: Databaser (2IS007)**.

Plattformen använder Just the Docs 0.12.0 men lägger till en egen
informationsarkitektur, användarstyrt färgtema, svensk sökkonfiguration,
ämnesord och automatiska innehålls- och SQL-kontroller.

## Lokal start

Förutsättningar: Ruby, Bundler och Python 3.

```bash
bundle install
bundle exec just-the-docs rake search:init
python3 scripts/validate_site.py
python3 scripts/validate_sql.py
bundle exec jekyll serve
```

Öppna därefter `http://localhost:4000`.

Sökindexets källfil genereras av `search:init` och behöver inte skrivas för
hand. Checka in den tillsammans med `Gemfile.lock` när repositoryt har byggts
för första gången.

## Publicering

1. Skapa ett separat GitHub-repository.
2. Lägg filerna i repositoryts rot och gör en första commit.
3. Gå till **Settings → Pages → Build and deployment** och välj **GitHub
   Actions**.
4. Kör arbetsflödet *Build and publish compendium*.
5. Verifiera Pages-adressen innan en egen domän ansluts.

`url` och `baseurl` i `_config.yml` är avsiktligt tomma tills repository och
domän har valts. En riktig Studium-länk bör också läggas till först när rätt
kurstillfälle är känt.

## Centrala dokument

- [Plattformsplan](docs/planering/plattformsplan.md)
- [Curriculum blueprint](docs/planering/curriculum-blueprint.md)
- [Tekniskt vägval](docs/planering/tekniskt-vagval.md)
- [Författarguide](STYLEGUIDE.md)
- [Kapitel 1](docs/del-1-grunder/01-databaser-och-informationssystem.md)
- [Kapitel 2](docs/del-1-grunder/02-relationsmodellen.md)
- [Kapitel 3](docs/del-1-grunder/03-konceptuell-modellering.md)

Planeringsdokument och skript undantas från den publicerade studentwebbplatsen.

## Beslut före skarp lansering

- repositorynamn och domän;
- slutlig språkpolicy för körbara schemaidentifierare;
- slutlig licens och namngiven rättighetsinnehavare;
- eventuell utökad svensk språkbehandling i sökningen efter pilotprov;
- webbläsar- och tillgänglighetskontroll av en komplett Jekyll-byggning.

Ingen slutlig innehållslicens har lagts in i denna version. Det förhindrar att
ett preliminärt val oavsiktligt blir ett publicerat tillstånd.

