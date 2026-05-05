ALTER TABLE system_config
    ADD COLUMN banner_audience VARCHAR(20) NOT NULL DEFAULT 'ALL';

UPDATE system_config
SET banner_audience = 'ALL'
WHERE banner_audience IS NULL OR banner_audience = '';
