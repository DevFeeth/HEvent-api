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
    ('PARTY', 'Party');


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
    ('USER', 'User'),
    ('ORGANIZER', 'Organizer'),
    ('ADMIN', 'Administrator');


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
        'Avenue Roi Joseph 18','5300','Andenne',
        DEFAULT),

       ('orga@mail.com', 'Olive', 'Orga',
        '$argon2id$v=19$m=65536,p=4,t=3$dcn3iaqs459ikvq3YF3hyg$VkITkeewP5Vlzox07dohAZf/FwYeONhJsQidgbDPJo0',
        'Place Josephine Charlotte 17', '5000', 'Namur',
        'ORGANIZER'),

       ('admin@mail.com', 'Adam', 'Admin',
        '$argon2id$v=19$m=65536,p=4,t=3$dcn3iaqs459ikvq3YF3hyg$VkITkeewP5Vlzox07dohAZf/FwYeONhJsQidgbDPJo0',
        'Rue de la Force 32', '5300', 'Seilles',
        'ADMIN');


-- =========================================================
-- 12. DONNEES DE DEMONSTRATION
-- =========================================================
-- Tous les comptes ci-dessous partagent le meme mot de passe que les comptes ci-dessus

INSERT INTO category (name, label) VALUES
    ('THEATER', 'Theater'),
    ('COMEDY', 'Comedy'),
    ('CONFERENCE', 'Conference'),
    ('SPORT', 'Sport');

INSERT INTO users (email, first_name, last_name, password_hash, address, postal_code, city, role_name, created_at)
SELECT u.email, u.first_name, u.last_name,
       '$argon2id$v=19$m=65536,p=4,t=3$dcn3iaqs459ikvq3YF3hyg$VkITkeewP5Vlzox07dohAZf/FwYeONhJsQidgbDPJo0',
       u.address, u.postal_code, u.city, u.role_name, u.created_at::timestamptz
