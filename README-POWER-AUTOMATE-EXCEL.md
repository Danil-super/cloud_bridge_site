# SharePoint + Power Automate + Excel для заявок

Эта схема нужна для боевого сайта на VPS:

1. Клиент отправляет заявку с сайта.
2. Сервер отправляет уведомление в Telegram.
3. Сервер отправляет JSON в Power Automate webhook.
4. Power Automate добавляет новую строку в Excel-таблицу.
5. Менеджер работает с Excel в SharePoint Online в реальном времени.

## Почему не локальный Excel на VPS

Обычный `.xlsx` на сервере неудобен для одновременной работы. Для совместного редактирования используйте Excel-файл в SharePoint Online.

## Рекомендуемая схема для этого проекта

Используйте один общий файл в SharePoint, а не личный OneDrive сотрудника.

Рекомендуемые имена:

- SharePoint site: `Sales`
- Document library: `Leads`
- Excel file: `zayavki.xlsx`
- Excel table: `LeadsTable`

Так файл не будет привязан к личному аккаунту сотрудника и останется общим рабочим реестром для менеджеров.

## 1. Подготовьте Excel-файл

Создайте файл `zayavki.xlsx` в библиотеке документов SharePoint и оформите данные как таблицу.

Рекомендуемое имя таблицы: `LeadsTable`

Рекомендуемые колонки:

- `leadId`
- `createdAt`
- `source`
- `service`
- `name`
- `phone`
- `comment`
- `filesCount`
- `filesText`
- `status`
- `manager`
- `nextActionAt`
- `lastContactAt`
- `result`
- `isActual`

Рекомендуемые стартовые значения:

- `status`: `Новая`
- `isActual`: `Да`

Для колонок `status` и `isActual` удобно сделать выпадающие списки.

Пример значений для `status`:

- `Новая`
- `Связались`
- `Ждем клиента`
- `Выезд назначен`
- `Выполнено`
- `Отказ`
- `Неактуальна`

## 2. Создайте Flow в Power Automate

Подходит cloud flow с триггером:

- `When an HTTP request is received`

Дальше добавьте действие:

- `Excel Online (Business) -> Add a row into a table`

Файл должен лежать именно в `SharePoint Online`.

### Рекомендуемые параметры в действии Excel Online (Business)

- `Location`: сайт SharePoint
- `Document Library`: `Leads`
- `File`: `zayavki.xlsx`
- `Table`: `LeadsTable`

### Рекомендуемое соответствие полей

- `leadId` -> `leadId`
- `createdAt` -> `createdAt`
- `source` -> `source`
- `service` -> `service`
- `name` -> `name`
- `phone` -> `phone`
- `comment` -> `comment`
- `filesCount` -> `filesCount`
- `filesText` -> `filesText`
- `status` -> `status`
- `manager` -> `manager`
- `nextActionAt` -> `nextActionAt`
- `lastContactAt` -> `lastContactAt`
- `result` -> `result`
- `isActual` -> `isActual`

### Пример JSON schema для trigger

```json
{
  "type": "object",
  "properties": {
    "leadId": { "type": "string" },
    "createdAt": { "type": "string" },
    "source": { "type": "string" },
    "service": { "type": "string" },
    "name": { "type": "string" },
    "phone": { "type": "string" },
    "comment": { "type": "string" },
    "filesCount": { "type": "number" },
    "files": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "url": { "type": "string" }
        }
      }
    },
    "filesText": { "type": "string" },
    "status": { "type": "string" },
    "manager": { "type": "string" },
    "nextActionAt": { "type": "string" },
    "lastContactAt": { "type": "string" },
    "result": { "type": "string" },
    "isActual": { "type": "string" }
  },
  "required": [
    "leadId",
    "createdAt",
    "source",
    "service",
    "name",
    "phone",
    "comment",
    "filesCount",
    "filesText",
    "status",
    "manager",
    "nextActionAt",
    "lastContactAt",
    "result",
    "isActual"
  ]
}
```

### Рекомендуемая защита

Добавьте в flow проверку заголовка `X-Webhook-Secret`.

На стороне сайта этот заголовок отправляется автоматически, если задана переменная `POWER_AUTOMATE_SECRET`.

Дополнительно полезно:

- не давать публичный доступ к Excel-файлу;
- выдать доступ только менеджерам и руководителю;
- хранить URL webhook только на сервере в `.env`.

## 3. Настройте VPS

Заполните `.env`:

```env
PORT=4173
PUBLIC_BASE_URL=https://your-domain.ru

TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
ADMIN_PASSWORD=...

POWER_AUTOMATE_WEBHOOK_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/...
POWER_AUTOMATE_SECRET=your-long-random-secret
```

После этого перезапустите сервер.

## 4. Что делает сайт после настройки

- Telegram: мгновенное уведомление о новой заявке
- Power Automate: добавляет строку в Excel
- Локальный CSV: сохраняется как резервный архив в `data/leads-excel.csv`

## 5. Как вести учет менеджеру

Менеджер открывает один и тот же Excel-файл по ссылке и обновляет:

- `status`
- `manager`
- `nextActionAt`
- `lastContactAt`
- `result`
- `isActual`

Фильтры, которые особенно полезны:

- все `Новые`
- все `Ждем клиента`
- все, где `isActual = Да`
- все, где `nextActionAt` меньше сегодняшней даты

## Итоговая рекомендация

Для этого проекта используйте именно такую схему:

- сайт на VPS;
- Telegram для мгновенного уведомления;
- Power Automate для приема webhook;
- Excel-файл `zayavki.xlsx` в SharePoint Online;
- общая таблица `LeadsTable` для менеджеров.
