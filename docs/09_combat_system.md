# ⚔️ Combat & Interaction System

## 🎯 Overview

The game combines:

- 🧩 Turn-based board strategy (movement & planning)
- ⚡ Real-time interaction events (skill & reaction)

This hybrid system ensures:

- Strategic depth from board movement
- Engagement and excitement through interactive encounters

---

## 🧠 Core Concept

> “Every wrong move can trigger a challenge. Survival depends on both strategy and reaction.”

---

## 🧩 Two-Layer System

### 1. Board Layer (Turn-Based)

- Player moves across tiles
- AI spreads corruption and places traps
- Strategic decisions are made here

---

### 2. Event Layer (Real-Time / Interactive)

Triggered when:

- Player steps on trap
- Player enters corrupted tile
- AI launches special attack

---

## ⚡ AI Attack System

AI uses **Event-Based Attacks** instead of direct damage.

Each attack:

- Has a visual warning (telegraph)
- Requires player reaction (QTE or movement)
- Applies penalty if failed

---

## ⚔️ Attack Types & Counters

---

### ⚡ 1. Thunder Strike

**Attack:**

- Target tile glows briefly
- Lightning strikes after delay

**Player Counter:**

- Rapid tap / key spam (QTE)

**Failure Result:**

- HP loss
- Stunned (skip next turn)

---

### 🌑 2. Root Snare

**Attack:**

- Roots emerge and trap player

**Player Counter:**

- Rapid tapping or swiping

**Failure Result:**

- Movement disabled (1 turn)

---

### ☠️ 3. Poison Cloud

**Attack:**

- Area becomes toxic for multiple turns

**Player Counter:**

- Move out quickly OR use Cleanse ability

**Failure Result:**

- Gradual HP reduction

---

### 🕳️ 4. Trap Collapse

**Attack:**

- Ground cracks and collapses

**Player Counter:**

- Timing-based tap (perfect timing)

**Failure Result:**

- Player pushed backward

---

### 👁️ 5. Illusion Tile

**Attack:**

- Fake safe tile appears

**Player Counter:**

- Use Reveal ability

**Failure Result:**

- Hidden trap triggered

---

### 🌌 6. Corruption Wave

**Attack:**

- Corruption spreads rapidly across tiles

**Player Counter:**

- Move to safe zone OR Cleanse

**Failure Result:**

- Area becomes hazardous

---

## 🛡️ Player Abilities

---

### 🧼 Cleanse

- Removes corruption from nearby tiles
- Counters: Poison, Corruption Wave

---

### 👁️ Reveal

- Reveals traps and fake tiles
- Counters: Illusion

---

### ⚡ Dash

- Move 2 tiles in one turn
- Counters: Escape danger zones

---

### 🛡️ Shield

- Blocks next incoming damage
- Counters: Thunder, Collapse

---

## 🔄 Cooldown System

- Each ability has cooldown (2–4 turns)
- Prevents spamming
- Encourages strategic use

---

## 🔗 Combo System

Players can combine abilities for advanced play:

### Examples:

- Dash → Cleanse
  Escape danger + clear path

- Reveal → Safe Route
  Detect and avoid traps

- Shield → Tank Attack
  Absorb high damage safely

---

## 🎯 Attack Trigger Conditions

AI attacks occur when:

- Player enters corrupted tile
- Player steps on trap
- AI selects attack during its turn
- Random chance (low frequency)

---

## 📈 Difficulty Scaling

### Early Game:

- Basic attacks
- Low frequency

### Mid Game:

- Multiple attack types
- Increased AI aggression

### Late Game:

- Combo attacks
- Faster corruption spread
- High pressure gameplay

---

## 💥 Game Feel Goals

The system should create:

- Tension → “Something might happen”
- Reaction → “I need to act fast”
- Satisfaction → “I survived that”

---

## 🎮 Final Experience

> “A strategy game where every decision matters, and every mistake triggers a skill-based survival challenge.”
