# Hackathon Submission Checklist — July Challenge

**Deadline:** July 31, 2026, 11:59 PM ET  
**Challenge:** Reimagine Creative Industries with AI  
**Team size:** solo or 2-5 (TBD)

---

## Required deliverables (from the rules)

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 1 | Working prototype built with IBM Bob | ⬜ | Ashwin | Use Bob for the **plan + generate code** workflow, not for actual image gen (use HF directly) |
| 2 | IBM SkillsBuild IBM Bob certificate (one per team member) | ⬜ | Ashwin | [SkillsBuild link](https://skillsbuild.org/adult-learners/explore-learning/artificial-intelligence) |
| 3 | Public GitHub repo with clear README | ⬜ | Ashwin | Push to github.com/yourname/conceptkit |
| 4 | Project submission page on challenge platform | ⬜ | Ashwin | BeMyApp dashboard |
| 5 | Demo video (max 3 min, public link) | ⬜ | Ashwin | YouTube unlisted or Loom |

---

## README sections (judges will scan for these)

- [ ] Problem statement
- [ ] Solution description
- [ ] AI approach and architecture (mention IBM Bob, Hugging Face models)
- [ ] Selected challenge theme ("Reimagine Creative Industries with AI")
- [ ] How IBM Bob was used (be specific: "Bob generated the project plan + scaffold for the API route")
- [ ] How to run locally (clone → npm install → add HF key → npm run dev)
- [ ] Screenshot or demo GIF of the working app

---

## Judging criteria alignment

| Criterion | Where we score |
|-----------|----------------|
| Technical Execution | Real AI pipeline (text → image model → curated layout), not just LLM call. Hugging Face + React + Next.js |
| Innovation | Niche vertical: creative directors, indie authors, marketers. Not another generic "AI art" tool |
| Challenge Fit | Direct hit: "AI creative partner" + "help people create faster" + "bridge imagination and execution" |
| Feasibility | Free APIs only, runs on a laptop, no infra cost |
| Real-World Impact | Solves a real pain point: staring at a blank moodboard for hours |

---

## Timeline

| Date | What to do |
|------|-----------|
| July 1-7 | IBM Bob signup, SkillsBuild course, GitHub DJ lab, push initial scaffold |
| July 8-14 | Build core features (mood generation, grid, export) |
| July 15-21 | Polish, mobile pass, error states, color palette extraction |
| July 22-28 | Record demo video, write README, take screenshots |
| July 29-30 | Buffer + final submission |
| July 31, 11:59 PM ET | Submit. No late entries |

---

## IBM Bob usage log (we need to prove we used it)

Keep a short log here as you go. Judges may ask.

- [ ] 2026-07-XX — Used Bob's "Plan" mode to generate the project architecture
- [ ] 2026-07-XX — Used Bob's "Code" mode to scaffold the API route
- [ ] 2026-07-XX — Used Bob's "Ask" mode to debug the prompt parsing
- [ ] 2026-07-XX — Used Bob's GitHub DJ lab (separate requirement)

> **Critical:** Be honest in the README about what Bob did and what you coded yourself. IBM judges will know if you fake it.

---

## Open questions to resolve this week

1. **Solo or team?** Decision needed by July 7. If team, we need 1-4 others (Discord, college WhatsApp groups, friends doing other hackathons)
2. **Which image model?** Stable Diffusion XL via HF is the safe default. Test by July 8.
3. **Hosted demo?** Need a public URL for the demo. Options: Vercel (free), GitHub Pages (no, it's a Next.js app), Railway, or just a public Loom video showing localhost
4. **Color palette extraction:** want to ship this in v1 or cut it? My recommendation: cut it from v1, add it back in v2 if time allows

---

## Files in this project

- `README.md` — the public-facing project doc
- `PLAN.md` — feature build list and week-by-week breakdown
- `IDEAS.md` — full brainstorm + scope decisions
- `ARCHITECTURE.md` — how the pieces connect (data flow, component tree)
- `SUBMISSION_CHECKLIST.md` — this file
- `app/` — Next.js app router pages and API routes
- `components/` — React components (to be added)
- `lib/` — shared utilities
