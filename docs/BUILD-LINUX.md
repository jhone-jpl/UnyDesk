# Build do cliente UnyDesk para Linux (CI)

Neste host de desenvolvimento o Rust/Flutter podem não estar instalados.
Use GitHub Actions:

## Disparo

GitHub → **Actions** → **Build UnyDesk Linux** → **Run workflow**

Ou push em `main` alterando `unydesk-client/**` ou este workflow.

## Artefatos

| Artifact | Conteúdo |
|----------|----------|
| `unydesk-linux-x64` | Bundle Flutter (`rustdesk` + `lib/`, `data/`) |
| `unydesk-linux-x64-deb` | Pacote `.deb` (se o `build.py` gerar) |

## Uso rápido (bundle)

```bash
chmod +x rustdesk
./rustdesk
```

Configure ID/Relay (hbbs), key (`docs/rendezvous-public-key.txt`) e API `http://<host>:21114`.

## Deb

```bash
sudo apt install ./unydesk-*.deb
```
