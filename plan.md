# PhonicsLearn - Game Plan (v2)

## Overview

A **games hub** for children aged 4+ with the flagship game being a **phonics adventure**. The hub shows game tiles — the phonics game is the first fully built game, with placeholder tiles for future games.

**Key pedagogical shift (v2):** Word-first phonics. Kids start with real words they already know (cat, dog, sun), then break them apart to discover letter sounds. This reverses the traditional SSP "sounds first → blend → words" sequence. Research shows kids engage more when they see the purpose of sounds — reading real words — before drilling isolated phonemes.

**Key design shift (v2):** Every world is a real game environment (side-scroller, factory contraption, underwater explorer), not a quiz with pictures. Phonics is embedded in gameplay — kids pop bubbles, feed machines, open treasure chests. The learning is the game, not a reward for doing flashcards.

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **SvelteKit** + Svelte 5 (runes) | App shell, routing, SSR |
| Game engine | **PixiJS 8** | GPU-accelerated 2D game canvas, sprites, physics, particles |
| Rewards | **canvas-confetti** | Confetti bursts on correct answers |
| Audio | **Web Speech Synthesis API** | Phoneme/word playback (TTS, no audio files needed) |
| Speech input | **Web Speech Recognition API** | Read-aloud detection (World 6) |
| Persistence | **localStorage** | Progress, rewards, settings (no backend) |
| Styling | **CSS custom properties** | "Candy Planet" theme for non-game UI |

### What We Dropped (and Why)

| Planned | Why dropped |
|---------|-------------|
| Konva.js + svelte-konva | PixiJS is GPU-accelerated, better for real game rendering |
| GSAP | PixiJS has built-in ticker + we use CSS animations for UI |
| Lottie (lottie-web) | Companion will be PixiJS sprites, not Lottie JSON |
| Rough.js | Doesn't fit the polished game aesthetic |
| Howler.js | Web Speech Synthesis API covers our needs without audio files |

### Directory Structure

```
src/
  lib/
    data/
      phonics-curriculum.ts    # Word-first curriculum: worlds, levels, word sets
      hub-games.ts             # Games hub tile definitions
    stores/
      progress.svelte.ts       # Per-level stars, unlocked worlds ($state runes)
      rewards.svelte.ts        # Collectibles, stickers earned
      settings.svelte.ts       # Audio on/off, companion name, parent gate
    engine/
      game-app.ts              # PixiJS Application wrapper for SvelteKit
      scene-manager.ts         # Scene lifecycle: load, enter, exit, dispose
      input.ts                 # Unified touch/mouse/keyboard input handler
      audio.ts                 # Web Speech TTS wrapper (phoneme + word speech)
      speech-recognition.ts    # Web Speech Recognition wrapper (read-aloud)
    scenes/
      meadow/                  # World 1: Sunny Meadow (Bubble Pop)
        MeadowScene.ts         # PixiJS scene: parallax grass, sky, clouds
        Bubble.ts              # Floating letter bubble sprite
        BubblePopGame.ts       # Game logic: pop bubbles to spell words
      workshop/                # World 2: Word Workshop (Word Machine)
        WorkshopScene.ts       # PixiJS scene: factory with conveyor belts
        LetterBall.ts          # Bouncy letter ball sprite
        WordMachine.ts         # Machine contraption that assembles words
      ocean/                   # World 3: Deep Ocean (Treasure Dive)
        OceanScene.ts          # PixiJS scene: underwater with fish, coral
        TreasureChest.ts       # Chest sprite that opens to reveal words
        DiverCharacter.ts      # Player character swimming
      castle/                  # World 4: Magic Castle (Spell Caster)
        CastleScene.ts         # PixiJS scene: castle with magic effects
        MagicWand.ts           # Wand that transforms words (silent-e)
      jungle/                  # World 5: Jungle Ruins (Word Explorer)
        JungleScene.ts         # PixiJS scene: overgrown ruins, vines
        StoneTablet.ts         # Ancient tablets with words to decode
      sky/                     # World 6: Sky Kingdom (Story Flight)
        SkyScene.ts            # PixiJS scene: clouds, airship, islands
        StoryBook.ts           # Decodable stories with read-aloud
    components/
      game/
        PixiCanvas.svelte      # Svelte wrapper mounting PixiJS Application
        GameHUD.svelte         # Overlay: score, stars, hint button, pause
        LevelComplete.svelte   # Celebration screen with stars + sticker
      ui/
        GameButton.svelte      # Big chunky touch-friendly button (72px+)
        StarRating.svelte      # 1-3 star display
        ProgressMap.svelte     # Board-game path with level nodes per world
        WorldSelect.svelte     # World selection screen (6 worlds)
        HubTile.svelte         # Game tile for the hub screen
        TrophyRoom.svelte      # Collection shelf of earned stickers
      feedback/
        ConfettiBurst.svelte   # canvas-confetti wrapper
  routes/
    +page.svelte               # Games Hub (tiles grid)
    +layout.svelte             # Global layout, fonts, theme
    phonics/
      +page.svelte             # World select screen
      [worldId]/
        +page.svelte           # Progress map for this world
        [levelId]/
          +page.svelte         # Game screen (mounts PixiCanvas)
      trophies/
        +page.svelte           # Trophy room / collection
```