FROM (VALUES
    ('contact@meuse-prod.be',      'Thomas',   'Lambert',   'Rue de Fer 24',                '5000', 'Namur',             'ORGANIZER', '2025-01-12 10:15'),
    ('booking@liege-live.be',      'Sarah',    'Dubois',    'Boulevard de la Sauvenière 41','4000', 'Liège',             'ORGANIZER', '2025-02-03 14:40'),
    ('info@bxl-nights.be',         'Mehdi',    'El Amrani', 'Rue Antoine Dansaert 88',      '1000', 'Bruxelles',         'ORGANIZER', '2025-03-18 09:05'),
    ('hello@ardenne-events.be',    'Claire',   'Martin',    'Rue du Commerce 7',            '6900', 'Marche-en-Famenne', 'ORGANIZER', '2025-04-22 16:30'),
    ('lucas.peeters@gmail.com',    'Lucas',    'Peeters',   'Rue de Bruxelles 12',          '5000', 'Namur',             'USER', '2025-05-02 18:22'),
    ('emma.janssens@hotmail.com',  'Emma',     'Janssens',  'Chaussée de Louvain 230',      '5020', 'Champion',          'USER', '2025-05-14 20:01'),
    ('noah.maes@outlook.be',       'Noah',     'Maes',      'Rue Saint-Gilles 45',          '4000', 'Liège',             'USER', '2025-06-01 12:47'),
    ('olivia.jacobs@gmail.com',    'Olivia',   'Jacobs',    'Avenue Louise 301',            '1050', 'Ixelles',           'USER', '2025-06-09 08:30'),
    ('louis.willems@skynet.be',    'Louis',    'Willems',   'Rue du Collège 9',             '5300', 'Andenne',           'USER', '2025-06-27 21:12'),
    ('lea.claes@gmail.com',        'Léa',      'Claes',     'Rue des Carmes 3',             '5000', 'Namur',             'USER', '2025-07-05 15:55'),
    ('arthur.goossens@proton.me',  'Arthur',   'Goossens',  'Rue de la Station 18',         '1300', 'Wavre',             'USER', '2025-07-19 11:03'),
    ('chloe.wouters@gmail.com',    'Chloé',    'Wouters',   'Grand-Rue 102',                '6000', 'Charleroi',         'USER', '2025-08-02 17:38'),
    ('jules.mertens@gmail.com',    'Jules',    'Mertens',   'Rue Haute 56',                 '1348', 'Louvain-la-Neuve',  'USER', '2025-08-21 19:20'),
    ('manon.leroy@yahoo.fr',       'Manon',    'Leroy',     'Rue de Dave 77',               '5100', 'Jambes',            'USER', '2025-09-03 10:44'),
    ('hugo.dupont@gmail.com',      'Hugo',     'Dupont',    'Rue Grétry 140',               '4020', 'Liège',             'USER', '2025-09-15 13:09'),
    ('camille.renard@hotmail.com', 'Camille',  'Renard',    'Place Reine Astrid 4',         '5500', 'Dinant',            'USER', '2025-10-08 09:27'),
    ('nathan.simon@gmail.com',     'Nathan',   'Simon',     'Rue de l''Église 21',          '5030', 'Gembloux',          'USER', '2025-11-11 22:15'),
    ('ines.laurent@outlook.com',   'Inès',     'Laurent',   'Rue du Pont 6',                '4500', 'Huy',               'USER', '2025-12-20 16:02'),
    ('victor.lemaire@gmail.com',   'Victor',   'Lemaire',   'Avenue de la Gare 33',         '7000', 'Mons',              'USER', '2026-01-09 14:48'),
    ('zoe.michel@gmail.com',       'Zoé',      'Michel',    'Rue Godefroid 15',             '5000', 'Namur',             'USER', '2026-02-14 19:33'),
    ('adam.francois@skynet.be',    'Adam',     'François',  'Rue de Liège 64',              '5300', 'Andenne',           'USER', '2026-03-02 07:58'),
    ('alice.collard@gmail.com',    'Alice',    'Collard',   'Chaussée de Marche 412',       '5101', 'Erpent',            'USER', '2026-04-17 12:10'),
    ('maxime.thiry@gmail.com',     'Maxime',   'Thiry',     'Rue Basse-Marcelle 11',        '5000', 'Namur',             'USER', '2026-05-29 20:41'),
    ('julie.henrard@hotmail.com',  'Julie',    'Henrard',   'Rue de la Meuse 2',            '5300', 'Seilles',           'USER', '2026-07-08 18:05'),
    ('thibault.gilson@gmail.com',  'Thibault', 'Gilson',    'Rue Rogier 90',                '5000', 'Namur',             'USER', '2026-09-12 11:26')
) AS u(email, first_name, last_name, address, postal_code, city, role_name, created_at);

-- Un compte desactive
UPDATE users SET is_active = FALSE WHERE email = 'thibault.gilson@gmail.com';


INSERT INTO events (name, description, image_url, start_date, end_date, start_time, end_time,
                    latitude, longitude, status, created_at, category_name, organizer_id)
SELECT e.name, e.description, e.image_url, e.start_date::date, e.end_date::date, e.start_time::time, e.end_time::time,
       e.latitude::numeric, e.longitude::numeric, e.status::event_status, e.created_at::timestamptz, e.category_name,
       (SELECT id FROM users WHERE email = e.organizer_email)
