<!--lint disable-->

---

status: proposed
date: 2022-11-07
deciders: Brad Andrick, Matt Hanson, Phil Varner

---

# AD: Modular Architecture Improvement

## Context and Problem Statement

This originated from a discussion after some brainstorming for how we might be able to fit a time slider component into the console. The problem that became apparent was the design of the UI was reaching it’s limits of adding new features. At the time the original app was created, it was supposed to show “with filmdrop you could build something like this” but has since changed into a fully configurable console that is intended to be configured and used by anyone with a STAC API as part of the FilmDrop Ecosystem. Based on this, and the need to keep adding new features to give clients value, a new design will be mocked that considers current Console needs as well as future extensibility while also improving and polishing the application to be fully responsive. Finally, there will be a consideration of application architecture to have the console utilize a side navigation to allow embedding/combing multiple applications into a single console app (so bringing in the dashboard, analytics, and others without those just being links to separate apps that open in a new tab).

## Decision Drivers

- Desire for the application to be able to add new features without bumping up against limitations of the legacy design
- Ability for the project to be extended and modified easily beyond the core components and functionality while not impacting or minimizing impact to the core design
- Community knowledge of patterns and tooling used must align with the goal of being easily understandable by potential contributors or people configuring it for their own use
- Should reuse existing filmdrop-ui application design, build patterns, and configuration files as much as possible to minimize major breaks with existing applications and deployment processes

## Considered Options

1. Move to constructing the app from a new shared library of components
2. Micro-frontends with module federation architecture
3. Keep the current design as a single application and use the existing pattern of just linking to external applications
4. Nest core applications within the console and document that pattern so it can be reused by others for adding applications outside of the core apps

## Decision Outcome

We decided on option 4: to nest core applications within the console and update directory structure and design to isolate each application's core (with a mechanism for sharing some state between apps) and to be documented with guidelines for extending the console beyond the core apps/functionality. This decision was made because it allows for the most flexibility in how the console is configured and extended. Additionally, it maintains the majority of the same design and patterns as the current console and it does not use uncommon patterns or technologies therefore allowing for easier adoption by other teams. It was determined to be the best combination of refactoring for scalability while also maintaining a fast velocity of development.

### Consequences

- Good:
  - most of the core code can be reused from the existing console.
  - the console can be extended to add new applications and features without having to rewrite the core code.
  - it does not introduce new patterns or uncommon technologies.
  - it minimizes the time spent to migrate the existing console to the new design.
  - it makes changes to core applications less likely to break a forked console when those changes to core are merged into the fork.
- Bad:
  - developers will need documentation on how to extend the console beyond the core apps/functionality. so more work to maintain for the console team.
  - the existing console was made using a build once, deploy anywhere approach. This means that the console will need to be rebuilt and redeployed to support new applications.
  - configuration file(s) and global state will likely need to be updated to support the new applications.
  - applications will be tightly coupled with the tech stack chosen for the console. and new applications will need to be built using the same tech stack (react, redux, vite, etc) as the console.
  - this pattern may encourage developers to fork the repo to make customizations in isolation, which could lead to a fork that is not maintained or updated with changes to the core applications.
  - it overall adds complexity to the console architecture and design.

<!--lint enable-->
