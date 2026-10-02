CREATE TABLE visitor_days (
  day TEXT PRIMARY KEY,
  total INTEGER NOT NULL CHECK (total >= 0)
) WITHOUT ROWID;

-- Keep only a daily hash of the random browser ID; no IP or browsing path is stored.
CREATE TABLE visitor_marks (
  day TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY (day, visitor_hash)
) WITHOUT ROWID;

-- A duplicate insert does not run this trigger. Recording a visit and updating
-- the total are one atomic operation, even when tabs submit concurrently.
CREATE TRIGGER count_new_visitor AFTER INSERT ON visitor_marks
BEGIN
  INSERT INTO visitor_days (day, total) VALUES (NEW.day, 1)
  ON CONFLICT (day) DO UPDATE SET total = total + 1;
END;
