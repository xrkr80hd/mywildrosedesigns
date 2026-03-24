# Admin Local Bypass Policy

Use this only for local Docker testing.

## Testing Commands

- `TOFTON` = turn local testing mode on
- `TOFTOFF` = turn local testing mode off
- Do not use raw `TOFT` anymore because it is too easy to flip the wrong way.

## Rule

- Never use this for production.
- Never commit the local `.env` file.
- Always turn admin login back on after testing.

## File Used

- Local-only file: `mywildrosedesigns_site_clone/.env`

## Temporary Disable Admin Login

1. Open `mywildrosedesigns_site_clone/.env`
2. Set:

```env
ADMIN_BYPASS_AUTH=true
```

3. Rebuild Docker:

```bash
cd mywildrosedesigns_site_clone
docker compose up --build -d
```

4. Test admin at:

```text
http://localhost:3000/admin
```

## Put Admin Login Back When Testing Is Done

1. Open `mywildrosedesigns_site_clone/.env`
2. Change this line to:

```env
ADMIN_BYPASS_AUTH=false
```

3. Rebuild Docker again:

```bash
cd mywildrosedesigns_site_clone
docker compose up --build -d
```

4. Confirm admin now requires login again.

## Strict Consistency Rule

- Testing mode: `ADMIN_BYPASS_AUTH=true`
- Normal mode: `ADMIN_BYPASS_AUTH=false`
- After testing, always put it back to `false` immediately.

## Command Rule

- `TOFTON`: set `ADMIN_BYPASS_AUTH=true`
- `TOFTOFF`: set `ADMIN_BYPASS_AUTH=false`
- These commands are explicit and should be used instead of a toggle command.