FROM (VALUES
    -- Evenements termines
    ('Citadelle Summer Sounds 2025',
     'Trois jours de concerts en plein air sur l''esplanade de la Citadelle de Namur : pop, rock et électro avec vue sur la Meuse.',
     'https://picsum.photos/seed/hevent-citadelle25/1200/600',
     '2025-07-18', '2025-07-20', '14:00', '23:59', '50.459600', '4.860300', 'FINISHED', '2025-02-10 10:00', 'FESTIVAL', 'contact@meuse-prod.be'),
    ('Nuit Électro au Delta',
     'Une nuit techno et house avec quatre DJ belges, light show et bar à cocktails.',
     'https://picsum.photos/seed/hevent-delta/1200/600',
     '2025-10-25', '2025-10-26', '22:00', '05:00', '50.462900', '4.866200', 'FINISHED', '2025-08-30 15:20', 'PARTY', 'orga@mail.com'),
    ('Jazz à la Sauvenière',
     'Soirée jazz intimiste avec un quartet liégeois et une jam session ouverte en fin de soirée.',
     'https://picsum.photos/seed/hevent-jazz/1200/600',
     '2026-02-21', '2026-02-21', '20:00', '23:30', '50.641500', '5.570100', 'FINISHED', '2025-12-01 09:45', 'CONCERT', 'booking@liege-live.be'),
    ('Stand-up Comedy Night Bruxelles',
     'Cinq humoristes de la nouvelle scène belge se succèdent pour une soirée de rires garantis.',
     'https://picsum.photos/seed/hevent-standup/1200/600',
     '2026-04-10', '2026-04-10', '20:30', '23:00', '50.848100', '4.348900', 'FINISHED', '2026-01-15 17:10', 'COMEDY', 'info@bxl-nights.be'),
    ('Trail des Crêtes de Meuse',
     'Course nature de 12 et 25 km au départ de Dinant, ravitaillements locaux et repas d''après-course.',
     'https://picsum.photos/seed/hevent-trail/1200/600',
     '2026-05-17', '2026-05-17', '08:30', '15:00', '50.260500', '4.912600', 'FINISHED', '2026-01-28 12:00', 'SPORT', 'hello@ardenne-events.be'),
    ('Citadelle Summer Sounds 2026',
     'Le retour du festival de la Citadelle : trois jours, deux scènes et plus de vingt artistes.',
     'https://picsum.photos/seed/hevent-citadelle26/1200/600',
     '2026-07-17', '2026-07-19', '14:00', '23:59', '50.459600', '4.860300', 'FINISHED', '2026-01-20 10:00', 'FESTIVAL', 'contact@meuse-prod.be'),
    ('Rock sur la Meuse',
     'Concert rock en plein air sur les quais d''Andenne avec trois groupes de la région.',
     'https://picsum.photos/seed/hevent-rockmeuse/1200/600',
     '2026-08-29', '2026-08-29', '18:00', '23:59', '50.488100', '5.096500', 'FINISHED', '2026-04-05 14:30', 'CONCERT', 'orga@mail.com'),
    -- Evenement annule
    ('Open Air Wavre',
     'Festival électro en plein air. Annulé suite aux conditions météo, tous les billets ont été remboursés.',
     'https://picsum.photos/seed/hevent-wavre/1200/600',
     '2026-09-19', '2026-09-20', '15:00', '02:00', '50.717500', '4.611900', 'CANCELLED', '2026-05-12 11:00', 'FESTIVAL', 'info@bxl-nights.be'),
    -- Evenements a venir (en vente)
    ('Molière revisité',
     'Une adaptation moderne et décalée du Misanthrope par une troupe namuroise.',
     'https://picsum.photos/seed/hevent-moliere/1200/600',
     '2026-11-20', '2026-11-20', '20:00', '22:15', '50.463400', '4.864700', 'PUBLISHED', '2026-08-25 10:30', 'THEATER', 'contact@meuse-prod.be'),
    ('Tech & Web Namur Meetup',
     'Une journée de talks autour du développement web, de l''IA et du cloud, suivie d''un networking drink.',
     'https://picsum.photos/seed/hevent-meetup/1200/600',
     '2026-11-28', '2026-11-28', '09:00', '18:00', '50.468800', '4.862000', 'PUBLISHED', '2026-09-10 08:15', 'CONFERENCE', 'orga@mail.com'),
    ('Christmas Party au Delta',
     'La grande soirée de Noël : DJ sets, pulls moches de rigueur et vin chaud offert à l''entrée.',
     'https://picsum.photos/seed/hevent-xmas/1200/600',
     '2026-12-19', '2026-12-20', '21:00', '04:00', '50.462900', '4.866200', 'PUBLISHED', '2026-09-28 19:00', 'PARTY', 'orga@mail.com'),
    ('Nouvel An à Liège',
     'Réveillon festif avec concert live, DJ jusqu''au petit matin et coupe de champagne à minuit.',
     'https://picsum.photos/seed/hevent-nye/1200/600',
     '2026-12-31', '2027-01-01', '21:00', '05:00', '50.645200', '5.573100', 'PUBLISHED', '2026-09-15 13:45', 'PARTY', 'booking@liege-live.be'),
    ('Les Rires de l''Ardenne',
     'Festival d''humour sur deux soirs à Marche-en-Famenne, avec têtes d''affiche et jeunes talents.',
     'https://picsum.photos/seed/hevent-rires/1200/600',
     '2027-02-12', '2027-02-13', '19:30', '23:30', '50.226900', '5.344500', 'PUBLISHED', '2026-10-02 10:00', 'COMEDY', 'hello@ardenne-events.be'),
    ('Symphonie de printemps',
     'L''orchestre interprète Vivaldi et Dvořák pour une soirée classique.',
     'https://picsum.photos/seed/hevent-symphonie/1200/600',
     '2027-03-20', '2027-03-20', '20:00', '22:30', '50.637300', '5.567500', 'PUBLISHED', '2026-10-20 16:00', 'CONCERT', 'booking@liege-live.be'),
    ('Citadelle Summer Sounds 2027',
     'Troisième édition du festival de la Citadelle de Namur. Les premiers noms seront dévoilés très bientôt !',
     'https://picsum.photos/seed/hevent-citadelle27/1200/600',
     '2027-07-16', '2027-07-18', '14:00', '23:59', '50.459600', '4.860300', 'PUBLISHED', '2026-10-30 10:00', 'FESTIVAL', 'contact@meuse-prod.be'),
    -- Brouillons
    ('Semi-marathon de Bruxelles',
     'Brouillon : parcours et tarifs encore à valider avec la commune.',
     NULL,
     '2027-04-25', '2027-04-25', '09:00', '14:00', '50.844800', '4.357300', 'DRAFT', '2026-11-02 09:00', 'SPORT', 'info@bxl-nights.be'),
    ('Soirée années 80',
     NULL, NULL,
     '2027-01-23', '2027-01-24', '21:00', '03:00', NULL, NULL, 'DRAFT', '2026-11-05 22:10', 'PARTY', 'orga@mail.com')
) AS e(name, description, image_url, start_date, end_date, start_time, end_time,
       latitude, longitude, status, created_at, category_name, organizer_email);


