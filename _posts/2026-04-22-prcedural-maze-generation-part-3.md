---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 3 (Visualization and Final Setup)"
date: 2026-04-22
author: Roberta
categories: [Tutorials]
published: false
excerpt: >
  In Part 3, we bring the maze to life. You will build the visual system using HISM components, create an entrance and exit, and finalize the Construction Script so the maze generates fully in the editor.
---

# Building a Procedural Maze Generator in UE5 Blueprints — Part 3

## Introduction

In Part 2, you built the full maze generation logic.

Your system can now:

- generate a complete maze in memory
- track visited cells
- remove walls between cells
- backtrack correctly using a stack

> But right now, nothing is visible.

In this part, we will fix that.

---

## What You Will Build in This Part

By the end of Part 3, your system will:

- render the maze using floor and wall meshes
- place walls based on cell data
- create a random entrance and exit
- fully generate the maze in the editor using the Construction Script

> This is where everything finally comes together.

---

## Before You Start

You should already have from Part 2:

- `InitializeGrid`
- `GetUnvisitedNeighbors`
- `RemoveWallBetween`
- `GenerateMaze`

And your Construction Script should already:

- clear instances
- clear `MazeGrid`
- set `RandomStream`

---

# Step 1 — Create the `BuildMazeVisuals` Function

---

## What this step does

This function takes your invisible maze data and converts it into:

- floor meshes
- wall meshes

> This is what makes the maze visible in the world.

---

## Instructions

### Step 1.1 — Create the function

#### Step 1.1.1 — Add the function

1. In **My Blueprint → Functions**

2. Click:

   **+ Function**

3. Name it:

   `BuildMazeVisuals`

---

### Step 1.2 — Add a For Loop

#### Step 1.2.1 — Create the loop

1. Right-click in empty graph space

2. Search for:

   `For Loop`

3. Click it

---

#### Step 1.2.2 — Set the loop range

4. Drag `MazeGrid` into the graph as **Get**

5. Drag from it and search:

   `Length`

6. Subtract:

   `1`

7. Connect:

- `First Index = 0`
- `Last Index = Length - 1`

---

### Screenshot Placeholder

**[Screenshot: For Loop iterating from 0 to MazeGrid Length - 1]**

---

### Step 1.3 — Get the current cell

#### Step 1.3.1 — Read from MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from it and search:

   `Get (a copy)`

3. Connect:

- `For Loop Index` → `Index`

---

#### Step 1.3.2 — Break the struct

4. From the output, add:

   `Break S_MazeCell`

---

## Why this matters

You now have access to:

- Row
- Col
- all four wall booleans

for each cell.

---

### Step 1.4 — Calculate world position

#### Step 1.4.1 — Convert grid to world space

We calculate:

- X = Col × CellSize
- Y = Row × CellSize
- Z = 0

---

#### Step 1.4.2 — Build the vector

1. Multiply:

- `Col * CellSize`
- `Row * CellSize`

2. Create:

   `Make Vector`

---

### Screenshot Placeholder

**[Screenshot: Make Vector using Col * CellSize and Row * CellSize]**

---

### Step 1.5 — Add the floor mesh

#### Step 1.5.1 — Add instance

1. Drag `FloorHISM` into the graph as **Get**

2. Drag from it and search:

   `Add Instance`

---

#### Step 1.5.2 — Create transform

3. Add:

   `Make Transform`

4. Set:

- Location = calculated vector
- Rotation = (0,0,0)
- Scale = (1,1,1)

---

### Screenshot Placeholder

**[Screenshot: FloorHISM Add Instance with Make Transform connected]**

---

## Why this matters

Every cell now gets a visible floor tile.

---

### Step 1.6 — Add walls based on cell data

---

## IMPORTANT CONCEPT

Each wall:

- starts from the base cell location
- then adds an offset

---

### Step 1.6.1 — North wall

Condition:

`bWallNorth == true`

