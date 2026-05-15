# MODULE_25 — Shop (API + Admin + Client)

Монорепозиторий: Express API, админка (EJS), React-клиент (Vite).

## Запуск (кратко)

1. Установить **Node.js** и **MySQL**.
2. Создать файл `.env` в корне (по образцу ниже).
3. Создать БД и выполнить SQL из раздела **«Создание таблиц»**.
4. В корне: `npm install`
5. Клиент: `cd Shop-client/shop-client` → `npm install` → `npm run build`
6. Запуск: `nodemon index.ts` (из корня)
7. Браузер: `http://localhost:3000` (клиент), `http://localhost:3000/admin` (админка)

### Пример `.env`

```env
LOCAL_HOST=localhost
LOCAL_PORT=3000
API_PATH=api
ADMIN_PATH=admin

DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ProductsApplication

SESSION_SECRET=your_secret
ADMIN_ROLE=admin
```

---

## Создание базы данных

```sql
CREATE DATABASE IF NOT EXISTS ProductsApplication
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ProductsApplication;
```

---

## Создание таблиц

Порядок важен: сначала `products` и `users`, затем таблицы с внешними ключами.

### 1. Товары (`products`)

```sql
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
```

### 2. Пользователи админки (`users`)

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

### 3. Комментарии (`comments`)

```sql
CREATE TABLE comments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    product_id VARCHAR(36) NOT NULL,

    FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);
```

### 4. Изображения (`images`)

```sql
CREATE TABLE images (
    id VARCHAR(36) PRIMARY KEY,
    url TEXT NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    main TINYINT(1) NOT NULL DEFAULT 0,

    FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);
```

### 5. Похожие товары (`similar_products`)

```sql
CREATE TABLE similar_products (
    product_id VARCHAR(36) NOT NULL,
    similar_product_id VARCHAR(36) NOT NULL,

    UNIQUE KEY unique_pair (product_id, similar_product_id),

    FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    FOREIGN KEY (similar_product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    CHECK (product_id != similar_product_id)
);
```

---

## Пример заполнения (тестовые данные)

Подставьте свои UUID или используйте примеры ниже. Сначала товары, потом связанные таблицы.

### Пользователь для входа в админку

```sql
INSERT INTO users (username, password)
VALUES ('admin', 'admin');
```

Логин в админке должен совпадать с `ADMIN_ROLE` в `.env` (роль `admin` задаётся в сессии после успешной авторизации через API).

### Товары

```sql
INSERT INTO products (id, title, description, price) VALUES
('5c5f94eb-7e38-45e1-b7c9-57dfb7a2b93c', 'Товар 1', 'Описание товара 1', 1000.00),
('34e1a2a7-d0a9-4c7a-99f6-c2d5b5afaa06', 'Товар 2', 'Описание товара 2', 2500.50),
('88a3f826-9c3d-4f7c-a56e-156d7c3f3b28', 'Товар 3', 'Описание товара 3', 750.00);
```

### Изображения

```sql
INSERT INTO images (id, url, product_id, main) VALUES
('a1111111-1111-1111-1111-111111111111', 'https://example.com/img1.jpg', '5c5f94eb-7e38-45e1-b7c9-57dfb7a2b93c', 1),
('a2222222-2222-2222-2222-222222222222', 'https://example.com/img2.jpg', '5c5f94eb-7e38-45e1-b7c9-57dfb7a2b93c', 0);
```

### Комментарии

```sql
INSERT INTO comments (id, name, email, body, product_id) VALUES
('c1111111-1111-1111-1111-111111111111', 'Иван', 'ivan@mail.com', 'Хороший товар', '5c5f94eb-7e38-45e1-b7c9-57dfb7a2b93c'),
('c2222222-2222-2222-2222-222222222222', 'Мария', 'maria@mail.com', 'Рекомендую', '5c5f94eb-7e38-45e1-b7c9-57dfb7a2b93c');
```

### Похожие товары

```sql
INSERT INTO similar_products (product_id, similar_product_id) VALUES
('34e1a2a7-d0a9-4c7a-99f6-c2d5b5afaa06', '88a3f826-9c3d-4f7c-a56e-156d7c3f3b28'),
('34e1a2a7-d0a9-4c7a-99f6-c2d5b5afaa06', '9b4d4a1a-5224-4ad4-b4e3-053dcbfa0f3c'),
('36239a24-f71d-4f11-a93e-506775f882e9', '34e1a2a7-d0a9-4c7a-99f6-c2d5b5afaa06');
```

> Для последней строки `similar_products` убедитесь, что товар `36239a24-f71d-4f11-a93e-506775f882e9` есть в `products`, либо удалите/замените эту строку.

---

## Структура репозитория

| Папка | Назначение |
|-------|------------|
| `SHOP-api/` | REST API |
| `Shop-admin/` | Админ-панель (EJS) |
| `Shop-client/shop-client/` | React-клиент |
| `Server/` | Подключение к БД, запуск Express |
| `Shared/` | Общие TypeScript-типы |
