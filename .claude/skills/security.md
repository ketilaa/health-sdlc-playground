# Skill: Security

Apply these checks in every feature that writes or modifies code.

## Developer checklist

Before returning STATUS: OK, review every file you wrote against this checklist. Flag and fix any issue found — do not defer security problems to the code reviewer.

**Injection**
- User-controlled input is never interpolated into shell commands, SQL queries, or `eval`
- Dynamic `dangerouslySetInnerHTML` / `innerHTML` is not used with untrusted data

**Secrets**
- No API keys, tokens, passwords, or credentials are hardcoded in source files
- Secrets are read from environment variables only

**Dependencies**
- No new `npm` or `pip` package is added without a clear reason stated in your summary
- `npm audit --audit-level=high` (or `pip-audit`) passes — if it fails, fix or document why the vulnerability is not exploitable in this context

**Authentication and authorisation**
- No endpoint or page bypasses an auth check that exists elsewhere in the codebase
- User-supplied IDs are validated against the authenticated user's scope before use

**Data exposure**
- Server responses do not include fields beyond what the Gherkin scenario requires
- Error messages do not leak stack traces, file paths, or internal identifiers to the client

If a finding is out of scope for this feature or not fixable without spec changes, note it explicitly in your summary under a **Security notes** heading.

## run-tests.sh additions

Include a dependency audit step in `run-tests.sh`:

Node.js:
```bash
npm audit --audit-level=high
```

Python:
```bash
pip-audit --desc
```

## Code reviewer checklist

Check each of the following explicitly. Any violation is blocking.

- **Injection:** user input is not interpolated into shell commands, SQL, or `eval`; `dangerouslySetInnerHTML` / `innerHTML` is not used with untrusted data
- **Secrets:** no API keys, tokens, or passwords are hardcoded; secrets come from environment variables only
- **Dependencies:** `npm audit --audit-level=high` (or `pip-audit`) would pass with the packages introduced; flag any new dependency without a stated reason in the developer summary
- **Auth bypass:** no endpoint or page skips an auth check present elsewhere in the codebase
- **Data exposure:** responses do not include fields beyond what the Gherkin requires; error messages do not leak stack traces or internal paths to the client
