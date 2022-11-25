# {{PROJECT.TITLE}} - {{PROJECT.BACKENDFOLDER}}

## Getting started

```bash
# all commands used in ./{{PROJECT.BACKENDFOLDER}}
cd {{PROJECT.BACKENDFOLDER}}
```

Create config files for `development mode` and `production mode`.

```bash
cp config/config.default.php config/config.dev.php
cp config/config.default.php config/config.prod.php
```

**Note**: This file will not be under version control but listed in .gitignore.
