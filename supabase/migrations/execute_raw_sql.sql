-- Function to execute raw SQL queries (SELECT only)
-- This is used by the AI Analytics feature to execute dynamically generated queries

CREATE OR REPLACE FUNCTION execute_raw_sql(sql_query text)
RETURNS json AS $$
DECLARE
  result json;
  modified_query text;
BEGIN
  -- Security: Only allow SELECT statements
  IF position('select' in lower(sql_query)) != 1 THEN
    RAISE EXCEPTION 'Only SELECT statements are allowed.';
  END IF;

  -- Safety: Add LIMIT if not present to prevent large result sets
  modified_query := sql_query;
  IF lower(sql_query) NOT LIKE '%limit%' THEN
    modified_query := sql_query || ' LIMIT 500';
  END IF;

  -- Execute the query and convert results to JSON
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || modified_query || ') t' INTO result;

  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
-- Since the API route already checks for admin authentication via cookies,
-- we grant to anon/authenticated. The admin check provides the security layer.
GRANT EXECUTE ON FUNCTION execute_raw_sql(text) TO anon, authenticated;

