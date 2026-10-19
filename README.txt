FIRST USER TEST — LOCAL DISABLED FIXTURE

Target private repository: nurgetson-cloud/bugdrop-user-test.
Workspace: BugDrop Test. App: First User Test.
Selected independent quota:5 attempts per America/Phoenix day, not active.

Run locally with Node22.12+:
  npm start
Open http://first-user-test.localhost:4317
No root npm install is needed: the local server uses Node built-ins only.
It binds loopback, checks the Host header, and never calls an external service.
Stop with Ctrl+C. This is a development fixture, not a production server.

Verify:
  npm run check
  npm run sdk:check
The first command checks syntax, pinned SDK hashes and the disabled HTTP boundary.
The second installs the separate locked SDK consumer and typechecks/builds it.
Package installation downloads dependencies; it does not deploy or activate code.

Current boundary
Only GET/HEAD / serves a static page. Every report/API/source path is404.
Feedback button disabled. No client scripts, widget, analytics or external assets.
CSP blocks scripts, connections, forms and framing. Environment variables cannot
activate reporting. No API keys are read or stored. The node server does not
proxy SDK requests or read their bodies. Sensitive SDK/server files are not served.

SDK preparation
sdk/ contains exact local browser/server tarballs and copied upstream examples,
with package-lock.json and SHA256 provenance pinned to source:
cfac363ac8a3dae42ddd739977ed2f7f8310d5b3.
Its package metadata version0.1.0 is not an assertion of a published release.
Example exports are inert and NOT wired into this app. Some upstream examples
show default service URLs; do not use those defaults for the isolated test.
Even built sdk/dist files are not served. No public npm publication is required.

Future integration
Requires a reviewed code change and separate approval. Keep API keys server-only;
use the managedCapabilityEndpoint helper with explicit approved isolated endpoint
and exact app origin. Mount the pinned managed widget only after independent
runtime, authority, fences, quota and activity gates have passed. Do not use an
owner service as a fallback or run test submissions against owner reports/budget.
The current CSP deliberately prevents mounting: update it narrowly as part of
that later reviewed integration, never globally relax it to make a test pass.

Creating/pushing this private Git repository does not configure hosting,
deployment, invitations, routes or secrets. Reporting remains disabled. Existing reports/shared owner budget
are outside this local fixture. Artifacts under artifacts/ are local QA evidence.
