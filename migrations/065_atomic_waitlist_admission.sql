-- Atomic, durable, privacy-minimized public waitlist admission.
-- Raw network identifiers and user agents are never retained. The caller sends
-- an HMAC-SHA256 fingerprint which is useful only for bounded abuse controls.
CREATE TABLE IF NOT EXISTS public.waitlist_admission_limits (
  ip_fingerprint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL CHECK (attempt_count > 0),
  last_admitted_at TIMESTAMPTZ,
  PRIMARY KEY (ip_fingerprint, window_start)
);

ALTER TABLE public.waitlist_admission_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.waitlist_admission_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.waitlist_admission_limits TO service_role;

CREATE OR REPLACE FUNCTION public.admit_waitlist(
  p_email TEXT,
  p_ip_fingerprint TEXT,
  p_now TIMESTAMPTZ DEFAULT now()
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_window TIMESTAMPTZ := date_trunc('hour', p_now);
  v_attempts INTEGER;
  v_last TIMESTAMPTZ;
BEGIN
  IF p_email IS NULL OR p_ip_fingerprint !~ '^[0-9a-f]{64}$' THEN
    RETURN 'invalid';
  END IF;

  -- Serialize every admission for one privacy-safe network fingerprint.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_ip_fingerprint, 0));

  INSERT INTO public.waitlist_admission_limits(ip_fingerprint, window_start, attempt_count)
  VALUES (p_ip_fingerprint, v_window, 1)
  ON CONFLICT (ip_fingerprint, window_start) DO UPDATE
    SET attempt_count = public.waitlist_admission_limits.attempt_count + 1
  RETURNING attempt_count INTO v_attempts;

  IF v_attempts > 3 THEN RETURN 'rate_limited'; END IF;

  SELECT max(last_admitted_at) INTO v_last
  FROM public.waitlist_admission_limits
  WHERE ip_fingerprint = p_ip_fingerprint;
  IF v_last >= p_now - interval '1 day' THEN RETURN 'daily_limited'; END IF;

  BEGIN
    INSERT INTO public.waitlist(email, ip_address, user_agent)
    VALUES (lower(p_email), NULL, NULL);
  EXCEPTION WHEN unique_violation THEN
    RETURN 'duplicate';
  END;

  UPDATE public.waitlist_admission_limits
  SET last_admitted_at = p_now
  WHERE ip_fingerprint = p_ip_fingerprint AND window_start = v_window;

  -- Bounded retention; outage cleanup is retried by subsequent admissions.
  DELETE FROM public.waitlist_admission_limits WHERE window_start < p_now - interval '2 days';
  RETURN 'admitted';
END;
$$;

REVOKE ALL ON FUNCTION public.admit_waitlist(TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admit_waitlist(TEXT, TEXT, TIMESTAMPTZ) TO service_role;
