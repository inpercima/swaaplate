# {{PROJECT.TITLE}} - {{PROJECT.SERVERDIR}}

## Getting started

```bash
# all commands used in ./{{PROJECT.SERVERDIR}}
cd {{PROJECT.SERVERDIR}}
```

Create config files for `devMode` and `prodMode`.

```bash
cp config/config.default.php config/config.dev.php
cp config/config.default.php config/config.prod.php
```

**Note**: This file will not be under version control but listed in .gitignore.
