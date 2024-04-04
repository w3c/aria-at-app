# Expected workflow for the development to release process

## Branching strategy

- Checkout the `development` branch after cloning (or forking) the repository
- Create an appropriately named branch

## Commits

To easily facilitate CHANGELOG generation, automatic version bumps (using [SEMVER](https://semver.org) - X.Y.Z) and version tagging, commit messages MUST follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) practice, which is used in combination with the GitHub Workflow Action, [TriPSs/conventional-changelog-action](https://github.com/TriPSs/conventional-changelog-action).

What this is means is commits intended to automatically update the [CHANGELOG.md](https://github.com/w3c/aria-at-app/blob/development/CHANGELOG.md) and version must be written in a specific format:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Additional examples are available [here](https://www.conventionalcommits.org/en/v1.0.0/#examples).

Generally, commits in the following format will be sufficient:
- `fix: <description>` will increment **PATCH** in X.Y.**Z**
- `feat: <description>` will increment **MINOR** in X.**Y**.Z
- `BREAKING CHANGE: OR '!' after any type/scope, eg. feat!: <description>` will increment **MAJOR** in **X**.Y.Z
  - NOTE: `zsh` users will have to surround commit messages with single quotes (`'<message>'`) instead of double quotes (`"<message>"`), as `!` is a special modifier for `zsh`

**NOTE:** This doesn't mean ALL commits have to be written this way, explained in [Merging Pull Request](#merging-pull-request).

## Creating Pull Request

- Finalize work on branch
- Create Pull Request from work on branch, typically using `development` as the target branch

## Merging Pull Request

### Merging to `development`

Commits to `development` can either be done using a merge commit or it can be squashed. Squashing is preferred, depending on how the commits are structured.

If the commits in the Pull Request are mainly following the Conventional Commits practice, using a merge commit would be appropriate, so the scoped commits are not lost when being included in the CHANGELOG.

Otherwise, use the squash and merge method, and a type (and scope, if applicable) MUST be set for the squashed commits' title before merging.

### Merging to `releases`

Commits to `releases` MUST be merged with `Create a merge commit`, so that individual PRs or commits which have already been scoped at that point can be properly included in the CHANGELOG.md update.

**NOTE:** The [version-changelog-update](https://github.com/w3c/aria-at-app/blob/development/.github/workflows/version-changelog-update.yml) workflow will automatically merge any new changes found in `releases` back into `development`, including the CHANGELOG.md update and any last minute changes before the release.

## Releasing to production

When deploying to production, merge `releases` into `main`.
