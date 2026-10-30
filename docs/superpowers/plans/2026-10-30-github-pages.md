# FocusEnglish GitHub Pages Migration Plan

> Execute inline; retain the already verified app and use a bounded read-only review before publication.

**Goal:** Publish the existing dashboard and complete study resources at the user's public GitHub repository, then verify anonymous page and audio access.

**Architecture:** A small, reviewed workflow transfers the exact hashed static snapshot from the existing public Site into site/ on a GitHub runner. It commits those verified resources to this repository, so subsequent runs can use the local repository copy. A separate Pages job deploys only site/. The original desktop and old Site remain available.

**Tech stack:** Python stdlib, GitHub Actions official Pages actions, connected GitHub Git Data APIs.

## Constraints

- Repository: zhenzhenz952-dev/focusenglish, public, existing main branch.
- Transfer no learning backups, credentials or machine-specific provenance. Preserve the existing app state schema and all runtime assets.
- Verify every resource by byte length and SHA-256 before publication. HTML comes from its exact binary mirror because the old host injects per-request scripts.
- A bad transfer cannot overwrite a valid prior file or produce a Pages artifact.
- Do not claim an expected github.io address is live before an actual Pages deployment and HTTP checks succeed.
- Pages enablement requires the user's repository setting; the default workflow token cannot create that setting. Use the signed-in GitHub page if available, otherwise ask only for this remaining setting after source preparation.

## Steps

- [ ] Export a complete sanitized static file catalogue, preserving canonical paths and bytes.
- [ ] Test and implement the bounded verified transfer, cache reuse and invalid input handling.
- [ ] Add the official two-job Pages workflow; review and validate the seed locally.
- [ ] Write seed files through GitHub Git Data APIs and update main with an expected-head lease.
- [ ] Follow the transfer run, check committed file catalogue, and complete Pages enablement.
- [ ] Confirm a real successful Pages deployment and test anonymous page, MIME types and byte-range audio access.

## Device limitation

Physical iPhone installation and playback remain distinct from server HTTP checks. Changing origin requires exporting/importing the existing learning-record backup; records do not automatically move between domains.
