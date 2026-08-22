-- =====================================================
-- FIXED IDS
-- =====================================================

-- Tenant A
-- aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa

-- Tenant B
-- bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb


-- =====================================================
-- CUSTOM FIELDS
-- =====================================================

-- Tenant A: City
INSERT INTO custom_fields (
    id,
    tenant_id,
    label,
    type,
    status
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'City',
    'text',
    TRUE
);


-- Tenant B: City
INSERT INTO custom_fields (
    id,
    tenant_id,
    label,
    type,
    status
)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'City',
    'text',
    TRUE
);


-- =====================================================
-- TENANT A LEADS
-- =====================================================

-- L1: Ram Kumar
INSERT INTO leads (
    id,
    tenant_id,
    user_id,
    name,
    phone,
    country_code,
    e164,
    email,
    assigned_to,
    follow_up_date
)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'a0000000-0000-0000-0000-000000000001',
    'Ram Kumar',
    '9876543210',
    '+91',
    '+919876543210',
    'ram@example.com',
    'a0000000-0000-0000-0000-000000000001',
    '2026-08-10'
);


-- L2: Ramesh
INSERT INTO leads (
    id,
    tenant_id,
    user_id,
    name,
    phone,
    country_code,
    e164,
    email,
    assigned_to,
    follow_up_date
)
VALUES (
    'a1000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'a0000000-0000-0000-0000-000000000001',
    'Ramesh',
    '9123456789',
    '+91',
    '+919123456789',
    'ramesh@example.com',
    'a0000000-0000-0000-0000-000000000001',
    '2026-07-01'
);


-- L3: Priya
INSERT INTO leads (
    id,
    tenant_id,
    user_id,
    name,
    phone,
    country_code,
    e164,
    email,
    assigned_to,
    follow_up_date
)
VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'a0000000-0000-0000-0000-000000000002',
    'Priya',
    '9988776655',
    '+91',
    '+919988776655',
    'priya@example.com',
    'a0000000-0000-0000-0000-000000000002',
    NULL
);


-- L4: Anand (unassigned)
INSERT INTO leads (
    id,
    tenant_id,
    user_id,
    name,
    phone,
    country_code,
    e164,
    email,
    assigned_to,
    follow_up_date
)
VALUES (
    'a1000000-0000-0000-0000-000000000004',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'a0000000-0000-0000-0000-000000000001',
    'Anand',
    '9000000000',
    '+91',
    '+919000000000',
    'anand@example.com',
    NULL,
    '2026-08-15'
);


-- L5: Sita
INSERT INTO leads (
    id,
    tenant_id,
    user_id,
    name,
    phone,
    country_code,
    e164,
    email,
    assigned_to,
    follow_up_date
)
VALUES (
    'a1000000-0000-0000-0000-000000000005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'a0000000-0000-0000-0000-000000000002',
    'Sita',
    '9555555555',
    '+91',
    '+919555555555',
    'sita@example.com',
    'a0000000-0000-0000-0000-000000000002',
    '2026-08-01'
);


-- =====================================================
-- TENANT A - CITY VALUES
-- =====================================================

INSERT INTO lead_custom_field_values (
    id,
    lead_id,
    field_id,
    value
)
VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Chennai'
),
(
    'c1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Madurai'
),
(
    'c1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Chennai'
),
(
    'c1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'Coimbatore'
),
(
    'c1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'Chennai'
);


-- =====================================================
-- TENANT B LEADS
-- =====================================================

INSERT INTO leads (
    id,
    tenant_id,
    user_id,
    name,
    phone,
    country_code,
    e164,
    email,
    assigned_to,
    follow_up_date
)
VALUES
(
    'b1000000-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'b0000000-0000-0000-0000-000000000001',
    'John Smith',
    '5551112222',
    '+1',
    '+15551112222',
    'john@example.com',
    'b0000000-0000-0000-0000-000000000001',
    '2026-09-01'
),
(
    'b1000000-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'b0000000-0000-0000-0000-000000000001',
    'Sarah Johnson',
    '5553334444',
    '+1',
    '+15553334444',
    'sarah@example.com',
    NULL,
    NULL
);


-- =====================================================
-- TENANT B - CITY VALUES
-- =====================================================

INSERT INTO lead_custom_field_values (
    id,
    lead_id,
    field_id,
    value
)
VALUES
(
    'd1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'New York'
),
(
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'London'
);