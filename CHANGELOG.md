# Changelog

The format is based on [Keep a Changelog].

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

### Internal

## [1.2.0] - 2026-03-05

### Added

- README.md с описанием проекта и инструкцией по развёртыванию
- Dockerfile для сборки и развёртывания (multi-stage: Node.js + nginx + Python)
- Конфигурация nginx для SPA с history mode
- Встроенный cron job для ежедневного обновления данных (midnight CET)

### Fixed

- Запуск Puppeteer от root в Docker (--no-sandbox)
- Права доступа на сгенерированные JSON-файлы (0644 вместо 0600)

## [1.1.0] - 2026-03-05

### Added

- Добавлен файл CHANGELOG.md
- Отображение времени матчей в мадридском часовом поясе (Europe/Madrid)
- Категория билета показывается только для домашних матчей первой команды
- Предупреждение при отправке заявки после рекомендованного дедлайна для матчей первой команды

### Changed

- Поле Telegram теперь необязательное
- Режим роутера Vue Router переключён с hash на history

## [1.0.0] - 2026-03-05

### Added

- Форма заявки на билет на базе Quasar/Vue 3
- Выбор матча из списка с автоматической загрузкой расписания
- Скрипт парсинга матчей (fetch-matches.py) с официального сайта
- Скрипт загрузки списка участников из NocoDB (fetch-members.py)
- Скрипт fetch-all.py для запуска обоих скриптов загрузки данных
- Выпадающий список участников фан-клуба с автодополнением
- Чекбоксы для фильтрации матчей: гостевые, женские, кантера
- Диалог «Как это работает?» с информацией о расписании и дедлайнах
- Отправка заявки в NocoDB с отображением ссылки для отслеживания статуса
- Сохранение данных формы в localStorage (кроме выбранного матча и категории билета)
- Автообновление данных о матчах и участниках при смене даты по CET
- Баннер ошибки загрузки матчей с кнопкой повтора
- Пререндеринг статического HTML после сборки (prerender.js)
- Favicon и иконки приложения
- Версия приложения в подвале из package.json
- Ссылка на GitHub в подвале
- Ссылка на FondoRuso.ru в шапке

<!-- Links -->

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0

<!-- Links to versions -->

[unreleased]: https://github.com/FondoRuso/ticket-request-form/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/FondoRuso/ticket-request-form/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/FondoRuso/ticket-request-form/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/FondoRuso/ticket-request-form/releases/tag/v1.0.0
