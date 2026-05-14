# 🤝 Guia per a Col·laboradors

Gràcies per voler ajudar en el projecte **Codex**! Aquesta guia t'ajudarà a començar a col·laborar de forma organitzada.

## 🛠️ Configuració de l'Entorn

1. **Fes un Fork** del repositori (o clona'l si ets de l'equip).
2. **Crea una branca** per a la teva funcionalitat: `git checkout -b feature/nom-de-la-feature`.
3. **Aixeca l'entorn** amb Docker: `./init-dev.sh`.

## 📜 Estil de Codi

- **Backend (PHP):** Segueix els estàndards [PSR-12](https://www.php-fig.org/psr/psr-12/). Pots utilitzar `composer lint` per verificar el format.
- **Frontend (JS):** Utilitza components funcionals de React amb Hooks. Segueix el format de Prettier inclòs al projecte.
- **Commits:** Recomanem utilitzar [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
  - `feat: nova funcionalitat`
  - `fix: correcció d'un error`
  - `docs: canvis en la documentació`
  - `refactor: canvi en el codi que no arregla un bug ni afegeix una feature`

## 🚀 Flux de Treball

1. **Issues:** Abans de començar, revisa si hi ha una Issue oberta sobre el que vols fer o crea'n una de nova.
2. **Pull Requests:** Quan tinguis la teva feina llesta, obre una PR cap a la branca `dev`.
3. **Review:** Algú de l'equip revisarà el teu codi i podrà suggerir canvis abans de fer el merge.

## 📁 On és cada cosa?

- Si vols tocar la **lògica de base de dades o API**: ves a `/api`.
- Si vols tocar la **interfície d'usuari**: ves a `/client`.
- Si vols tocar els **xats en temps real**: ves a `/socket`.
- Si vols tocar el **desplegament (Docker/Nginx)**: ves a `/docker`.

---

## 🆘 Necessites ajuda?

Si tens dubtes, pots contactar amb els administradors del repositori o obrir una discussió al GitHub.