Position:

- Y offset = `-CellSize / 2`
- Z offset = `CellSize / 2`

---

### Step 1.6.2 — East wall

Condition:

`bWallEast == true`

Position:

- X offset = `CellSize / 2`
- Rotation Yaw = `90`

---

### Step 1.6.3 — South wall

Condition:

`bWallSouth == true`

Position:

- Y offset = `CellSize / 2`
- Rotation Yaw = `180`

---

### Step 1.6.4 — West wall

Condition:

`bWallWest == true`

Position:

- X offset = `-CellSize / 2`
- Rotation Yaw = `-90`

---

### Screenshot Placeholder

**[Screenshot: Branch checking wall boolean and adding wall instance with offset transform]**

---

## Common mistakes

❌ Forgetting to offset the wall  
✔️ Walls must be positioned relative to the cell center

---

❌ Using the same rotation for every wall  
✔️ Each direction needs a different rotation

---

## Expected result

Your function now:

- places floors
- places walls correctly
- builds the full maze layout visually

---

# Step 2 — Create Entrance and Exit

---

## What this step does

Adds:

- one entrance
- one exit

on the outer edge of the maze.

---

## Instructions

### Step 2.1 — Create the function

Create:

`CreateEntranceAndExit`

---

### Step 2.2 — Find border cells

A border cell is any cell where:

- Row == 0
- Row == MazeHeight - 1
- Col == 0
- Col == MazeWidth - 1

---

### Step 2.3 — Build a border array

Loop through `MazeGrid` and:

- check each condition
- add valid indices to a local array

---

### Step 2.4 — Select entrance and exit

Using `RandomStream`:

- pick EntranceIndex
- pick ExitIndex (must be different)

---

### Step 2.5 — Open the wall

Depending on position:

- Top → remove North wall
- Bottom → remove South wall
- Left → remove West wall
- Right → remove East wall

---

### Screenshot Placeholder

**[Screenshot: Border cell selection and RandomStream index selection]**

---

## Expected result

The maze now has:

- one entrance
- one exit
- both on the outer edge

---

# Step 3 — Final Construction Script Flow

---

## What this step does

This connects everything together in the correct order.

---

## Instructions

### Step 3.1 — Add function calls in order

Your Construction Script should now be:

Construction Script
→ Clear Instances (FloorHISM)
→ Clear Instances (WallHISM)
→ Clear (MazeGrid)
→ Set RandomStream
→ InitializeGrid
→ GenerateMaze
→ CreateEntranceAndExit
→ BuildMazeVisuals

---

---

### Screenshot Placeholder

**[Screenshot: Full Construction Script showing all function calls in order]**

---

## Why this matters

Order is critical.

If this is wrong:

- maze may not generate
- visuals may be incorrect
- entrance may not work

---

## Common mistakes

❌ Calling BuildMazeVisuals too early  
✔️ It must be last

---

❌ Skipping CreateEntranceAndExit  
✔️ Maze will be fully enclosed

---

## Expected result

Your system now:

- generates a maze
- builds it visually
- creates entrance and exit
- updates instantly in editor

---

# Step 4 — Testing

---

## Instructions

1. Drag `BP_MazeGenerator` into your level

2. In Details panel, change:

- MazeWidth
- MazeHeight
- MazeSeed

---

## Expected behavior

- Maze appears instantly
- Same seed = same maze
- Different seed = different maze
- Entrance and exit always exist

---

# What You Have Built

At this point, your maze system can:

- generate a perfect maze using DFS
- use a seed for reproducible layouts
- render efficiently using HISM
- create playable entrances and exits
- run entirely in the editor

> This is a complete procedural system.

---

# Where to Go Next

You can now expand this system by:

- spawning a player at the entrance
- adding materials to floors and walls
- generating larger mazes
- adding gameplay elements (keys, enemies, puzzles)

---

**You now have a fully working procedural maze generator in UE5 Blueprints.**
