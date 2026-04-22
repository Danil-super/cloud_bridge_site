# Google Sheets для заявок с сайта

Эта схема подходит для текущего проекта без Microsoft 365:

1. Клиент отправляет заявку с сайта.
2. Сервер отправляет уведомление в Telegram.
3. Сервер сохраняет локальный CSV-архив в `data/leads-excel.csv`.
4. Сервер отправляет JSON в Google Apps Script webhook.
5. Apps Script добавляет новую строку в Google Sheets.
6. Менеджер ведет статусы заявок в браузере в реальном времени.

## Структура таблицы

Лист должен называться:

- `Заявки`

Первая строка должна содержать колонки:

- `ID заявки`
- `Дата`
- `Время`
- `Имя`
- `Телефон`
- `Услуга`
- `Комментарий`
- `Файлы`
- `Источник`
- `Статус`
- `Ответственный`
- `Комментарий менеджера`
- `Дата обновления`

## Apps Script

Готовый скрипт уже лежит в проекте:

- [google-apps-script/leads-webhook.gs](/home/danil/Рабочий%20стол/project/cloud-bridge-site/google-apps-script/leads-webhook.gs)

Что нужно сделать:

1. Открыть таблицу Google Sheets.
2. Нажать `Расширения -> Apps Script`.
3. Удалить стартовый код.
4. Вставить содержимое `google-apps-script/leads-webhook.gs`.
5. Заменить `WEBHOOK_SECRET` на длинный случайный секрет.
6. Нажать `Deploy -> New deployment`.
7. Выбрать тип `Web app`.
8. В `Execute as` выбрать `Me`.
9. В `Who has access` выбрать `Anyone`.
10. Разрешить доступ и скопировать `Web app URL`.

## .env на сервере

Добавьте в `.env`:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec
GOOGLE_SHEETS_SECRET=replace-with-the-same-secret
```

После этого перезапустите сервис:

```bash
cd /home/ubuntu/cloud-bridge-site
sudo systemctl restart cloud-bridge-site
sudo systemctl status cloud-bridge-site --no-pager --full
```

## Что отправляет сервер

Сервер отправляет в webhook:

- `leadId`
- `createdAt`
- `date`
- `time`
- `secret`
- `name`
- `phone`
- `service`
- `comment`
- `filesCount`
- `files`
- `filesText`
- `source`
- `status`
- `manager`
- `managerComment`
- `updatedAt`

## Рекомендуемые статусы

- `Новая`
- `В работе`
- `Связались`
- `Выезд`
- `Успешно`
- `Отказ`
- `Недозвон`

## Важное замечание

Если позже будете переносить таблицу и скрипт на аккаунт заказчика, лучше после передачи:

1. Открыть Apps Script уже под новым владельцем.
2. Выпустить новый `Web app deployment`.
3. Обновить `GOOGLE_SHEETS_WEBHOOK_URL` на VPS.
