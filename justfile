# development server
dev:
    cd web && npm run dev -- --open

# build the site
build: install
    cd web && npm run build

# install dependencies
install:
    cd web && npm install

# update all dependencies
update:
    cd web && npm update

# deploy to cloudflare workers
deploy: build
    cd web && npx --yes wrangler deploy

# local preview with wrangler dev
preview: build
    cd web && npx --yes wrangler dev

# initialize terraform
tf-init:
    cd terraform && terraform init

# plan terraform changes
tf-plan:
    cd terraform && terraform plan

# apply terraform changes
tf-apply:
    cd terraform && terraform apply

# ------------------------------------------------------------------------------
# format
# ------------------------------------------------------------------------------

# format all code
[group('format')]
@fmt:
    just fmt-web && just fmt-tf

# format web code
[group('format'), private]
[working-directory: 'web']
fmt-web:
    npx prettier --write .

# format terraform code
[group('format'), private]
[working-directory: 'terraform']
fmt-tf:
    terraform fmt
