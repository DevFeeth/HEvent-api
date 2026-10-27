-- =========================================================
-- 1. ENUM
-- =========================================================

CREATE TYPE event_status AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'CANCELLED',
    'FINISHED'
);

CREATE TYPE ticket_status AS ENUM (
    'VALID',
    'USED',
    'CANCELLED'
);

CREATE TYPE order_status AS ENUM (
    'PENDING',
    'PAID',
    'CANCELLED',
    'REFUNDED'
);

CREATE TYPE discount_type AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


-- =========================================================
-- 2. CATEGORIES
-- =========================================================

CREATE TABLE category (
    name VARCHAR(25) PRIMARY KEY,
    label VARCHAR(50) NOT NULL,

    CONSTRAINT check_category_name
        CHECK (name ~ '^[A-Z0-9_-]+$'),

    CONSTRAINT check_category_label
        CHECK (length(trim(label)) > 0)
);

INSERT INTO category (name, label) VALUES
    ('CONCERT', 'Concert'),
    ('FESTIVAL', 'Festival'),
    ('PARTY', 'Soirée');


-- =========================================================
-- 3. ROLES
-- =========================================================

CREATE TABLE role (
    name VARCHAR(25) PRIMARY KEY,
    label VARCHAR(50) NOT NULL,

    CONSTRAINT check_role_name
        CHECK (name ~ '^[A-Z0-9_-]+$'),

    CONSTRAINT check_role_label
        CHECK (length(trim(label)) > 0)
);

INSERT INTO role (name, label) VALUES
    ('USER', 'Utilisateur'),
    ('ORGANIZER', 'Organisateur'),
    ('ADMIN', 'Administrateur');


-- =========================================================
-- 4. UTILISATEURS
-- =========================================================

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    address VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    role_name VARCHAR(25) NOT NULL DEFAULT 'USER',

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_name)
        REFERENCES role(name)
        ON DELETE RESTRICT,

    CONSTRAINT check_user_email
        CHECK (
            email = trim(email)
            AND email ~ '^[^@]+@[^@]+\.[^@]+$'
        ),

    CONSTRAINT check_user_first_name
        CHECK (length(trim(first_name)) > 0),

    CONSTRAINT check_user_last_name
        CHECK (length(trim(last_name)) > 0),

    CONSTRAINT check_user_password_hash
        CHECK (length(password_hash) >= 20)
);


-- =========================================================
-- 5. EVENEMENTS
-- =========================================================

CREATE TABLE events (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    description TEXT,

    image_url TEXT,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),

    capacity INT NOT NULL,

    status event_status NOT NULL DEFAULT 'DRAFT',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    category_name VARCHAR(25) NOT NULL,
    organizer_id INT NOT NULL,

    CONSTRAINT fk_event_category
        FOREIGN KEY (category_name)
        REFERENCES category(name)
        ON DELETE RESTRICT,

    CONSTRAINT fk_event_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_event_coordinates
        CHECK ((latitude IS NULL) = (longitude IS NULL)),

    CONSTRAINT check_event_name
        CHECK (length(trim(name)) > 0),

    CONSTRAINT check_event_description
        CHECK (description IS NULL OR length(description) <= 1000),

    CONSTRAINT check_event_capacity
        CHECK (capacity > 0),

    CONSTRAINT check_event_dates
        CHECK ((end_date + end_time) > (start_date + start_time)),

    CONSTRAINT check_event_latitude
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),

    CONSTRAINT check_event_longitude
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);


-- =========================================================
-- 6. TYPES DE BILLETS
-- =========================================================

CREATE TABLE ticket_type (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(50) NOT NULL,
    description VARCHAR(500),

    price NUMERIC(10,2) NOT NULL,
    available_quantity INT NOT NULL,

    event_id INT NOT NULL,

    CONSTRAINT fk_ticket_type_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_ticket_type_event_name
        UNIQUE (event_id, name),

    CONSTRAINT check_ticket_type_name
        CHECK (length(trim(name)) > 0),

    CONSTRAINT check_ticket_type_price
        CHECK (price >= 0),

    CONSTRAINT check_ticket_type_quantity
        CHECK (available_quantity >= 0)
);


