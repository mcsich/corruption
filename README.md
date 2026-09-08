# КОРРУПЦИЯ — playable v14.6

Готовая веб-сборка для GitHub → Railway.

## Что лежит в корне

- `index.html` — игра v14.6.
- `assets/` — 479 WebP-ассетов игры.
- `server.js` — минимальный статический Node.js сервер без сторонних зависимостей.
- `package.json` — Railway/Railpack определяет Node.js автоматически.
- `railway.json` — старт, healthcheck и restart policy.

## Локальный запуск

Нужен Node.js 20+.

```bash
npm start
```

Открыть: `http://localhost:3000`

Healthcheck: `http://localhost:3000/healthz`

## GitHub

Создай пустой репозиторий и загрузи **содержимое этой папки в корень репозитория**.

Пример через терминал:

```bash
git init
git add .
git commit -m "KORRUPTSIYA v14.6 playable"
git branch -M main
git remote add origin <URL_ТВОЕГО_GITHUB_REPO>
git push -u origin main
```

## Railway

1. `New Project` → `Deploy from GitHub repo`.
2. Выбери созданный репозиторий.
3. Railway использует Railpack и запускает `node server.js`.
4. База данных и дополнительные Variables не нужны.
5. После успешного deploy открой `Settings` → `Networking` → `Generate Domain`.
6. Открывай выданный `*.up.railway.app` URL — игра запускается с `/`.

Сервер слушает `process.env.PORT` и `0.0.0.0`, как требуется Railway.

## Важно

- Не переименовывай папку `assets/`: пути к изображениям уже зашиты в `index.html`.
- Сохранения игры хранятся в `localStorage` браузера конкретного домена. Если позже поменять Railway-домен, браузер будет считать это другим сайтом.
- Этот deploy-пакет намеренно не содержит QA-отчётов, spoiler matrices и внутренних файлов разработки.

## PWA icon / installation

This deploy package includes a complete PWA icon set and manifest:

- `manifest.webmanifest`
- `service-worker.js`
- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/icon-maskable-512.png`
- `icons/apple-touch-icon.png`

After deploying over HTTPS, Android/Chrome can install the game as a standalone PWA. On iPhone/iPad, Safari's **Add to Home Screen** uses the included Apple Touch Icon.
