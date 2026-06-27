// changelogs-data.js
// Ten plik zarządza listą changelogów wyświetlanych na stronie głównej.
// Dodaj nowy wpis przy każdej wersji i umieść plik w folderze changelogs/
// Wygeneruj go automatycznie używając generator.html → przycisk "data.js"

const CHANGELOGS_DATA = [
  {
    "version": "1.2.0",
    "date": "2024-11-15",
    "title": "Wielka Aktualizacja Mapy",
    "excerpt": "Przeprojektowaliśmy system generowania mapy od podstaw, dodaliśmy nowe biomy, naprawiliśmy ponad 30 błędów i znacząco zoptymalizowaliśmy renderowanie terenu.",
    "tags": ["feat", "fix", "perf"],
    "heroImage": "",
    "file": "1.2.0.html"
  },
  {
    "version": "1.1.0",
    "date": "2024-09-03",
    "title": "Aktualizacja Ekwipunku",
    "excerpt": "Nowy system ekwipunku z przeciąganiem i upuszczaniem, porównywanie przedmiotów i 15 nowych typów broni.",
    "tags": ["feat", "fix"],
    "heroImage": "",
    "file": "1.1.0.html"
  },
  {
    "version": "1.0.1",
    "date": "2024-08-12",
    "title": "Patch — Poprawki Startu",
    "excerpt": "Poprawki krytycznych błędów zgłoszonych tuż po premierze. Naprawiono crash przy tworzeniu nowej postaci.",
    "tags": ["fix", "patch"],
    "heroImage": "",
    "file": "1.0.1.html"
  },
  {
    "version": "1.0.0",
    "date": "2024-08-01",
    "title": "Premiera Gry!",
    "excerpt": "Witaj w Moja Gra! Pierwsze oficjalne wydanie po dwóch latach developmentu.",
    "tags": ["feat"],
    "heroImage": "",
    "file": "1.0.0.html"
  }
];
