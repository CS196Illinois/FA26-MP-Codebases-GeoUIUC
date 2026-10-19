# Campus Orientation Feature: Research and Data

This folder documents the research behind GeoUIUC's campus orientation feature, which
helps students learn the buildings they will actually use. The feature has three parts:

- **A. Building names:** after each guess, the score screen shows the name of the correct
  place, so players learn it.
- **B. Freshman Mode:** rounds are drawn only from places almost every new student uses
  (residence halls, dining, libraries, student services and campus landmarks).
- **C. Major Mode:** the player picks a major, and rounds are drawn from the buildings where
  that major's core courses have in-person lectures.

> **Status (October 18, 2026):** research done. How buildings become game locations
> (coordinates, Street View coverage) and the in-game UI are **not decided yet**. They
> will be documented here once they are.

## Files

| File | Contents |
|---|---|
| [`freshman-buildings.md`](freshman-buildings.md) | Freshman Mode selection criteria, the 28 locations, everything excluded and why, and sources |
| [`majors-summary.md`](majors-summary.md) | Every major mapped to its set of buildings, plus the list of all unique buildings |
| [`majors/`](majors/) | One file per major: catalog URL, each core course with its Course Explorer link and Lecture building(s), choices, exclusions and gaps |

---

## How the modes work

### Freshman Mode

Rounds are drawn from a fixed list of **28 locations** in five categories:

| Category | Count | Source |
|---|---|---|
| Undergraduate residence halls (grouped exactly as University Housing groups them; 3 dining halls inside them are merged in) | 15 | University Housing |
| Ikenberry Dining Center (separate building) | 1 | University Housing Dining |
| General study libraries (Main Library, Grainger Engineering Library) | 2 | University Library |
| Student life and services (Illini Union, ARC, CRCE, McKinley Health Center) | 4 | Each unit's website |
| Campus landmarks from the official Self-Guided Quad Tour | 6 | Undergraduate Admissions |

**Scope in one sentence:** a place is included only if almost every first-year student
uses or visits it regardless of major, *and* it is listed on the official website of the
UIUC unit responsible for it. Classroom buildings are left to Major Mode. The Undergraduate
Library (closed in 2022) and the ACES Library (serves mainly one college) are excluded.
The full criteria and every exclusion are in
[`freshman-buildings.md`](freshman-buildings.md).

### Major Mode

The player picks one of **17 majors**: Computer Science and all 16 CS + X majors. Rounds
are drawn from the buildings where that major's **core courses** have **in-person
lectures**, using Fall 2026 data (or Spring 2026 data for core courses not offered in
Fall 2026). Across all 17 majors this gives **31 unique buildings**
(see [`majors-summary.md`](majors-summary.md)).

| Major | Home college |
|---|---|
| [Computer Science](majors/computer-science.md) | Grainger Engineering |
| [CS + Advertising](majors/cs-advertising.md) | Media |
| [CS + Animal Sciences](majors/cs-animal-sciences.md) | ACES |
| [CS + Anthropology](majors/cs-anthropology.md) | LAS |
| [CS + Astronomy](majors/cs-astronomy.md) | LAS |
| [CS + Bioengineering](majors/cs-bioengineering.md) | Grainger Engineering |
| [CS + Chemistry](majors/cs-chemistry.md) | LAS |
| [CS + Crop Sciences](majors/cs-crop-sciences.md) | ACES |
| [CS + Economics](majors/cs-economics.md) | LAS |
| [CS + Education](majors/cs-education.md) (Learning Sciences and Secondary Education concentrations) | Education |
| [CS + Geography & GIS](majors/cs-geography.md) | LAS |
| [CS + Linguistics](majors/cs-linguistics.md) | LAS |
| [CS + Music](majors/cs-music.md) | Fine and Applied Arts |
| [CS + Philosophy](majors/cs-philosophy.md) | LAS |
| [CS + Physics](majors/cs-physics.md) | Grainger Engineering |
| [Mathematics & Computer Science](majors/math-cs.md) | LAS |
| [Statistics & Computer Science](majors/stat-cs.md) | LAS |

