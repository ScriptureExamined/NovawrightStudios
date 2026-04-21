---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 2 (Maze Generation Logic)"
date: 2026-04-20
author: Roberta
categories: [Tutorials]
published: false
excerpt: >
  In Part 2, we build the core maze generation system using a stack-based depth-first search algorithm. The maze will now generate fully in memory.
---

# Building a Procedural Maze Generator in UE5 Blueprints — Part 2

## Introduction

In Part 1, we built the foundation:
- project setup
- structs
- Blueprint
- variables
- HISM components

Now we will build the **actual maze logic**.

> By the end of this part, your maze will exist completely in memory.

---

## What We Are Building in This Part

We will:

- create the grid of cells
- initialize each cell
- implement the **Recursive Backtracker algorithm**
- create helper functions
- generate a complete maze in memory

> Nothing will be visible yet—that happens in Part 3.

---

## Before You Start

You should already have:

- `BP_MazeGenerator`
- `S_MazeCell`
- `S_NeighbourInfo`

- Variables:
  - `MazeWidth`
  - `MazeHeight`
  - `CellSize`
  - `MazeGrid`
  - `MazeSeed`
  - `RandomStream`

---

# Step 1 — Create the Construction Script Flow

---

## What this step does

This step defines the **order of execution** for your maze system.

---

## Instructions

1. Open `BP_MazeGenerator`

2. Go to the **Construction Script**

---

### Step 1.1 — Clear existing data

#### Instructions

1. Drag `FloorHISM` into the graph as **Get**

2. Drag off the pin → search:
   `Clear Instances`

3. Repeat for:
   `WallHISM`

---

4. Drag `MazeGrid` into the graph as **Get**

5. Drag off → search:
   `Clear`

---

## Why this matters

If you don’t clear:
- meshes will stack
- grid will duplicate

---

## Expected result

Every time the Blueprint runs, it starts clean.

---

<a href="{{ '/assets/images/blog/Part2-Step-1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-1.png' | relative_url }}" class="post-image">
</a>

---

### Step 1.2 — Initialize Random Stream

---

## What this step does

Creates a **repeatable random system** using a seed.

---

## Instructions

1. Drag `MazeSeed` into the graph as **Get**

2. Drag off → search:
   `Make Random Stream`

3. Connect:
   - MazeSeed → Initial Seed

4. Drag `RandomStream` into graph as **Set**

5. Connect output → RandomStream

**Pro tip: Drag RandomStream in and release it directly on the `Return Value` pin. Blueprints will automatically add it as a Set node.***

---

## Why this matters

Same seed = same maze  
Different seed = different maze

---

## Expected result

You now have a seeded random system.

---

<a href="{{ '/assets/images/blog/Part2-Step-2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-2.png' | relative_url }}" class="post-image">
</a>

---

# Step 2 — Create the Grid

---

## What this step does

Creates all maze cells in a **1D array**.

---

## Step 2.1 — Create InitializeGrid Function

---

### Instructions

1. In My Blueprint → Functions → Click **+**

2. Name:
   `InitializeGrid`

---

## Step 2.2 — Build the grid

---

### Instructions

Inside `InitializeGrid`:

1. Drag `MazeGrid` → Clear

---

2. Right-click → add:
   `For Loop`

3. Set:
   - First Index = 0
   - Last Index = (MazeWidth * MazeHeight - 1)

---

### Step 2.2.1 — Calculate Row and Column

#### Instructions

1. Drag from Loop Index

2. Divide by `MazeWidth` → Row

3. Use `%` (Modulo) with `MazeWidth` → Col

---

### Step 2.2.2 — Create MazeCell

1. Right-click → search:
   `Make S_MazeCell`

2. Set:
   - Row
   - Col
   - bVisited = False
   - All walls = True

---

3. Add to `MazeGrid`

---

## Why this matters

This builds the entire maze structure before generation.

---

## Expected result

You now have a full grid of cells.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}" class="post-image">
</a>

---

# Step 3 — Generate the Maze

---

## What this step does

Implements the **Depth-First Search (DFS) Backtracker algorithm**.

---

## Step 3.1 — Create GenerateMaze Function

---

### Instructions

Create function:
`GenerateMaze`

---

## Step 3.2 — Setup stack

---

### Instructions

1. Create local variable:
   `Stack` (Integer Array)

---

## Step 3.3 — Pick starting cell

---

### Instructions

1. Use:
   `Random Integer in Range from Stream`

2. Range:
   - 0 → (MazeWidth * MazeHeight - 1)

---

3. Mark cell:
   `bVisited = True`

---

4. Add to Stack

---

## Step 3.4 — While loop

---

### Instructions

1. Add:
   `While Loop`

Condition:
- Stack Length > 0

---

### Step 3.4.1 — Get current cell

1. Get last index of Stack

2. Use it as CurrentIndex

---

### Step 3.4.2 — Get neighbors

Call:
`GetUnvisitedNeighbours`

---

### Step 3.4.3 — Branch

If neighbors exist:

- pick random neighbor
- remove wall
- mark visited
- push to stack

Else:

- pop stack

---

## Why this matters

This is the core algorithm that builds the maze.

---

<a href="{{ '/assets/images/blog/Part2-Step-4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-4.png' | relative_url }}" class="post-image">
</a>

---

# Step 4 — Helper Functions

---

## Step 4.1 — GetUnvisitedNeighbours

---

### What this step does

Finds valid neighbors.

---

### Instructions

Create function:
`GetUnvisitedNeighbours`

Input:
- CurrentIndex

Output:
- Array of `S_NeighbourInfo`

---

Check:
- bounds
- visited status

---

<a href="{{ '/assets/images/blog/Part2-Step-5.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-5.png' | relative_url }}" class="post-image">
</a>

---

## Step 4.2 — RemoveWallBetween

---

### What this step does

Removes walls between two cells.

---

### Instructions

Inputs:
- CurrentIndex
- NeighborIndex
- DeltaX
- DeltaY

---

Use Branches:

- DeltaY = -1 → North/South
- DeltaX = 1 → East/West

Update BOTH cells.

---

<a href="{{ '/assets/images/blog/Part2-Step-6.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-6.png' | relative_url }}" class="post-image">
</a>

---

# Step 5 — Call Functions in Order

---

## Instructions

Back in **Construction Script**:

Connect:

Event Construction  
→ Clear  
→ Set RandomStream  
→ InitializeGrid  
→ GenerateMaze  

---

<a href="{{ '/assets/images/blog/Part2-Step-7.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-7.png' | relative_url }}" class="post-image">
</a>

---

# What You Have Built So Far

You now have:

- a complete maze grid
- DFS algorithm implemented
- walls removed correctly
- fully generated maze in memory

> Your maze exists—you just can’t see it yet.

---

## Up Next

In Part 3, we will:

- convert grid to world space
- spawn meshes
- render the maze visually

👉 This is where everything comes to life.

---