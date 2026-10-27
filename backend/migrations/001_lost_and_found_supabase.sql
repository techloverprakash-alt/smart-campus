-- ======================================================================
-- NEXUS SMART CAMPUS: LOST AND FOUND SYSTEM (TABLES 34-41)
-- Supabase PostgreSQL Migration Script
-- ======================================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core Campus Tables (Supporting Entities)
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.campus_locations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(32),
    zone_code VARCHAR(64),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id VARCHAR(64) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes INTEGER NOT NULL DEFAULT 0,
    uploaded_by VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ======================================================================
-- 3. Table 34: item_categories
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.item_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS ix_item_categories_name ON public.item_categories (name);

-- ======================================================================
-- 4. Table 35: lost_reports
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.lost_reports (
    id VARCHAR(64) PRIMARY KEY,
    reporter_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    category_id VARCHAR(64) NOT NULL REFERENCES public.item_categories(id) ON DELETE RESTRICT,
    last_seen_location_id VARCHAR(64) REFERENCES public.campus_locations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    brand_model VARCHAR(255),
    description TEXT NOT NULL,
    lost_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS ix_lost_reports_reporter_id ON public.lost_reports (reporter_id);
CREATE INDEX IF NOT EXISTS ix_lost_reports_category_id ON public.lost_reports (category_id);
CREATE INDEX IF NOT EXISTS ix_lost_reports_status ON public.lost_reports (status);

-- ======================================================================
-- 5. Table 36: found_reports
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.found_reports (
    id VARCHAR(64) PRIMARY KEY,
    reported_by VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    category_id VARCHAR(64) NOT NULL REFERENCES public.item_categories(id) ON DELETE RESTRICT,
    found_location_id VARCHAR(64) REFERENCES public.campus_locations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    found_at TIMESTAMPTZ NOT NULL,
    custody_desk VARCHAR(255) NOT NULL,
    inventory_tag VARCHAR(64) NOT NULL UNIQUE,
    storage_status VARCHAR(32) NOT NULL DEFAULT 'IN_CUSTODY',
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS ix_found_reports_inventory_tag ON public.found_reports (inventory_tag);
CREATE INDEX IF NOT EXISTS ix_found_reports_category_id ON public.found_reports (category_id);
CREATE INDEX IF NOT EXISTS ix_found_reports_storage_status ON public.found_reports (storage_status);

-- ======================================================================
-- 6. Table 37: report_media
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.report_media (
    id VARCHAR(64) PRIMARY KEY,
    lost_report_id VARCHAR(64) REFERENCES public.lost_reports(id) ON DELETE CASCADE,
    found_report_id VARCHAR(64) REFERENCES public.found_reports(id) ON DELETE CASCADE,
    media_id VARCHAR(64) NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT chk_report_media_target CHECK ((lost_report_id IS NOT NULL) OR (found_report_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ix_report_media_lost ON public.report_media (lost_report_id);
CREATE INDEX IF NOT EXISTS ix_report_media_found ON public.report_media (found_report_id);

-- ======================================================================
-- 7. Table 38: item_matches
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.item_matches (
    id VARCHAR(64) PRIMARY KEY,
    lost_report_id VARCHAR(64) NOT NULL REFERENCES public.lost_reports(id) ON DELETE CASCADE,
    found_report_id VARCHAR(64) NOT NULL REFERENCES public.found_reports(id) ON DELETE CASCADE,
    text_similarity REAL NOT NULL DEFAULT 0.0,
    image_similarity REAL NOT NULL DEFAULT 0.0,
    combined_score REAL NOT NULL DEFAULT 0.0,
    criteria_json TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'CANDIDATE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_lost_found_pair UNIQUE (lost_report_id, found_report_id)
);
CREATE INDEX IF NOT EXISTS ix_item_matches_combined_score ON public.item_matches (combined_score);
CREATE INDEX IF NOT EXISTS ix_item_matches_status ON public.item_matches (status);

-- ======================================================================
-- 8. Table 39: match_verifications
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.match_verifications (
    id VARCHAR(64) PRIMARY KEY,
    match_id VARCHAR(64) NOT NULL REFERENCES public.item_matches(id) ON DELETE CASCADE,
    challenge_question TEXT NOT NULL,
    owner_response TEXT,
    officer_notes TEXT,
    concordance_score REAL,
    verified_by VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS ix_match_verifications_match_id ON public.match_verifications (match_id);

-- ======================================================================
-- 9. Table 40: item_claims
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.item_claims (
    id VARCHAR(64) PRIMARY KEY,
    found_report_id VARCHAR(64) NOT NULL REFERENCES public.found_reports(id) ON DELETE RESTRICT,
    lost_report_id VARCHAR(64) REFERENCES public.lost_reports(id) ON DELETE SET NULL,
    claimed_by VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    reviewed_by VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS ix_item_claims_claimed_by ON public.item_claims (claimed_by);
CREATE INDEX IF NOT EXISTS ix_item_claims_status ON public.item_claims (status);

-- ======================================================================
-- 10. Table 41: item_handovers
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.item_handovers (
    id VARCHAR(64) PRIMARY KEY,
    claim_id VARCHAR(64) NOT NULL UNIQUE REFERENCES public.item_claims(id) ON DELETE RESTRICT,
    handed_over_by VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    received_by VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    handover_location_id VARCHAR(64) NOT NULL REFERENCES public.campus_locations(id) ON DELETE RESTRICT,
    handover_notes TEXT,
    handed_over_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ======================================================================
-- 11. Initial Seeds (Categories & Default Locations)
-- ======================================================================
INSERT INTO public.item_categories (id, name, description) VALUES
    ('CAT-01', 'Electronics', 'Laptops, mobile phones, tablets, smartwatches, chargers, headphones'),
    ('CAT-02', 'Accessories', 'Glasses, jewelry, wrist watches, rings, umbrellas'),
    ('CAT-03', 'Wallets & Cards', 'Wallets, purses, student ID cards, transit cards, bank cards'),
    ('CAT-04', 'Study Materials', 'Notebooks, textbooks, binders, stationery pouches, lab manuals'),
    ('CAT-05', 'Clothing & Bags', 'Jackets, hoodies, backpacks, gym duffels, caps'),
    ('CAT-06', 'Sports & Fitness', 'Water bottles, sports gear, rackets, gym accessories')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.campus_locations (id, name, building, floor, zone_code, description) VALUES
    ('LOC-01', 'Central Library', 'Main Library Complex', '1st Floor', 'LIB-01', 'Circulation desk & reading halls'),
    ('LOC-02', 'Main Canteen Quad 2', 'Student Center', 'Ground Floor', 'CAN-02', 'Dining area and food court'),
    ('LOC-03', 'Academic Block B - 302', 'Science & Engineering Block', '3rd Floor', 'ENG-302', 'Lecture Hall B-302'),
    ('LOC-04', 'Sports Complex Gym', 'Recreation Center', 'Ground Floor', 'GYM-01', 'Indoor sports hall and fitness center'),
    ('LOC-05', 'AI Lab-1', 'Computer Science Building', '2nd Floor', 'CS-201', 'High performance compute laboratory'),
    ('LOC-06', 'Administrative Complex', 'Central Administration', 'Ground Floor', 'ADM-DESK', 'Security office and central lost-and-found desk')
ON CONFLICT (id) DO NOTHING;
