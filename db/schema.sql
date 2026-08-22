-- ============================================
-- LEADS
-- ============================================

CREATE TABLE leads (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    country_code VARCHAR(10),
    e164 VARCHAR(20),
    email VARCHAR(255),

    assigned_to UUID,
    follow_up_date TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- CUSTOM FIELDS
-- ============================================

CREATE TABLE custom_fields (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,

    label VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    UNIQUE (tenant_id, label)
);


-- ============================================
-- LEAD CUSTOM FIELD VALUES
-- ============================================

CREATE TABLE lead_custom_field_values (
    id UUID PRIMARY KEY,

    lead_id UUID NOT NULL,
    field_id UUID NOT NULL,

    value TEXT,

    FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    FOREIGN KEY (field_id)
        REFERENCES custom_fields(id)
        ON DELETE CASCADE,

    UNIQUE (lead_id, field_id)
);