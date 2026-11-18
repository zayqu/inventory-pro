# Shared programming process and Figma workflow

**Applicability:** Every change in this repository, including fixes, features,
refactors, security work and documentation. Read this alongside the project's
existing `AGENTS.md`, `CLAUDE.md`, README, SECURITY, runbooks and decisions.
**Project-specific rules, security boundaries, legal requirements and release
controls take precedence.** This process defines required outcomes, not a
rigid order of internal thought or a reason to duplicate work.

## The six programming stages

1. **Analyze the problem.** State the real user/business objective, users and
   roles affected, inputs, expected outputs, acceptance criteria and constraints.
   Inspect the current system and its existing owning implementation; break
   larger tasks into independently verifiable parts. Distinguish facts,
   assumptions, open questions, permissions and risks.
2. **Design the solution.** Define flow, data and role boundaries before coding.
   Use a flowchart, pseudocode, acceptance examples or an explicit step-by-step
   algorithm proportional to complexity. Reuse and improve the current modules;
   avoid redundant `V2` routes, duplicate features or fictional states.
   For interface changes, follow the **Figma requirement** below.
3. **Write the code.** Make the smallest complete, maintainable change in the
   correct source files. Respect existing language, framework, design tokens,
   security, financial rules, database ownership and budget. Do not invent
   credentials, external integrations, personal facts or placeholder features.
4. **Compile or interpret.** Run the relevant checks for this stack: e.g.
   JavaScript/TypeScript build and typecheck, PHP/Laravel syntax/bootstrap, SQL
   migration validation, lint, or the actual interpreter. If an execution check
   cannot run, report it unambiguously; a source-code review is not a build.
5. **Test and debug.** Check the expected behavior, error paths, edge cases,
   authorization, data separation and regressions. Test mobile/desktop UI,
   keyboard accessibility and actual navigation where relevant. Fix discovered
   faults and repeat the failed check. Never claim a release is verified based
   on a preview alone. Avoid destructive production tests or real-user/provider
   traffic without approval.
6. **Document and maintain.** Update the project's existing progress,
   decision, handoff and deployment documents, including completed/pending
   items, verification evidence, risks and rollback notes. Keep user updates
   plain-language (what works, what remains, next, any approval needed).
   Record detailed paths, commits, failures and technical commands in the repo
   instead of flooding owner-facing messages.

## Figma requirement for UI/UX

- **Figma is the design source of truth for new or changed visual interfaces.**
  Before editing UI, inspect the project's approved Figma file and relevant
  userflow, frames, components, typography, colors, responsive states and
  interactions. Use the existing project file, not a generic template.
- Map each proposed screen or journey to a real implemented route, state,
  permission, backend capability and error/empty state. Never ship mock
  messages, paid plans, applications or indicators as if they were real.
- Use approved design tokens/components and preserve existing brand decisions.
  Note any necessary deviation with the reason and impact. Validate against
  Figma at relevant mobile, tablet and desktop widths.
- If Figma cannot be accessed, inspect a user-provided approved export or
  screenshots and record what was and wasn't verified. Do not claim full
  design fidelity without access. Avoid introducing a **new or materially
  redesigned** UI from guesswork; continue safe nonvisual work instead and
  flag the blocker.
- For backend-only, infrastructure, data, security, and documentation changes,
  Figma review is not a blocker unless the change alters user-visible behavior.
- If a project has no approved Figma file yet, establish one before committing
  to a new UI design. Do not invent a link or treat arbitrary reference images
  as approved assets.
- Figma is a *design reference*, not a replacement for accessible code,
  server-side authorization, integration tests or production verification.

## Acceptance gate and delivery

The change is complete only when analysis and acceptance criteria are satisfied,
the solution fits project architecture, implementation exists, stack-appropriate
build/interpret checks pass, tests/debugging and Figma visual checks (for UI)
are recorded, and the docs/handoff reflect reality. Flag any pending gate as
**not yet complete**. Never deploy, alter production databases/credentials,
purchase resources or change external provider settings without the required
project-specific authorization.

**Reference material provided by the owner:** six-stage programming process
(Analyze, Design, Write, Compile/Interpret, Test/Debug, Document/Maintain);
see the project conversation for the original reference links. This file
operationalizes those stages for ongoing engineering work.
