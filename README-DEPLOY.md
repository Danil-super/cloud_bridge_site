# Обновление сайта на VPS

Этот проект уже настроен на VPS как `systemd`-сервис:

- проект: `/home/ubuntu/cloud-bridge-site`
- сервис: `cloud-bridge-site`

## Что нельзя трогать при обновлениях

На сервере есть рабочие данные, которые не должны затираться:

- `.env`
- `data/site-config.json`
- `data/leads-excel.csv`
- `uploads/`

Они не должны обновляться из GitHub.

## Безопасный способ обновления

На VPS используйте скрипт:

```bash
cd /home/ubuntu/cloud-bridge-site
./scripts/deploy-update.sh
```

Что делает скрипт:

1. Проверяет текущую ветку и забирает свежий `origin/main`
2. Делает только `fast-forward` обновление
3. Ставит production-зависимости через `npm install --omit=dev`
4. Перезапускает `cloud-bridge-site`
5. Показывает статус сервиса

## Если нужно выполнить вручную

```bash
cd /home/ubuntu/cloud-bridge-site
git pull --ff-only origin main
npm install --omit=dev
sudo systemctl restart cloud-bridge-site
sudo systemctl status cloud-bridge-site --no-pager --full
```

## Полезные команды

Логи приложения:

```bash
sudo journalctl -u cloud-bridge-site -n 100 --no-pager
```

Перезапуск nginx:

```bash
sudo systemctl reload nginx
sudo nginx -t
```

## Важное правило

Не используйте на сервере:

- `git reset --hard`
- `git clean -fd`
- `git checkout -- .`

если не уверены, что не удалите рабочие файлы заказчика.