INSERT INTO ticket_type (name, description, price, available_quantity, event_id)
SELECT t.name, t.description, t.price, t.qty, (SELECT id FROM events WHERE name = t.event_name)
FROM (VALUES
    ('Citadelle Summer Sounds 2025',    'Pass 1 jour',      'Accès au festival pour une journée au choix.', 39.00, 120),
    ('Citadelle Summer Sounds 2025',    'Pass 3 jours',     'Accès aux trois jours du festival.', 89.00, 80),
    ('Citadelle Summer Sounds 2025',    'VIP 3 jours',      'Pass 3 jours, accès à l''espace VIP et deux boissons par jour.', 159.00, 20),
    ('Nuit Électro au Delta',           'Prévente',         'Entrée à tarif réduit.', 15.00, 60),
    ('Nuit Électro au Delta',           'Standard',         NULL, 20.00, 90),
    ('Jazz à la Sauvenière',            'Place assise',     'Placement libre en salle.', 25.00, 70),
    ('Jazz à la Sauvenière',            'Étudiant',         'Sur présentation d''une carte étudiant valide.', 15.00, 30),
    ('Stand-up Comedy Night Bruxelles', 'Standard',         NULL, 22.00, 100),
    ('Stand-up Comedy Night Bruxelles', 'Premier rang',     'Places au premier rang (vous risquez d''être pris à partie !).', 35.00, 12),
    ('Trail des Crêtes de Meuse',       '12 km',            'Dossard pour le parcours de 12 km, repas inclus.', 18.00, 80),
    ('Trail des Crêtes de Meuse',       '25 km',            'Dossard pour le parcours de 25 km, repas inclus.', 28.00, 60),
    ('Citadelle Summer Sounds 2026',    'Pass 1 jour',      'Accès au festival pour une journée au choix.', 42.00, 150),
    ('Citadelle Summer Sounds 2026',    'Pass 3 jours',     'Accès aux trois jours du festival.', 95.00, 100),
    ('Citadelle Summer Sounds 2026',    'VIP 3 jours',      'Pass 3 jours, accès à l''espace VIP et deux boissons par jour.', 169.00, 25),
    ('Rock sur la Meuse',               'Entrée',           NULL, 12.00, 120),
    ('Rock sur la Meuse',               'Enfant (-12 ans)', 'Gratuit pour les moins de 12 ans accompagnés.', 0.00, 30),
    ('Open Air Wavre',                  'Pass 1 jour',      NULL, 35.00, 100),
    ('Open Air Wavre',                  'Pass week-end',    NULL, 60.00, 60),
    ('Molière revisité',                'Plein tarif',      NULL, 28.00, 80),
    ('Molière revisité',                'Tarif réduit',     'Étudiants, seniors et demandeurs d''emploi.', 18.00, 40),
    ('Tech & Web Namur Meetup',         'Early bird',       'Gratuit pour les premiers inscrits.', 0.00, 40),
    ('Tech & Web Namur Meetup',         'Standard',         'Accès aux talks, lunch et drink inclus.', 25.00, 120),
    ('Christmas Party au Delta',        'Prévente',         NULL, 15.00, 80),
    ('Christmas Party au Delta',        'Standard',         NULL, 20.00, 150),
    ('Christmas Party au Delta',        'Table VIP (x6)',   'Table réservée pour six personnes avec une bouteille.', 180.00, 8),
    ('Nouvel An à Liège',               'Entrée',           'Entrée et coupe de champagne à minuit.', 45.00, 200),
    ('Nouvel An à Liège',               'Formule dîner',    'Dîner trois services, entrée et champagne.', 95.00, 60),
    ('Les Rires de l''Ardenne',         'Soirée vendredi',  NULL, 26.00, 90),
    ('Les Rires de l''Ardenne',         'Soirée samedi',    NULL, 26.00, 90),
    ('Les Rires de l''Ardenne',         'Pass 2 soirées',   NULL, 45.00, 50),
    ('Symphonie de printemps',          'Catégorie 1',      'Parterre, rangs 1 à 15.', 48.00, 60),
    ('Symphonie de printemps',          'Catégorie 2',      'Parterre arrière et balcon.', 32.00, 120),
    ('Citadelle Summer Sounds 2027',    'Pass 3 jours Early', 'Tarif early bird en quantité limitée.', 79.00, 100),
    ('Citadelle Summer Sounds 2027',    'Pass 3 jours',     NULL, 99.00, 300),
    ('Semi-marathon de Bruxelles',      'Dossard',          NULL, 30.00, 500),
    ('Soirée années 80',                'Entrée',           NULL, 10.00, 100)
) AS t(event_name, name, description, price, qty);


