# Парсер событий с официального сайта Real Madrid

## Обзор

Парсер получает данные о матчах Real Madrid через открытый **GraphQL API** официального сайта (Adobe AEM). API не требует авторизации, но не поддерживает CORS — вызов из браузера на стороннем домене невозможен. Поэтому парсер запускается отдельно (cron/CI), формирует **статичный JSON-файл**, который размещается рядом с WEB-формой.

---

## API-эндпоинт

### URL

```
https://publish.realmadrid.com/graphql/execute.json/realmadridmastersite/diaryV2;fromDate={FROM};toDate={TO};alang=/content/dam/portals/realmadrid-com/es-es/sports/
```

Домен `config.realmadrid.com` — кешированная версия того же API.

### Параметры

| Параметр   | Формат                         | Описание                                |
|------------|--------------------------------|-----------------------------------------|
| `fromDate` | ISO 8601 (`2026-03-01T00:00:00.000Z`) | Начало диапазона (включительно) |
| `toDate`   | ISO 8601 (`2026-04-30T23:59:00.000Z`) | Конец диапазона (включительно)  |
| `alang`    | Путь AEM-контента              | Языковая ветка. Всегда использовать `es-es` (нижний регистр!) |

> **Важно:** Язык в пути `alang` должен быть в нижнем регистре (`es-es`), а не `es-ES`. При верхнем регистре API возвращает пустой результат.

### Разделители параметров

В URL параметры разделяются символом `;` (точка с запятой). При URL-кодировании `;` записывается как `%3B`.

### Метод

`GET` — никаких заголовков авторизации не требуется.

### Пример запроса

```
GET https://publish.realmadrid.com/graphql/execute.json/realmadridmastersite/diaryV2%3BfromDate=2026-03-01T00:00:00.000Z%3BtoDate=2026-04-30T23:59:00.000Z%3Balang=/content/dam/portals/realmadrid-com/es-es/sports/
```

### Дополнительная фильтрация (опциональная)

К URL можно добавить параметр `filterSquad` для фильтрации по типу команды:

```
;filterSquad={"tag":{"_expressions":[{"_operator":"CONTAINS","value":"realmadrid-com:sports/futbol/primer-equipo-masculino/"}],"_logOp":"OR"}}
```

Значение `filterSquad` — URL-кодированный JSON. Этот параметр можно использовать для получения данных только по нужным командам на стороне API, но можно фильтровать и на стороне парсера.

---

## Структура ответа API

```json
{
  "data": {
    "matchList": {
      "items": [ /* массив матчей */ ]
    },
    "eventList": {
      "items": [ /* массив событий (не матчей) — для нас не интересны */ ]
    }
  }
}
```

### Поля матча (`matchList.items[]`)

| Поле API                      | Тип       | Описание                                                   |
|-------------------------------|-----------|------------------------------------------------------------|
| `squad.squadLabel`            | `string`  | Тип команды, напр. `"Fútbol · Primer Equipo"`             |
| `squad.tag`                   | `string[]`| Теги для фильтрации                                       |
| `homeTeam.name`               | `string`  | Название домашней команды                                  |
| `awayTeam.name`               | `string`  | Название гостевой команды                                  |
| `competition.name`            | `string`  | Название турнира (`"La Liga"`, `"Champions League"`)       |
| `venue`                       | `object\|null` | Стадион. `null` если не указан                        |
| `venue.name`                  | `string`  | Название стадиона (`"Bernabéu"`)                           |
| `playAsHome`                  | `boolean` | Играет ли Real Madrid дома                                 |
| `dateTime`                    | `string`  | Дата и время в UTC ISO 8601 (`"2026-03-11T20:00:00.000Z"`)|
| `isScheduled`                 | `boolean` | Подтверждены ли дата и время                               |
| `status`                      | `string`  | Статус: `"finished"`, `"live"`, `"upcoming"` и др.         |
| `slug`                        | `string`  | Слаг для URL на сайте                                      |
| `homeTeamScoreTotal`          | `string`  | Счёт домашней команды (или `"-"`)                          |
| `awayTeamScoreTotal`          | `string`  | Счёт гостевой команды (или `"-"`)                          |
| `hideMatchCalendar`           | `boolean` | Скрыт ли матч в календаре                                  |
| `ticketsLink`                 | `string\|null` | Ссылка на покупку билетов                             |

---

## Маппинг: поля API → выходная структура

### Выходная структура (один матч)

