# Balances Demo
A demo project built with **Nest.js**, **TypeORM**, and **PostgreSQL** for managing user balances.

## How to use
Copy the example environment file:
```bash
$ cp .env.example.rc .env
```
Open the .env file and replace placeholder values with your actual configuration
```bash
$ yarn install
$ yarn build
```

Run existing migrations
```bash
$ yarn migration:run
```

Run the application
```bash
$ yarn start
```

### How to generate migration
```bash
$ yarn migration:generate ./src/migrations/<migration-name> 
```
