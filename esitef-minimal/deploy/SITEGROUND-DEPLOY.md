# Deploy a staging (SiteGround)

## 1. Obtener credenciales SSH

1. [Site Tools](https://my.siteground.com) → tu sitio → **Devs → SSH Keys Manager**
2. Genera un par de claves (o usa existente)
3. **Kebab menu → SSH Credentials** → anota:
   - **Hostname** → `SFTP_HOST` (ej. `ssh.esitef.com`)
   - **Username** → `SFTP_USER`
4. **Kebab menu → Private Key** → guarda en:
   ```bash
   esitef-minimal/deploy/.ssh/siteground_esitef
   chmod 600 esitef-minimal/deploy/.ssh/siteground_esitef
   ```
   SiteGround **no acepta password** en SSH/SFTP — solo clave privada.

## 2. Ruta del tema en staging

**Site Tools → Site → File Manager** → navega a:

```
staging3.esitef.com → public_html → online → wp-content → themes → esitef-minimal
```

Copia la ruta absoluta → `REMOTE_THEME_PATH`

## 3. Configurar (sin passphrase en disco)

### Opción A — GitHub Codespaces (recomendado)

1. **GitHub → Settings → Codespaces → Secrets** (o secrets del repo)
2. Crear:
   - `SFTP_USER` → usuario SSH de SiteGround
   - `SSH_KEY_PASSPHRASE` → passphrase de la clave privada
3. Reinicia el Codespace (o crea uno nuevo con `.devcontainer/devcontainer.json`)
4. Al arrancar, `prepare-env.sh` genera `.env.deploy` **sin secretos**

### Opción B — Sesión local / manual

```bash
export SFTP_USER=u1234-xxxxx
export SSH_KEY_PASSPHRASE='tu-passphrase'
./esitef-minimal/deploy/prepare-env.sh
```

## 4. Sincronizar (cada vez que cambies código)

```bash
./deploy-staging.sh
```

La passphrase se lee **solo** del entorno (`SSH_KEY_PASSPHRASE`), nunca de `.env.deploy`.

## 5. Caché

Site Tools → **Speed → Caching → Flush Cache** tras cada deploy.

## Seguridad

| Qué | Dónde |
|-----|-------|
| Clave privada `.pem` | `deploy/.ssh/` (gitignored) |
| Usuario, host, rutas | `.env.deploy` (gitignored) |
| Passphrase | Codespace secret o `export` — **nunca en archivos** |

## MCP vs SFTP

| Tarea | Herramienta |
|-------|-------------|
| Subir PHP/CSS/JS | Este script (SFTP) |
| Menús, páginas WP | MCP WordPress |
