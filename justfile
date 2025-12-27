# development server
dev:
    cd web && npm run dev

# build the site
build:
    cd web && npm run build

# deploy to cloudflare pages (production)
deploy branch="master": build
    cd web && npx --yes wrangler pages deploy dist --project-name bip110 --branch "{{branch}}"

# deploy preview
preview branch="": build
    #!/usr/bin/env bash
    set -euo pipefail

    cd web

    branch="{{branch}}"
    if [[ -z "$branch" ]]; then
      branch="${GITHUB_HEAD_REF:-$(git branch --show-current)}"
    fi

    if [[ -z "$branch" ]]; then
      echo "Could not determine branch; pass one explicitly: just preview <branch>" >&2
      exit 1
    fi

    # running `just preview` on `master` locally shouldn't create a "master preview" branch
    if [[ "$branch" == "master" ]]; then
      branch="preview"
    fi

    npx --yes wrangler pages deploy dist --project-name bip110 --branch "$branch"
