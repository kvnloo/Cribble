# Cribble all-Kevin-PR consolidation manifest

Candidate branch: `cumulative-all-prs`
Fork ancestry root: `58413ae75717967e8b69494ce4a27e51aed62976`
Upstream synchronized: `87a69590844caf34596ae9afce33ad918cd2d46b`
Ancestry-preserving merge: `609ed0b661da6483a15fb732be19f3cef5d8b10f`

This is the sole proposed base for subsequent Cribble feature work after independent approval. It is intentionally a logical commit train, not an opaque squash.

| Original PR | Original head | Consolidation commit(s) | Disposition | Reconstruction note |
|---|---|---|---|---|
| #76 | `8389ef4d8ceb18647b171a67b8340c773aed1e0b` | `58413ae75717967e8b69494ce4a27e51aed62976` | REPAIRED/RECONSTRUCTED | Already represented by the approved fork commit; exact Pi/OpenCode assets, provenance, validation and tests preserved. |
| #73 | `159ade1d013171531aed9417ca890572533e014e` | `ec2f5440997dd8ba7f426eeafa87c05afb86b0ff` | REPAIRED/RECONSTRUCTED | Original 060-062 migrations renumbered monotonically to 062-064 after upstream occupied 060-061; zero-head and renamed-head harness retained. |
| #70 | `e3d7d832e73d1e7f087e88a3dd8f5bfdf9065821` | `f233997864818cd4e111e1f5562b8751580215e7` | INCLUDED (rebased) | Orphaned welcome audio removed; contract test retained. |
| #68 | `68135d234218d3c71f11c9a1f98e25ae9e0eb372` | `8f8fd486e5e3e745c971009c925af939cd3f5b78` | INCLUDED (rebased) | Public-signup/current-CI README premise remains valid. |
| #66 | `bf4a0a027a31c063b335335b132279574a5d6378` | `0900dd9f05844113ef2e76485b79dcaca7381857` | INCLUDED (rebased) | Invite validation precedes affirmative framing. |
| #64 | `e2077c25135a4c5266b1495d4dcb3c6a2b057a2c` | `45d36846fefa7c711267536e6af7d6d0976e78fb` | INCLUDED (rebased) | Workflow integrity script and CI gate preserved. |
| #62 | `e53cb88e7b351d69f431c285e7677efaa53d7f4d` | `d650379dc3062d28a2a1d1cce535add8af3085c3` | REPAIRED/RECONSTRUCTED | Unknown-route 404 and site-lock 503 semantics merged with profile-route changes. |
| #59 | `6a501203bda37f7e91e4b57a70cd601e7e9afc48` | `b3739ed49fc00eb2fc8302ac97576d912b9fe37c` | REPAIRED/RECONSTRUCTED | Genuine absence becomes framework 404; outage remains retryable. Metadata and page share one React request-cached authoritative existence lookup; viewer-specific enrichment remains isolated. |
| #57 | `da390f0dcdf1d421c4ae6e918c381a9d013911b6` | `49d3337a5e167004bbca1f12e5818e84309d3de1` | INCLUDED (rebased draft intent) | Crisp tilt content contract and inventory retained; final reduced-motion browser gate is mandatory. |
| #55 | `7bb25ff6ae5745f1cd3105a5f9f3cd2c6382090f` | `af1521f1b63118219d6ef700387f0d4b42e39489` | INCLUDED (rebased) | Feedback launcher remains docked in desktop navigation rail. |
| #52 | `5a4c2ddc1cfbc3487f656dd39b6b5dec125c71a5` | `27c63d04de4cc0558287405b1b16ff70188b12dd` | INCLUDED (rebased) | Anonymous visitors skip account-only requests across all touched clients. |
| #49 | `41b3fe6c3a041c4ba5cf4d33110200d393dfc531` | `f6a6682a64db69274a7b64d3b4b98679e2704ab9` | INCLUDED (verbatim) | Unused UUID dependencies removed from manifest and lockfile. |
| #48 | `c9af23affc7b175af6652cb892340e9849140460` | `33311bfe2255b2048a662ff004008168e5ddd7e3`, `b3da084567753da6830a985c667bd53cd47d5424` | REPAIRED/RECONSTRUCTED | Fail-closed intent plus atomic serialized database admission, durable rate state, HMAC network fingerprints, bounded retention, no raw IP/user-agent storage, no PII response, concurrency/outage tests. |

## Known blocker repairs

- Migration collision: repaired via unique monotonic 062-065 sequence; migration 065 is waitlist admission.
- Profile truth/auth amplification: route-level existence resolution is request-cached and outage-safe; focused route/middleware tests cover 404/503 distinctions.
- Waitlist concurrency/privacy/rate limiting: one security-definer transaction owns locking, limits and insert; only normalized email plus HMAC fingerprint crosses the service boundary.
- Tilt: CSS contract test is included; independent reviewer must validate desktop/mobile/reduced-motion pixels before approval.

## Promotion contract

No push or upstream/fork mutation was performed. After independent approval, publish this branch as one consolidation PR and make its approved tip the sole base for subsequent Cribble feature branches. Promotion to fork main must preserve ancestry from `58413ae75717967e8b69494ce4a27e51aed62976`; never force-push.
