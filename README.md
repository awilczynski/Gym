# Dziennik Treningowy (PWA)

Prosta aplikacja webowa (PWA) zastępująca papierowy dziennik treningowy. Mobile-first,
działa offline, **bez logowania, bez backendu, bez kont**. Dane trzymane lokalnie na
telefonie (`localStorage`), z eksportem/importem JSON jako kopią zapasową.

## Funkcje

- **12-tygodniowy plan**, 5 sesji (PUSH A, PULL A, NOGI, PUSH B, PULL B) z konkretnymi
  ćwiczeniami i zakresami serii/powtórzeń.
- **Zapis treningu**: ciężar (kg) i powtórzenia per seria, per tydzień (1–12).
  Dodawanie/usuwanie serii w danym dniu (`+ seria` / `– seria`).
- **Auto-zapis** do `localStorage` (debounce ~500 ms) — żadnego przycisku „Zapisz”.
- **Poprzedni tydzień**: przy każdym ćwiczeniu rozwijana tabelka z wartościami z tygodnia T-1.
- **Progresja**: tabela wszystkich tygodni dla wybranego ćwiczenia + prosty wykres
  (top set / tydzień, natywny `<canvas>`, bez bibliotek).
- **Eksport / import JSON** — kopia zapasowa i przenoszenie danych między urządzeniami.
- **Notatki** per ćwiczenie (np. „ból barku”, „RIR 1”).
- **Oznaczenia ⚠** dla ćwiczeń o wysokim ciśnieniu śródpiersiowym (suwnica, hip thrust).
- **Supersety** wizualnie zgrupowane (Push B i Pull B — ostatnie dwie pozycje).
- **PWA**: `manifest.json` + service worker (offline po pierwszym wczytaniu),
  „Dodaj do ekranu początkowego”.
- **Dark mode** domyślnie, wysoki kontrast, duże targety dotykowe.

## Struktura plików

```
index.html        # struktura + bottom nav
style.css         # dark mode, mobile-first
app.js            # cała logika: plan (seed), stan, render, storage, export/import, wykres
manifest.json     # PWA manifest
sw.js             # service worker (cache statyków, offline)
icons/            # ikony PWA (192, 512, 512-maskable)
tools/make_icons.py  # generator ikon (pure Python, bez zależności)
```

## Jak uruchomić na telefonie

Aplikacja to statyczne pliki — wystarczy lokalny serwer HTTP:

```bash
# Opcja A
python3 -m http.server 8000

# Opcja B
npx serve .
```

1. Uruchom serwer na komputerze **w tej samej sieci WiFi** co telefon.
2. Sprawdź adres IP komputera w sieci lokalnej (np. `192.168.0.12`):
   - macOS/Linux: `ip addr` lub `ifconfig`
   - Windows: `ipconfig`
3. Na telefonie wejdź na `http://<IP-komputera>:8000`
   (przykład: `http://192.168.0.12:8000`).
4. W przeglądarce (Safari/Chrome) wybierz **„Dodaj do ekranu początkowego”** —
   aplikacja będzie otwierać się jak natywna (`display: standalone`).

### ⚠️ Ważne o danych (origin)

`localStorage` jest przypisany do **origin** (adres + port). Dlatego:

- **Zawsze otwieraj aplikację z tego samego adresu.** Jeśli zmieni się IP komputera,
  stary adres zachowa dane, ale nowy zacznie z pustym stanem.
- Aby przenieść dane: **Eksportuj JSON** na starym adresie → **Importuj JSON** na nowym.
- Rób eksport co jakiś czas (np. raz na tydzień) — czyszczenie danych przeglądarki
  albo zmiana telefonu kasuje `localStorage`.

## Backup: eksport / import

- **⬇︎ (Eksportuj dane)** w nagłówku → pobiera `dziennik-treningowy-backup-RRRR-MM-DD.json`
  z całym stanem (logi + ustawienia).
- **⬆︎ (Importuj dane)** → wybór pliku `.json`, walidacja struktury, **potwierdzenie
  przed nadpisaniem**, przeładowanie widoku.

## Model danych (localStorage)

- `workout-log-v1` — logi: `log[sessionId][week][exerciseId] = { sets: [{weight, reps}], note }`
- `workout-settings-v1` — `{ currentWeek }` (1–12)

## Regeneracja ikon (opcjonalnie)

```bash
python3 tools/make_icons.py
```

Generuje ikony z prostym glifem hantli na ciemnym tle — bez żadnych zależności.

## Aktualizacje (cache-busting)

Service worker cache'uje statyki. Po zmianie plików **podbij** `CACHE_VERSION` w `sw.js`
(`v1` → `v2` …), żeby wymusić odświeżenie cache na telefonie.

## Kryteria akceptacji (spełnione)

- Wpisanie ciężarów dla całej sesji w danym tygodniu i utrzymanie ich po zamknięciu
  przeglądarki (ten sam adres).
- Przejście do kolejnego tygodnia → puste pola + podgląd tygodnia T-1.
- Eksport → wyczyszczenie danych → import → wszystkie wpisy wracają.
- Wyraźne ⚠ przy „Suwnica (leg press)” i „Hip thrust maszyna”.
- Wizualne grupowanie supersetów w Push B i Pull B.