-- =========================================================
-- 7. CODES PROMOTIONNELS
-- =========================================================

CREATE TABLE promo_code (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type discount_type NOT NULL,
    discount_value NUMERIC(10,2) NOT NULL,

    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,

    max_uses INT,
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    event_id INT NOT NULL,

    CONSTRAINT fk_promo_code_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    CONSTRAINT check_promo_code_format
        CHECK (code ~ '^[A-Z0-9_-]+$'),

    CONSTRAINT check_promo_discount_value
        CHECK (
            discount_value > 0
            AND (
                discount_type <> 'PERCENTAGE'
                OR discount_value <= 100
            )
        ),

    CONSTRAINT check_promo_dates
        CHECK (end_at > start_at),

    CONSTRAINT check_promo_max_uses
        CHECK (max_uses IS NULL OR max_uses > 0),

    CONSTRAINT check_promo_min_amount
        CHECK (min_order_amount >= 0)
);


-- =========================================================
-- 8. COMMANDES
-- =========================================================

CREATE TABLE orders (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,

    total NUMERIC(10,2)
        GENERATED ALWAYS AS (subtotal - discount_amount) STORED,

    status order_status NOT NULL DEFAULT 'PENDING', 

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    user_id INT NOT NULL,
    promo_code_id INT,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_orders_promo_code
        FOREIGN KEY (promo_code_id)
        REFERENCES promo_code(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_orders_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT check_orders_discount
        CHECK (
            discount_amount >= 0
            AND discount_amount <= subtotal
        )
);


-- =========================================================
-- 9. BILLETS
-- =========================================================

CREATE TABLE ticket (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    public_token VARCHAR(100) NOT NULL UNIQUE,
    status ticket_status NOT NULL DEFAULT 'VALID',

    used_at TIMESTAMPTZ,

    purchase_price NUMERIC(10,2) NOT NULL,

    ticket_type_id INT NOT NULL,
    order_id INT NOT NULL,
    owner_id INT NOT NULL,

    CONSTRAINT fk_ticket_ticket_type
        FOREIGN KEY (ticket_type_id)
        REFERENCES ticket_type(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ticket_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ticket_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_ticket_public_token
        CHECK (length(public_token) >= 32),

    CONSTRAINT check_ticket_purchase_price
        CHECK (purchase_price >= 0),

    CONSTRAINT check_ticket_used_at
        CHECK (
            (status = 'USED' AND used_at IS NOT NULL)
            OR
            (status <> 'USED' AND used_at IS NULL)
        )
);


-- =========================================================
-- 10. INDEX
-- =========================================================

CREATE INDEX idx_event_status_start ON events(status, start_date);
CREATE INDEX idx_event_category ON events(category_name);
CREATE INDEX idx_event_organizer ON events(organizer_id);
CREATE INDEX idx_ticket_order ON ticket(order_id);
CREATE INDEX idx_ticket_owner ON ticket(owner_id);
CREATE INDEX idx_orders_user ON orders(user_id);


-- =========================================================
-- 11. SCRIPT POPULATION
-- =========================================================

INSERT INTO users (email, first_name, last_name, password_hash, address, postal_code, city, role_name)
VALUES ('user@mail.com','Ulysse','User',
        '$argon2id$v=19$m=65536,p=4,t=3$dcn3iaqs459ikvq3YF3hyg$VkITkeewP5Vlzox07dohAZf/FwYeONhJsQidgbDPJo0',
        'Avenue Roi Albert 79','5300','Andenne',
        DEFAULT),

       ('orga@mail.com', 'Olive', 'Orga',
        '$argon2id$v=19$m=65536,p=4,t=3$dcn3iaqs459ikvq3YF3hyg$VkITkeewP5Vlzox07dohAZf/FwYeONhJsQidgbDPJo0',
        'Place Josephine Charlotte 17', '5000', 'Namur',
        'ORGANIZER'),

       ('admin@mail.com', 'Adam', 'Admin',
        '$argon2id$v=19$m=65536,p=4,t=3$dcn3iaqs459ikvq3YF3hyg$VkITkeewP5Vlzox07dohAZf/FwYeONhJsQidgbDPJo0',
        'Rue de la Résistance 8', '5300', 'Seilles',
        'ADMIN');