INSERT INTO promo_code (code, discount_type, discount_value, start_at, end_at, max_uses, min_order_amount, is_active, event_id)
SELECT p.code, p.discount_type::discount_type, p.discount_value, p.start_at::timestamptz, p.end_at::timestamptz,
       p.max_uses, p.min_order_amount, p.is_active, (SELECT id FROM events WHERE name = p.event_name)
FROM (VALUES
    ('SUMMER25',    'PERCENTAGE',   10.00, '2025-02-10 00:00', '2025-07-17 23:59', 50,    0.00, TRUE,  'Citadelle Summer Sounds 2025'),
    ('DELTA5',      'FIXED_AMOUNT',  5.00, '2025-09-01 00:00', '2025-10-24 23:59', 20,   15.00, TRUE,  'Nuit Électro au Delta'),
    ('TRAIL-CLUB',  'PERCENTAGE',   15.00, '2026-02-01 00:00', '2026-05-15 23:59', NULL,  0.00, TRUE,  'Trail des Crêtes de Meuse'),
    ('CITADELLE26', 'PERCENTAGE',   10.00, '2026-01-20 00:00', '2026-07-16 23:59', 60,   50.00, TRUE,  'Citadelle Summer Sounds 2026'),
    ('MOLIERE-ETU', 'FIXED_AMOUNT',  4.00, '2026-09-01 00:00', '2026-11-19 23:59', 30,    0.00, TRUE,  'Molière revisité'),
    ('XMAS10',      'PERCENTAGE',   10.00, '2026-10-01 00:00', '2026-12-18 23:59', 100,  30.00, TRUE,  'Christmas Party au Delta'),
    ('NYE2027',     'FIXED_AMOUNT', 10.00, '2026-09-15 00:00', '2026-12-30 23:59', 40,   90.00, TRUE,  'Nouvel An à Liège'),
    ('RIRES-OLD',   'PERCENTAGE',   20.00, '2026-10-02 00:00', '2026-10-31 23:59', 25,    0.00, FALSE, 'Les Rires de l''Ardenne'),
    ('EARLY27',     'PERCENTAGE',    5.00, '2026-11-01 00:00', '2027-01-31 23:59', 200,   0.00, TRUE,  'Citadelle Summer Sounds 2027')
) AS p(code, discount_type, discount_value, start_at, end_at, max_uses, min_order_amount, is_active, event_name);