```json
{
  "type": "Primer Equipo",
  "team": "Real Madrid",
  "vs": "Manchester City",
  "tournament": "Champions League",
  "stadium": "Bernabéu",
  "atHome": true,
  "date": "2026-03-11T21:00:00+01:00",
  "isDateConfirmed": true
}
```

### Правила маппинга

| Выходное поле     | Источник в API                    | Преобразование                                           |
|-------------------|-----------------------------------|----------------------------------------------------------|
| `type`            | `squad.squadLabel`                | Отсечь префикс `"Fútbol · "`. Например: `"Fútbol · Primer Equipo"` → `"Primer Equipo"`, `"Fútbol · Cantera · Castilla"` → `"Cantera"` (см. таблицу ниже) |
| `team`            | `homeTeam.name` или `awayTeam.name` | Если `playAsHome === true` → `homeTeam.name`, иначе → `awayTeam.name` (это команда Real Madrid) |
| `vs`              | `homeTeam.name` или `awayTeam.name` | Если `playAsHome === true` → `awayTeam.name`, иначе → `homeTeam.name` (это соперник) |
| `tournament`      | `competition.name`                | Без изменений                                            |
| `stadium`         | `venue.name`                      | Без изменений                                            |
| `atHome`          | `playAsHome`                      | Без изменений                                            |
| `date`            | `dateTime`                        | Пересчитать из UTC в `Europe/Madrid` (CET/CEST), вывести в ISO 8601 с указанием смещения (см. раздел «Даты и временные зоны») |
| `isDateConfirmed` | `isScheduled`                     | Без изменений                                            |

### Определение `type`

Поле `squad.squadLabel` имеет формат: `"Вид спорта · Категория · Подкатегория"`.

Для фильтрации и маппинга `type`:

| `squad.squadLabel` (начало)             | `type` в выходной структуре   |
|-----------------------------------------|-------------------------------|
| `"Fútbol · Primer Equipo · Femenino"`   | `"Primer Equipo · Femenino"` |
| `"Fútbol · Primer Equipo"`              | `"Primer Equipo"`            |
| `"Fútbol · Cantera Femenina"`           | `"Cantera Femenina"`         |
| `"Fútbol · Cantera"`                    | `"Cantera"`                  |

> **Порядок проверки важен!** Сначала проверять более специфичные варианты (`"Primer Equipo · Femenino"` перед `"Primer Equipo"`, `"Cantera Femenina"` перед `"Cantera"`), потому что `"Fútbol · Primer Equipo · Femenino"` содержит подстроку `"Fútbol · Primer Equipo"`.

---

## Правила фильтрации

Из результатов API **исключить** матчи, которые:

1. **Не начинаются с `"Fútbol"`** — отсеивает баскетбол и другие виды спорта
2. **Не попадают ни в один из перечисленных `type`** — отсеивает, например, `"Baloncesto · Primer Equipo"` и т. д.
3. **Не имеют стадиона** — `venue === null`
4. **Скрыты в календаре** — `hideMatchCalendar === true`

### Примеры `squadLabel` которые проходят фильтр

- `"Fútbol · Primer Equipo"` → да
- `"Fútbol · Primer Equipo · Femenino"` → да
- `"Fútbol · Cantera · Castilla"` → да (type = `"Cantera"`)
- `"Fútbol · Cantera · Juvenil A"` → да (type = `"Cantera"`)
- `"Fútbol · Cantera · Real Madrid C"` → да (type = `"Cantera"`)
- `"Fútbol · Cantera Femenina · Real Madrid B"` → да (type = `"Cantera Femenina"`)

### Примеры `squadLabel` которые НЕ проходят фильтр

- `"Baloncesto · Primer Equipo"` → нет (не Fútbol)
- `"Fútbol · Cantera · Benjamín A"` → зависит от наличия `venue` (обычно `null` у детских команд)

---

## Даты и временные зоны

### Как API возвращает даты

- Поле `dateTime` — всегда в **UTC** (суффикс `Z`): `"2026-03-11T20:00:00.000Z"`
- Официальный сайт отображает время в **зоне браузера пользователя** (не фиксированная CET)

### Как парсер должен обрабатывать даты

Для выходной структуры дата должна быть в зоне **Europe/Madrid** (CET зимой = UTC+1, CEST летом = UTC+2):

- Подтверждённая дата: `"2026-03-11T21:00:00+01:00"` (полная дата и время с указанием смещения)
- Неподтверждённая дата: `"2026-04-05T00:00:00+02:00"` (только дата имеет смысл; время будет `00:00` или другое приблизительное значение)

### Признаки неподтверждённой даты

