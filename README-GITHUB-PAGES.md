# Публикация демо через GitHub Pages

Этот проект содержит backend (`server.js`), который не работает в GitHub Pages.
В Pages будет опубликована только статическая демо-версия.

## Шаги

1. Создай новый репозиторий на GitHub, например `cloud-bridge-site`.
2. В локальной папке проекта выполни:

```bash
git init
git add .
git commit -m "Initial site for demo"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

3. На GitHub открой `Settings -> Pages` и убедись, что source = `GitHub Actions`.
4. Дождись завершения workflow `Deploy static site to Pages`.
5. Ссылка будет вида: `https://<USERNAME>.github.io/<REPO>/`

## Важно

В демо-режиме на Pages отправка формы заявок отключена (показывается уведомление).
Боевой прием заявок работает только при запуске серверной версии (`npm start`) на VPS/сервере.