-- Commandes du compte de test user@mail.com (2 billets par commande)
DO $$
DECLARE
    v_user  INT := (SELECT id FROM users WHERE email = 'user@mail.com');
    v_order INT;
    tt      RECORD;
BEGIN
    FOR tt IN
        SELECT t.*, e.start_date, e.start_time, e.status AS event_status, e.created_at AS event_created
        FROM ticket_type t JOIN events e ON e.id = t.event_id
        WHERE (e.name, t.name) IN (('Citadelle Summer Sounds 2026', 'Pass 3 jours'),
                                   ('Rock sur la Meuse', 'Entrée'),
                                   ('Christmas Party au Delta', 'Standard'),
                                   ('Nouvel An à Liège', 'Entrée'))
        ORDER BY e.start_date
    LOOP
        INSERT INTO orders (subtotal, discount_amount, status, created_at, user_id)
        VALUES (tt.price * 2, 0, 'PAID', tt.event_created + interval '20 days', v_user)
        RETURNING id INTO v_order;

        INSERT INTO ticket (status, used_at, purchase_price, ticket_type_id, order_id, owner_id)
        SELECT CASE WHEN tt.event_status = 'FINISHED' THEN 'USED' ELSE 'VALID' END::ticket_status,
               CASE WHEN tt.event_status = 'FINISHED'
                    THEN ((tt.start_date + tt.start_time) AT TIME ZONE 'Europe/Brussels') + interval '40 minutes' END,
               tt.price, tt.id, v_order, v_user
        FROM generate_series(1, 2);
    END LOOP;

    -- Une commande en attente de paiement, pour tester le paiement
    INSERT INTO orders (subtotal, discount_amount, status, created_at, user_id)
    VALUES (56.00, 0, 'PENDING', CURRENT_TIMESTAMP, v_user)
    RETURNING id INTO v_order;

    INSERT INTO ticket (purchase_price, ticket_type_id, order_id, owner_id)
    SELECT 28.00, t.id, v_order, v_user
    FROM ticket_type t JOIN events e ON e.id = t.event_id, generate_series(1, 2)
    WHERE e.name = 'Molière revisité' AND t.name = 'Plein tarif';
END $$;


-- Commandes et billets generes de maniere deterministe (setseed) en respectant :
--   * les quantites disponibles de chaque type de billet
--   * la periode de validite, le montant minimum et le nombre d'utilisations des codes promo
--   * le calcul du prix d'achat de l'API (prix * total / sous-total, arrondi au centime)
--   * les statuts : evenement termine -> billets utilises (ou non presentes), evenement annule -> rembourse
DO $$
DECLARE
    v_now       CONSTANT TIMESTAMPTZ := TIMESTAMPTZ '2026-11-10 12:00:00+01';
    ev          RECORD;
    tt          RECORD;
    v_promo     RECORD;
    v_sale_end  TIMESTAMPTZ;
    v_start     TIMESTAMPTZ;
    v_created   TIMESTAMPTZ;
    v_nb_orders INT;
    v_buyer     INT;
    v_owner     INT;
    v_qty       INT;
    v_sold      INT;
    v_order_id  INT;
    v_promo_id  INT;
    v_subtotal  NUMERIC(10,2);
    v_discount  NUMERIC(10,2);
    v_status    order_status;
    v_tstatus   ticket_status;
    r           DOUBLE PRECISION;