---

## Games Hub Design

The landing page is a **games hub** — a grid of large, colorful tiles:

| Tile | Status | Description |
|------|--------|-------------|
| **Phonics Adventure** | Active | The flagship reading game |
| **Number Jungle** | Coming Soon | Math game (placeholder, greyed out) |
| **Spelling Bee** | Coming Soon | Spelling game (placeholder) |
| **Story Time** | Coming Soon | Interactive stories (placeholder) |

Each tile: emoji icon, game name, "Coming Soon" ribbon for locked ones, subtle bounce on hover/tap. 72px+ touch targets.

---

## Word-First Phonics Curriculum (6 Worlds)

### Pedagogical Approach

**Traditional SSP:** Learn /s/ → learn /a/ → learn /t/ → now blend "sat" → read "sat"
**Our approach:** See "CAT" with a picture of a cat → "What sounds do you hear?" → pop the C bubble, A bubble, T bubble → discover that C says /k/, A says /a/, T says /t/ → now you know 3 sounds AND you can read a word

Every level starts with **whole words kids already know** from life. The game breaks them apart through play. By the end, kids have implicitly learned all the same phonemes — but they never sat through a "letter drill."

### World 1: Sunny Meadow — Bubble Pop

**Theme:** Gentle meadow with floating letter bubbles, grass, flowers, butterflies
**Mechanic:** Bubbles float up from the grass. Each bubble has a letter. A word appears at the top with a picture. Kid pops the bubbles in order to spell the word. When all letters are popped, the word assembles and is read aloud.
**Target:** Ages 4+, absolute beginners

| Level | Words | Sounds Discovered | Scaffolding |
|-------|-------|-------------------|-------------|
| 1-1 | cat, sat, mat | c, a, t, s, m | Only 3 bubbles visible (no wrong choices). Tap any = hear sound. Order doesn't matter. |
| 1-2 | pin, pan, tin | p, i, n | 4 bubbles (1 distractor). Still very forgiving. |
| 1-3 | dog, log, fog | d, o, g, l, f | 5 bubbles. Must pop in order now. Gentle hint glow after 3s. |
| 1-4 | sun, run, bun | s, u, n, r, b | 5 bubbles. Hint delay increases to 5s. |
| 1-5 | hat, bat, rat | h, b, r (review a, t) | 6 bubbles. Review level. |
| 1-6 | cup, bus, bug | c, u, p, b, s, g | 6 bubbles. Mix of new + review. |
| 1-7 | jam, van, wax | j, v, w, x | 7 bubbles. Harder sounds. |
| 1-8 | yes, zip, quiz | y, z, qu | 7 bubbles. Final sounds. Boss level: spell 5 words in a row. |

**Confidence design:** Level 1-1 is impossible to fail. Any bubble tapped makes a happy sound. The word always assembles. 3 stars for everyone.

### World 2: Word Workshop — Word Machine

**Theme:** Steampunk-ish workshop with a big Rube Goldberg machine. Conveyor belts, gears, pipes, levers.
**Mechanic:** Letter balls roll down a chute. Kid drags them into the correct slot on the machine. When the word is complete, the machine whirs, clanks, and produces the word with a celebration.
**Target:** After discovering all letter sounds

