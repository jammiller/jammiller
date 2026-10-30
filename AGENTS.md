# Product boundaries

Tremonix and DataPulse Social are separate products. Do not treat them as interchangeable because they share a repository, Vercel team, or historical deployment configuration.

Before deploying, connecting a repository, or changing domains, verify the intended product, Vercel project, repository/branch, and domain mapping. Shared historical configuration is not authorization to deploy one product to another product's project. Ask the owner when the intended mapping is unclear.

Read [PRODUCT_SEPARATION.md](PRODUCT_SEPARATION.md) for the recorded incident and unresolved configuration.

PulseOS is also strictly separate from Tremonix and DataPulse Social. The default
web build is Tremonix-only; use `build:pulseos` exclusively for PulseOS. Never add
another business's entry or public assets to either isolated build. Build guards
must pass before deployment. Do not reconnect shared Git auto-deployment without
an owner-approved isolated release source. Shared storage/account isolation has
not been verified by these build checks.