BEGIN
    PERFORM setseed(0.2026);

    FOR ev IN SELECT * FROM events WHERE status <> 'DRAFT' ORDER BY id LOOP
        v_start     := (ev.start_date + ev.start_time) AT TIME ZONE 'Europe/Brussels';
        v_sale_end  := LEAST(v_start, v_now);
        v_nb_orders := CASE ev.status WHEN 'FINISHED'  THEN 30 + floor(random() * 25)::int
                                      WHEN 'CANCELLED' THEN 15
                                      ELSE 8 + floor(random() * 20)::int END;

        FOR i IN 1..v_nb_orders LOOP
            SELECT * INTO tt FROM ticket_type WHERE event_id = ev.id ORDER BY random() LIMIT 1;

            r := random();
            v_qty := CASE WHEN r < 0.45 THEN 1 WHEN r < 0.80 THEN 2 WHEN r < 0.90 THEN 3 ELSE 4 END;
            IF tt.name LIKE '%VIP%' THEN v_qty := 1; END IF;

            SELECT count(*) INTO v_sold FROM ticket WHERE ticket_type_id = tt.id AND status <> 'CANCELLED';
            v_qty := LEAST(v_qty, tt.available_quantity - v_sold);
            CONTINUE WHEN v_qty <= 0;

            -- Acheteur actif deja inscrit au moment de la commande
            v_created := ev.created_at + random() * (v_sale_end - ev.created_at);
            v_buyer := NULL;
            SELECT id INTO v_buyer FROM users
            WHERE role_name = 'USER' AND is_active AND created_at < v_created AND email <> 'user@mail.com'
            ORDER BY random() LIMIT 1;
            CONTINUE WHEN v_buyer IS NULL;

            v_subtotal := tt.price * v_qty;
            v_discount := 0;
            v_promo_id := NULL;

            IF random() < 0.3 THEN
                SELECT * INTO v_promo FROM promo_code p
                WHERE p.event_id = ev.id AND p.is_active
                  AND v_created BETWEEN p.start_at AND p.end_at
                  AND v_subtotal >= p.min_order_amount
                  AND (p.max_uses IS NULL OR p.max_uses > (SELECT count(*) FROM orders o
                                                          WHERE o.promo_code_id = p.id AND o.status IN ('PENDING', 'PAID')))
                LIMIT 1;
                IF FOUND THEN
                    v_promo_id := v_promo.id;
                    v_discount := LEAST(v_subtotal,
                        CASE v_promo.discount_type
                            WHEN 'PERCENTAGE' THEN round(v_subtotal * v_promo.discount_value / 100, 2)
                            ELSE v_promo.discount_value END);
                END IF;
            END IF;

            IF ev.status = 'CANCELLED' THEN
                v_status := 'REFUNDED';
            ELSIF v_subtotal - v_discount = 0 THEN
                v_status := 'PAID';
            ELSIF random() < 0.08 THEN
                v_status := 'CANCELLED';  -- commande jamais payee, expiree
            ELSE
                v_status := 'PAID';
            END IF;

            INSERT INTO orders (subtotal, discount_amount, status, created_at, user_id, promo_code_id)
            VALUES (v_subtotal, v_discount, v_status, v_created, v_buyer, v_promo_id)
            RETURNING id INTO v_order_id;

            FOR k IN 1..v_qty LOOP
                v_owner := v_buyer;
                -- De temps en temps, un billet est transfere a un ami
                IF k > 1 AND random() < 0.25 THEN
                    SELECT id INTO v_owner FROM users
                    WHERE role_name = 'USER' AND is_active AND id <> v_buyer
                    ORDER BY random() LIMIT 1;
                END IF;

                IF v_status IN ('CANCELLED', 'REFUNDED') THEN
                    v_tstatus := 'CANCELLED';
                ELSIF ev.status = 'FINISHED' AND random() < 0.92 THEN
                    v_tstatus := 'USED';
                ELSE
                    v_tstatus := 'VALID';
                END IF;

                INSERT INTO ticket (status, used_at, purchase_price, ticket_type_id, order_id, owner_id)
                VALUES (v_tstatus,
                        CASE WHEN v_tstatus = 'USED' THEN v_start + random() * interval '3 hours' END,
                        CASE WHEN v_subtotal = 0 THEN 0
                             ELSE round(tt.price * (v_subtotal - v_discount) / v_subtotal, 2) END,
                        tt.id, v_order_id, v_owner);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