---

## Data sources

| Data | Source | URL |
|---|---|---|
| List of CS + X majors | Siebel School of Computing and Data Science: Blended CS Degrees | <https://siebelschool.illinois.edu/cs-x> |
| Official program names and catalog pages | Academic Catalog 2026-2027: Degree Programs | <https://catalog.illinois.edu/degree-programs/> |
| Major requirements | Academic Catalog 2026-2027: each major's page (linked in its file) | `https://catalog.illinois.edu/undergraduate/...` |
| Fall 2026 (and Spring 2026) sections and buildings | Course Explorer (human-readable pages, linked per course) | `https://courses.illinois.edu/schedule/2026/<fall or spring>/<SUBJECT>/<NUMBER>` |
| Same data, machine-readable | Course Explorer public data service (what was actually read) | `https://courses.illinois.edu/cisapp/explorer/schedule/2026/<fall or spring>/<SUBJECT>/<NUMBER>.xml?mode=detail` |
| Freshman Mode places | University Housing, University Library, Illini Union, Campus Recreation, McKinley Health Center, Undergraduate Admissions | Listed in [`freshman-buildings.md`](freshman-buildings.md#6-sources) |

All pages were read on **October 18, 2026**.

---

## Methodology

### Scope

- **Majors:** Computer Science, plus every degree listed on the Siebel School's Blended CS
  Degrees page. That page includes Mathematics & Computer Science and Statistics &
  Computer Science, so they are counted as CS + X. Engineering majors other than CS were
  left out to keep the research manageable.
- **Term:** Fall 2026. A core course not offered in Fall 2026 uses **Spring 2026** data
  instead (see rule 6). Every course row says which term was used.
- **Sections:** in-person Lecture and Lecture-Discussion sections only (see rule 5).
- **Courses:** core courses of the major only (see rules 2-4).

### Rules

1. **Catalog first.** Each major's requirements come from its 2026-2027 Academic Catalog
   page. Nothing is filled in from memory.
2. **What counts as a core course.** A course is core if the catalog lists it as
   **required of every student** in the major (not one option among several), and its
   subject is **CS or the "X" discipline**:

   | Major | "X" subject codes counted |
   |---|---|
   | CS + Advertising | ADV |
   | CS + Animal Sciences | ANSC |
   | CS + Anthropology | ANTH |
   | CS + Astronomy | ASTR |
   | CS + Bioengineering | BIOE |
   | CS + Chemistry | CHEM |
   | CS + Crop Sciences | CPSC |
   | CS + Economics | ECON |
   | CS + Education | CI, EDPR, EDUC, EPSY, SPED (EPOL appears only as a choice) |
   | CS + Geography & GIS | GGIS |
   | CS + Linguistics | LING |
   | CS + Music | MUS |
   | CS + Philosophy | PHIL |
   | CS + Physics | PHYS |
   | Mathematics & CS | MATH |
   | Statistics & CS | STAT |

   This counts a course even if the catalog places it under a "foundations" heading (for
   example, CS 361 or BIOE 310). Each major's file notes when this happens.
3. **What is excluded, even if required:**
   - General Education requirements.
   - Orientation and first-year seminars: CS 100, ENG 100, LAS 100/101/102, FAA 101,
     MUS 100, EDUC 101, PHYS 110, BIOE 100, BIOE 120.
   - General math and science shared by many majors: calculus (MATH 220, 221, 231, 241),
     linear algebra (MATH 225, 227, 257, 415, 416), MATH 285, introductory university
     physics (PHYS 211, 212) and general chemistry (CHEM 102-105).
   - Required courses from other subjects, for example ECON 102 and BADM 320 in CS +
     Advertising, ACES 101 in CS + Crop Sciences, ECE 402 in CS + Music.
4. **Choices are recorded, not resolved.** When a requirement is "one of the following",
   "A or B", a track choice, or an elective list, the options are written down in the
   major's file under *Requirements recorded as choices*. They are **not** looked up and
   add **no** buildings.
5. **Which sections count.** For each core course, every section in the term used was
   read. Course Explorer labels each meeting with a type:
   - **Counted as a lecture:** Lecture (LEC) and Lecture-Discussion (LCD). Each major's
     file shows the type next to every section, e.g. `AL1 (LEC)`.
   - **Not counted:** online sections, i.e. Online Lecture (OLC) and Online (ONL). They
     have no building, so they are ignored.
   - **Not counted:** Discussion/Recitation (DIS), Laboratory (LAB),
     Laboratory-Discussion (LBD), and other types such as practicum, internship and
     research.
6. **Spring 2026 fallback.** If Course Explorer has no Fall 2026 schedule for a core
   course, its **Spring 2026** schedule is used instead. Such courses are marked
   "Spring 2026" in the *Term used* column, link to the Spring 2026 page, and are listed
   under *Gaps and notes*. A course with neither a Fall 2026 nor a Spring 2026 schedule
   is recorded as **not offered** and adds no building.
7. **Unclear locations are not counted.** If a section's location cannot be identified
   as one specific on-campus building, it is listed in the *Not counted* column with the
   reason and adds no building:
   - **"Library"**: Course Explorer gives only "Library" (room 66) for some sections of
     ANSC 224, ECON 302, EPSY 201 and STAT 400. It does not say which library building.
   - **"Location Pending"**: no building assigned yet (CPSC 444, one CI 403 section).
   - **Illini Center**: CS 421 sections there are restricted to Chicago programs, so
     they are off campus.
8. **Building names** are copied exactly as Course Explorer writes them (for example,
   "Materials Science & Eng Bld"). They are not yet matched to coordinates.

---

## Known limitations

- **CS 124 and CS 128 add no buildings.** Their Fall 2026 lectures are online, and online
  sections are ignored.
- **Spring 2026 fallback mixes two terms.** 21 core courses are not offered in Fall 2026
  and use Spring 2026 data instead (for example, 9 of the 16 required MUS courses in
  CS + Music). Spring 2026 rooms may differ from where the course meets the next time it
  is offered.
- **Three core courses have no data at all.** BIOE 404 (CS + Bioengineering), CPSC 212
  (CS + Crop Sciences) and CI 382 (CS + Education, Learning Sciences) are not offered in
  Fall 2026 or Spring 2026, so they add no building.
- **Some majors have no fixed "X" course.** In CS + Anthropology and CS + Chemistry, every
  X-side requirement is a choice, so their buildings come from CS courses only.
- **Unclear locations are dropped.** Sections listed only as "Library" or "Location
  Pending" are not counted (rule 7), so a building those courses really use may be
  missing.
- **Catalog headings are not uniform.** Different colleges structure requirements
  differently, so rule 2 is applied by subject code, not by heading. Borderline cases
  are documented in each major's file: PHYS 213/214 are counted for CS + Physics, and
  ECE 402 is not counted for CS + Music.
- **Snapshot in time.** Course schedules change during registration. The data reflects
  October 18, 2026.

## Decisions log

Decisions made by the project owner during the research, October 18, 2026:

| Question | Decision |
|---|---|
| Which majors are covered? | Computer Science and all 16 CS + X majors. Other engineering majors are out of scope. |
| Are Mathematics & CS and Statistics & CS "CS + X"? | Yes, as listed by the Siebel School. |
| Does a Lecture-Discussion (LCD) section count as a lecture? | Yes. |
| Online lecture sections? | Ignored (no building). |
| Core course not offered in Fall 2026? | Use Spring 2026 data and mark it clearly. |
| Unclear location ("Library", "Location Pending")? | Not counted, and documented. |
| Borderline cases (PHYS 213/214, ECE 402) | Keep the rule as applied: PHYS 213/214 counted, ECE 402 not counted. |
| CS + Education concentrations | One major (as in the catalog), with both concentrations documented. |
