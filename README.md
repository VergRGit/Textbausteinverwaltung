# Textbausteinverwaltung – Vertikaler Slice (lokal-first)

Dieses Repository enthält einen lauffähigen Prototypen der modularen Zielarchitektur für die Migration einer Legacy-Single-File-App.

## Starten

```bash
npm install
npm run dev
```

Dann im Browser öffnen: `http://localhost:5173`.

## Bereits umgesetzt

- App-Shell mit linker Bibliothek, mittlerem Arbeitsbereich, rechtem Inspektor
- Tree-/List-Navigation mit Suche und persistiertem Expand-Status
- Editor-Shell für Vorlage/Baustein-Metadaten
- Wizard für eine ausgewählte Vorlage mit gruppierten Eingabefeldern
- Vorschau mit Platzhalter-Rendering + Derived-Variablen
- IndexedDB-Persistenz (Daten + UI-Präferenzen)
- JSON-Import/-Export Grundgerüst
- Validierungs-Grundlage

## Struktur

```text
src/
  app/
  components/
  db/
  engine/
  sample/
  state/
  styles/
  types/
  validation/
```
