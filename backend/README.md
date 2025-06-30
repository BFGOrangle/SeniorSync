## Spring boot backend
- Our backend code is at `./seniorsync/`, a springboot project.
- When running locally, set the profile to local (you can edit the intellij config to do this too)

## Docker Compose File
**Currently, we are using docker compose to:**
- Spin up local postgres database and 
- The running of sql db migration scripts with `Flyway`.
  - Read more on flyway under the `README.md` at `./database/`