| Level | Focus | Words | New Concept |
|-------|-------|-------|-------------|
| 2-1 | CVC review | cat, dog, sun, hat, bus | Drag-and-drop mechanics introduced |
| 2-2 | CVC with short-a | bag, map, cap, tap, nap | Short vowel focus |
| 2-3 | CVC with short-i | big, pig, dig, sit, bit | Short vowel contrast |
| 2-4 | CVC with short-o | hot, pot, box, fox, mop | Short vowel contrast |
| 2-5 | CVC with short-u | cup, pup, tub, rug, hug | Short vowel contrast |
| 2-6 | CVC with short-e | bed, red, pet, net, hen | Short vowel contrast |
| 2-7 | Mixed CVC | Random mix from all above | Speed round: machine goes faster |
| 2-8 | CCVC intro | stop, flag, trip, drum | 4-letter words, consonant clusters |

### World 3: Deep Ocean — Treasure Dive

**Theme:** Underwater world with coral reefs, fish, bubbles, sunken ships. Player controls a little diver character.
**Mechanic:** Swim through the ocean to find treasure chests. Each chest contains a word puzzle — the word is shown with a gap (e.g., "sh_p") and letter tiles float nearby. Pick the right letters to complete the word. Correct = chest opens, gold coins burst out.
**Target:** Digraphs and letter combinations

| Level | Focus | Words | Digraphs |
|-------|-------|-------|----------|
| 3-1 | sh words | ship, shop, fish, wish | sh |
| 3-2 | ch words | chip, chop, rich, much | ch |
| 3-3 | th words | thin, this, bath, math | th |
| 3-4 | ck words | duck, rock, sock, back | ck |
| 3-5 | ng words | ring, sing, long, king | ng |
| 3-6 | wh words | when, what, whip, wheel | wh |
| 3-7 | Mixed digraphs | Mix from all above | Review |
| 3-8 | Boss: Sunken Ship | Multi-word puzzle chain | All digraphs |

### World 4: Magic Castle — Spell Caster

**Theme:** Enchanted castle with magic wands, spell books, glowing runes, friendly ghosts.
**Mechanic:** Kid wields a magic wand. Tap a word to cast a spell — adding silent-e transforms it (cap → cape). Visual magic effect shows the transformation. Also: vowel team spells where two vowels merge with a sparkle effect.
**Target:** Magic-e and vowel teams

| Level | Focus | Words | Concept |
|-------|-------|-------|---------|
| 4-1 | Magic-e with a | cap→cape, tap→tape, mat→mate | Silent-e changes vowel sound |
| 4-2 | Magic-e with i | pin→pine, bit→bite, kit→kite | |
| 4-3 | Magic-e with o | hop→hope, not→note, rob→robe | |
| 4-4 | Magic-e with u | cub→cube, cut→cute, tub→tube | |
| 4-5 | ai/ay words | rain, tail, play, day | Vowel teams |
| 4-6 | ee/ea words | tree, bee, sea, eat | Vowel teams |
| 4-7 | oa/ow words | boat, coat, snow, grow | Vowel teams |
| 4-8 | Mixed magic | All transformations + vowel teams | Boss level |

### World 5: Jungle Ruins — Word Explorer

**Theme:** Ancient overgrown jungle ruins with stone tablets, vines, waterfalls, parrots.
**Mechanic:** Explore ruins to find stone tablets with inscribed words. Decode words by identifying blends and patterns. Tap parts of the word to hear them, then read the whole thing. Collect ancient artifacts for each decoded word.
**Target:** Consonant blends and r-controlled vowels

| Level | Focus | Words | Patterns |
|-------|-------|-------|----------|
| 5-1 | bl/cl/fl blends | blue, clap, flag, flat | Initial blends |
| 5-2 | br/cr/dr blends | bring, crab, drop, drum | Initial blends |
| 5-3 | st/sp/sw blends | stop, spot, swim, step | Initial blends |
| 5-4 | tr/gr/fr blends | trip, grab, frog, from | Initial blends |
| 5-5 | ar words | car, star, farm, park | R-controlled |
| 5-6 | or/er words | fork, corn, her, fern | R-controlled |
| 5-7 | ir/ur words | bird, girl, burn, turn | R-controlled |
| 5-8 | Mixed exploration | All blends + r-controlled | Boss: decode a message |

### World 6: Sky Kingdom — Story Flight

**Theme:** Above the clouds — airship, floating islands, rainbows, friendly birds.
**Mechanic:** Fly an airship between floating islands. Each island has a short decodable story (3-5 sentences). Kid reads the story aloud (speech recognition) or taps words to hear them. Stories use all previously learned phonics patterns. Completing stories unlocks new islands.
**Target:** Fluency and comprehension — putting it all together

