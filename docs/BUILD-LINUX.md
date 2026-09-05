# Build do cliente UnyDesk para Linux (CI)

Neste host de desenvolvimento o Rust/Flutter podem não estar instalados.
Use GitHub Actions:

## Disparo (recomendado: os dois juntos)

**Actions → Build UnyDesk Clients → Run workflow**  
(Linux + Windows em paralelo)

Ou só Linux: **Actions → Build UnyDesk Linux → Run workflow**

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