- `isScheduled === false`
- Часто `dateTime` оканчивается на `T00:00:00.000Z` (полночь UTC), что указывает на приблизительную дату

---

## Схема работы парсера

### Общий алгоритм

1. **Определить диапазон дат**: от первого числа текущего месяца до последнего числа +3 месяца вперёд (или другой желаемый диапазон)
2. **Выполнить HTTP GET запрос** к API с подстановкой дат в формате ISO 8601
3. **Распарсить JSON-ответ**: извлечь `data.matchList.items`
4. **Отфильтровать** матчи по правилам (см. выше)
5. **Преобразовать** каждый матч в выходную структуру
6. **Отсортировать** по дате
7. **Сохранить** результат в файл `matches.json`

### Периодичность запуска

- Рекомендуется: **раз в 4–6 часов** или чаще перед матчами
- Можно запускать через cron, GitHub Actions, CI/CD pipeline и т.д.

### Выходной файл (`matches.json`)

```json
[
  {
    "type": "Primer Equipo",
    "team": "Real Madrid",
    "vs": "Getafe",
    "tournament": "La Liga",
    "stadium": "Bernabéu",
    "atHome": true,
    "date": "2026-03-02T21:00:00+01:00",
    "isDateConfirmed": true
  },
  {
    "type": "Primer Equipo",
    "team": "Real Madrid",
    "vs": "Manchester City",
    "tournament": "Champions League",
    "stadium": "Bernabéu",
    "atHome": true,
    "date": "2026-03-11T21:00:00+01:00",
    "isDateConfirmed": true
  }
]
```

### Размещение

Файл `matches.json` размещается в корне WEB-формы (рядом с `index.html`). Форма загружает его обычным `fetch("matches.json")` — CORS-проблем нет, т.к. файл на том же домене.

---

## Ограничение CORS

API на `publish.realmadrid.com` **не возвращает заголовки** `Access-Control-Allow-Origin`. Это означает:

- Прямой вызов из JavaScript в браузере с другого домена **заблокирован**
- Запросы из серверного кода (скрипт, cron, CI) **работают без ограничений**
- Именно поэтому выбран подход со статичным JSON-файлом

---

## Альтернативные источники данных (справочно)

### 1. Сторонний ICS-фид (fixtur.es)

- URL: `webcal://ics.fixtur.es/v2/real-madrid.ics`
- Покрывает только первую команду
- Нет данных о стадионе, типе команды, подтверждении даты
- Формат: `VEVENT` с `SUMMARY` вида `"Real Madrid - Opponent [CL] (2-1)"`
- **Не подходит** для наших целей

### 2. Официальный ICS-эндпоинт Real Madrid

- URL: `https://publish.realmadrid.com/content/sling/app-servlets/realmadrid/ical.{team}.{lang}.ics`
- На момент проверки возвращает **пустой календарь** (только заголовок `VCALENDAR`)
- **Не подходит** — данные отсутствуют

### 3. Сторонние API (Zyla Labs, API-Football и др.)

- Платные сервисы с данными о матчах
- Могут не содержать специфичных полей (cantera, подтверждение даты)
- Избыточны при наличии прямого доступа к API Real Madrid

---

## Технические детали (для разработчика)

### Обнаружение API

API найден путём анализа JavaScript-бандлов Angular-приложения официального сайта:

- Главный бандл: `main-B6LK6K7L.js`
- Модуль календаря: `calendar.module-OBULS5LD.js`
- Сервис данных: `chunk-KHFO3UE5.js` → `getDiaryEvents()`
- Конфигурация: `chunk-E53OYTHE.js` → `rmAdobeAemService.getContent()`

Бэкенд сайта: **NestJS** + **Adobe AEM** (Adobe Experience Manager). Фронтенд: **Angular 17**.

### Конфигурация API из бандла

```javascript
adobeAem: {
  cachedDomain: "config.realmadrid.com",
  domain: "publish.realmadrid.com",
  protocol: "https",
  graphql: {
    path: "graphql/execute.json/realmadridmastersite",
    endpoints: {
      agendaItems: "diaryV2;fromDate={{fromDate}};toDate={{toDate}};alang=/content/dam/portals/realmadrid-com/{{lang}}/sports/"
    }
  }
}
```

### Построение URL на сайте

```
baseUrl = "https://" + domain + "/"
fullPath = graphql.path + "/" + endpoint.replace("{{fromDate}}", from).replace("{{toDate}}", to)
lang = languageCode.toLocaleLowerCase()  // es-ES → es-es
fullUrl = baseUrl + fullPath.replace("{{lang}}", lang)
```