| Level | Focus | Story Theme |
|-------|-------|-------------|
| 6-1 | CVC sentences | "The cat sat on the mat." |
| 6-2 | Digraph sentences | "The ship went to the shop." |
| 6-3 | Blend sentences | "The frog swam in the stream." |
| 6-4 | Magic-e sentences | "The kite flew over the lake." |
| 6-5 | Mixed short story | "Sam and the Big Fish" (5 sentences) |
| 6-6 | Mixed short story | "The Magic Cape" (5 sentences) |
| 6-7 | Mixed short story | "Trip to the Farm" (6 sentences) |
| 6-8 | Final story | "The Sky Kingdom" (8 sentences, uses everything) |

---

## Reward System

### Design Principles (unchanged)
- Rewards tied to **genuine mastery**, not time spent
- **No timers**, no streaks, no leaderboards, no variable rewards
- **No guilt** for missing days
- Consistent reward values (no inflation)

### Reward Layers

| Layer | Mechanism |
|-------|-----------|
| **Instant feedback** | Confetti + happy sound on correct. Gentle wobble + soft sound on wrong. |
| **Stars** | 1-3 stars per level based on accuracy. First levels give 3 stars to everyone. |
| **Stickers** | One collectible sticker per level. Themed to the world. |
| **Progress Map** | Board-game path per world. Visual proof of progress. |
| **World unlock** | Complete all 8 levels in a world → unlock next world with fanfare. |

### "Safe Failure" Design
- Wrong answer → element gently bounces back with soft sound
- After 2 wrong → hint (correct answer subtly glows)
- After 3 wrong → show the answer with sound, auto-complete, move on
- Never block progress permanently
- No red X, no buzzer, no negative sounds

---

## UX Design Principles

### Motor Skills (Ages 4-7)
- Touch targets: **72px+** minimum (upgraded from 60-80px)
- Only primal gestures: tap, horizontal swipe, drag-and-drop
- No: double tap, pinch, rotate, accelerometer
- Press-on events (not release-off)

### Visual Design
- No abstract icons — literal imagery only
- Every interaction = immediate multisensory feedback (animation + sound)
- No hamburger menus — WYSIWYG navigation
- Predictable navigation consistent across sessions
- Back button always visible and in the same place

### Neuroinclusive Design
- **Dyslexia**: Sans-serif fonts, increased letter spacing, pastel backgrounds
- **Autism**: Predictable patterns, no surprise UI changes, sensory controls
- **ADHD**: Visual minimalism, progressive disclosure, bite-sized levels

### Session Length
- Each level: 2-4 minutes
- Gentle "take a break" prompt after 4 levels (non-blocking, dismissible)

---

## Aesthetic: "Candy Planet"

- **Colors**: Warm pastels with bold primary accents. No harsh white backgrounds.
- **Typography**: Chunky, rounded sans-serif (Nunito / Baloo 2). Large letter size.
- **Shapes**: Everything rounded — buttons, cards, containers, game elements.
- **Game worlds**: Each world has its own color palette within the Candy Planet family.
- **Letters in game**: Large, clear, on colored bubble/ball/chest sprites. High contrast.
- **Backgrounds**: Layered parallax (PixiJS). Soft gradients, subtle floating particles.

---

## Build Order

1. ~~Scaffold SvelteKit project~~
2. ~~Write plan.md v1~~
3. ~~Build initial game components (TapSound, PickSound, DragBuild) — scrapped, too quiz-like~~
4. ~~Redesign: word-first curriculum + game worlds~~
5. ~~Write plan.md v2 (this document)~~
6. Install PixiJS + set up engine wrapper
7. Build PixiCanvas.svelte (Svelte ↔ PixiJS bridge)
8. Build World 1: Sunny Meadow (Bubble Pop) — levels 1-1 through 1-8
9. Build GameHUD + LevelComplete overlays
10. Wire progress store to PixiJS scenes
11. Build World Select + Progress Map screens
12. Build World 2: Word Workshop (Word Machine)
13. Build World 3: Deep Ocean (Treasure Dive)
14. Build World 4: Magic Castle (Spell Caster)
15. Build World 5: Jungle Ruins (Word Explorer)
16. Build World 6: Sky Kingdom (Story Flight)
17. Trophy room
18. Polish: particles, transitions, sound effects
19. Test on tablets + phones
