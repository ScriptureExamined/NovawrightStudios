---
layout: post
title: "Procedural Maze Generator in UE5 — 100% Blueprints"
date: 2025-01-01
categories: [unreal-engine, blueprints, tutorial]
tags: [ue5, procedural-generation, blueprints, beginner]
---

# Procedural Maze Generator in UE5 — 100% Blueprints

In this tutorial you will build a fully procedural maze generator using **nothing but Blueprints** in Unreal Engine 5. When you're done, you'll have a system that:

- Generates a different maze every time you play
- Can **reproduce any maze exactly** using a seed number
- Automatically places a **random entrance** and a **random exit**
- Works on any level with a single Actor placed in the scene

This tutorial is written for **complete beginners**. Every step is explained in plain English before you touch the editor.

---

## What You'll Build

A `BP_MazeGenerator` Actor you drop into any level. You give it a seed number (or leave it at 0 for a random maze), hit Play, and it builds the entire maze out of wall and floor meshes at runtime.

---

## How the Algorithm Works (Plain English)

Before we open Unreal, it helps to understand what the code will do. We're using an algorithm called **Recursive Backtracker**, which works like exploring a cave with a ball of string:

1. Start at any cell in a grid.
2. Look at your neighbours. If any haven't been visited yet, move to one at random and knock down the wall between you.
3. Keep going until you're stuck (all neighbours visited).
4. Follow your string back (backtrack) until you find a cell that _does_ have unvisited neighbours.
5. Repeat until every cell has been visited.

The result is a **perfect maze** — there is exactly one path between any two cells. No loops, no isolated rooms. And because we control every random choice using a **seed**, the same seed always produces the same maze.

---

## Prerequisites

- Unreal Engine 5.1 or newer (any 5.x version works)
- A new **Third Person** or **Blank** project
- You know how to open a Blueprint, add nodes, and compile — if not, spend 20 minutes on Epic's [Blueprint Quickstart](https://dev.epicgames.com/documentation/en-us/unreal-engine/blueprint-quick-start-guide) first

---

## Project Setup

### Step 1 — Create a New Level

1. Go to **File → New Level** and choose **Basic**.
2. Save it as `MazeLevel` (**Ctrl+S**).

<a href="{{ '/assets/images/blog/Setup-Step-1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Setup-Step-1.png' | relative_url }}" style="width:100%;" alt="The New Level dialog with Basic selected." class="post-image">
</a>

### Step 2 — Get Some Meshes

You need a **floor tile** and a **wall** mesh. For this tutorial we'll use the Engine's built-in shapes so you don't need any assets.

1. We'll use references to the Engine's built-in cube, available at the path `/Engine/BasicShapes/Cube`.
2. You don't need to do anything yet — we'll assign these meshes inside the Blueprint later.

> **Tip for later:** Swap the Engine cube for your own modular wall/floor meshes once the system is working. The generator doesn't care what mesh it uses — just the size.

---

## Part 1 — Create the Data Structures

A maze is a **grid of cells**. Each cell knows which of its four walls (North, South, East, West) are still standing, and whether the algorithm has visited it yet. In Blueprints we store this as a **Struct**.

### Step 3 — Create the `S_MazeCell` Struct

1. In the **Content Browser**, right-click → **Blueprint → Structure**.
2. Name it `S_MazeCell`.
3. Open it. Add these variables one at a time using the **+ Variable** button:

| Variable Name | Type    | Default Value | Description                          |
| ------------- | ------- | ------------- | ------------------------------------ |
| `X`           | Integer | 0             | Grid column                          |
| `Y`           | Integer | 0             | Grid row                             |
| `bWallNorth`  | Boolean | ✅ True       | North wall exists?                   |
| `bWallSouth`  | Boolean | ✅ True       | South wall exists?                   |
| `bWallEast`   | Boolean | ✅ True       | East wall exists?                    |
| `bWallWest`   | Boolean | ✅ True       | West wall exists?                    |
| `bVisited`    | Boolean | ❌ False      | Has the algorithm visited this cell? |
| `bIsEntrance` | Boolean | ❌ False      | Is this the entrance cell?           |
| `bIsExit`     | Boolean | ❌ False      | Is this the exit cell?               |

4. Click **Save** (top left of the Struct editor).

<div>
<a href="{{ '/assets/images/blog/Part1-Step-3a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-3a.png' | relative_url }}" style="width:100%;" alt="The completed S_MazeCell struct with all nine variables listed in the editor." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part1-Step-3b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-3b.png' | relative_url }}" style="width:100%;" alt="The completed S_MazeCell struct with all nine variables listed in the editor." class="post-image">
</a>
</div>

### Step 4 — Create the `S_NeighborInfo` Struct

While we're making structs, create a second one now. The algorithm needs to pass neighbour data — which cell, and in which direction — as a single package.

1. In the **Content Browser**, right-click → **Blueprint → Structure**.
2. Name it `S_NeighborInfo`.
3. Add three variables:

| Variable Name | Type    | Description                                  |
| ------------- | ------- | -------------------------------------------- |
| `CellIndex`   | Integer | Flat array index of the neighbour cell       |
| `DeltaX`      | Integer | How far the neighbour is in X (-1, 0, or +1) |
| `DeltaY`      | Integer | How far the neighbour is in Y (-1, 0, or +1) |

4. Click **Save**.

<a href="{{ '/assets/images/blog/Part1-Step-4.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4.png' | relative_url }}" style="width:100%;" alt="The completed S_NeighbourInfo struct with CellIndex, DeltaX, and DeltaY variables." class="post-image">
</a>

---

## Part 2 — Create the Maze Generator Blueprint

### Step 5 — Create `BP_MazeGenerator`

1. In the Content Browser, right-click → **Blueprint Class**.
2. Choose **Actor** as the parent class.
3. Name it `BP_MazeGenerator`.
4. Open it.

---

<a href="{{ '/assets/images/blog/Part2-Step-5.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5b.png' | relative_url }}" style="width:25%;" alt="The newly created BP_MazeGenerator asset in the Content Browser." class="post-image">
</a>

---

### Step 6 — Add Variables

In the **My Blueprint** panel on the left, click the **+** next to **Variables** to add each of the following.

#### Configuration Variables

These are the knobs you'll turn in the Details panel when the Actor is placed in the level.

| Variable Name   | Type    | Default | Instance Editable? | Description                                      |
| --------------- | ------- | ------- | ------------------ | ------------------------------------------------ |
| `MazeSeed`      | Integer | 0       | ✅ Yes             | 0 = random. Any other number = reproducible maze |
| `MazeWidth`     | Integer | 10      | ✅ Yes             | Number of cells across (X)                       |
| `MazeHeight`    | Integer | 10      | ✅ Yes             | Number of cells tall (Y)                         |
| `CellSize`      | Float   | 400.0   | ✅ Yes             | World size of one cell in cm                     |
| `WallThickness` | Float   | 40.0    | ✅ Yes             | How thick the wall mesh is                       |
| `WallHeight`    | Float   | 300.0   | ✅ Yes             | How tall walls are in cm                         |

> To make a variable **Instance Editable**, click the **eye icon** next to it in the Variables list. This lets you change the value per-Actor in the level without opening the Blueprint.

<div>
<a href="{{ '/assets/images/blog/Part2-Step-6a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-6a.png' | relative_url }}" style="width:100%;" alt="The My Blueprint panel showing the six configuration variables with the eye (Instance Editable) icon highlighted next to MazeSeed." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-6b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-6b.png' | relative_url }}" style="width:100%;" alt="The My Blueprint panel showing the six configuration variables with the eye (Instance Editable) icon highlighted next to MazeSeed." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-6c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-6c.png' | relative_url }}" style="width:100%;" alt="The My Blueprint panel showing the six configuration variables with the eye (Instance Editable) icon highlighted next to MazeSeed." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-6d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-6e.png' | relative_url }}" style="width:100%;" alt="The My Blueprint panel showing the six configuration variables with the eye (Instance Editable) icon highlighted next to MazeSeed." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-6f.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-6f.png' | relative_url }}" style="width:100%;" alt="The My Blueprint panel showing the six configuration variables with the eye (Instance Editable) icon highlighted next to MazeSeed." class="post-image">
</a>
</div>

#### Mesh Variables

| Variable Name  | Type                  | Instance Editable? |
| -------------- | --------------------- | ------------------ |
| `FloorMesh`    | Static Mesh Reference | ✅ Yes             |
| `WallMesh`     | Static Mesh Reference | ✅ Yes             |
| `EntranceMesh` | Static Mesh Reference | ✅ Yes             |
| `ExitMesh`     | Static Mesh Reference | ✅ Yes             |

> In the variable's Details panel, set the type to **Static Mesh** (not a component — just the asset reference).

<a href="{{ '/assets/images/blog/Part2-Step-6b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-6b.png' | relative_url }}" style="width:100%;" alt="The variable Details panel showing the type set to Static Mesh with the Instance Editable checkbox ticked." class="post-image">
</a>

#### Internal Variables

These are used by the algorithm and are **not** Instance Editable.

| Variable Name      | Type                              | Description                                          |
| ------------------ | --------------------------------- | ---------------------------------------------------- |
| `MazeGrid`         | Array of `S_MazeCell`             | Stores every cell in the maze                        |
| `Stack`            | Array of `Integer`                | The DFS backtracking stack                           |
| `RandStream`       | Random Stream                     | The seeded random number generator                   |
| `ActualSeed`       | Integer                           | The seed actually used (important when MazeSeed = 0) |
| `EntranceLocation` | Vector                            | World location of the entrance                       |
| `ExitLocation`     | Vector                            | World location of the exit                           |
| `SpawnedActors`    | Array of `Actor Object Reference` | Tracks everything spawned for cleanup                |

For `MazeGrid`: click the **Array icon** (the grid icon to the right of the type dropdown) to make it an Array, then search for `S_MazeCell` as the element type.

<a href="{{ '/assets/images/blog/Part2-Step-6c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-6c.png' | relative_url }}" style="width:100%;" alt="The variable type picker showing the Array icon selected and S_MazeCell entered in the search field." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-6d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-6d.png' | relative_url }}" style="width:100%;" alt="The completed My Blueprint panel showing all three variable groups: Configuration, Meshes, and Internal." class="post-image">
</a>

---

## Part 3 — Helper Functions

We'll build the generator as a series of small, focused functions. This keeps things organized and makes debugging much easier.

### Step 7 — Function: `GetCellIndex`

Converts a 2D grid coordinate `(X, Y)` into a single flat array index. The formula is `Y * MazeWidth + X`.

1. In **My Blueprint → Functions**, click **+** and name it `GetCellIndex`.
2. In the function's **Details** panel, add:
   - **Inputs:** `X` (Integer), `Y` (Integer)
   - **Output:** `Index` (Integer)
3. Wire up:

```
[Entry] → [Y * MazeWidth] → [result + X] → [Return: Index]
```

**Node by node:**

- Drag off the `Y` input pin → search **Integer \* Integer** → connect the `MazeWidth` variable to the second pin.
- Drag off the multiply result → search **Integer + Integer** → connect `X` to the second pin.
- Connect the final result to the **Index** pin of the Return node.

<a href="{{ '/assets/images/blog/Part3-Step-7.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part3-Step-7.png' | relative_url }}" style="width:100%;" alt="The completed GetCellIndex function: Y multiplied by MazeWidth, then X added, feeding into the Return node's Index pin." class="post-image">
</a>

### Step 8 — Function: `IsInBounds`

Returns `true` if a grid coordinate is valid (not outside the maze edges).

1. Create function `IsInBounds`.
2. **Inputs:** `X` (Integer), `Y` (Integer). **Output:** `Valid` (Boolean).
3. Wire:

```
X >= 0  AND  X < MazeWidth  AND  Y >= 0  AND  Y < MazeHeight  →  Return: Valid
```

**Node by node:**

- Drag `X` → **>= (Integer)** → set second pin to `0`.
- Drag `X` → **< (Integer)** → connect `MazeWidth` to the second pin.
- Drag `Y` → **>= (Integer)** → set second pin to `0`.
- Drag `Y` → **< (Integer)** → connect `MazeHeight` to the second pin.
- Feed all four boolean results into chained **AND Boolean** nodes (or add extra input pins to a single AND node using its **+** button).
- Connect the final AND result to the `Valid` return pin.

<a href="{{ '/assets/images/blog/Part3-Step-8.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part3-Step-8.png' | relative_url }}" style="width:100%;" alt="The completed IsInBounds function: four comparison nodes feeding into chained AND nodes, with the final result going to the Valid return pin." class="post-image">
</a>

### Step 9 — Function: `GridToWorld`

Converts a grid coordinate into a 3D world position (centered inside the cell).

1. Create function `GridToWorld`.
2. **Inputs:** `X` (Integer), `Y` (Integer). **Output:** `WorldLocation` (Vector).
3. Logic:

```
WorldX = (X * CellSize) + (CellSize / 2)
WorldY = (Y * CellSize) + (CellSize / 2)
Result = Actor Location + Vector(WorldX, WorldY, 0)
```

**Node by node:**

- `X` → **Convert Integer to Float** → **Float \* Float** (connect `CellSize`) → **Float + Float** (add `CellSize / 2`). Result is `WorldX`.
- Repeat the same chain for `Y` to get `WorldY`.
- **Make Vector**: plug in `WorldX`, `WorldY`, and `0.0` for Z.
- **Get Actor Location** (self) → **Vector + Vector** with the Make Vector result.
- Connect to the Return node.

> The `CellSize / 2` offset places the world position at the center of the cell rather than its corner.

<a href="{{ '/assets/images/blog/Part3-Step-9.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part3-Step-9.png' | relative_url }}" style="width:100%;" alt="The completed GridToWorld function: X and Y each multiplied by CellSize and offset by half a cell, combined in Make Vector, then added to the Actor's world location." class="post-image">
</a>

### Step 10 — Function: `RemoveWallBetween`

When the algorithm moves from one cell to a neighbour, it removes the shared wall in **both** cells.

1. Create function `RemoveWallBetween`.
2. **Inputs:** `IndexA` (Integer), `IndexB` (Integer), `DeltaX` (Integer), `DeltaY` (Integer).
3. No output — this function modifies `MazeGrid` directly.

Which walls to remove depends on the direction:

| DeltaX | DeltaY | Remove from A | Remove from B |
| ------ | ------ | ------------- | ------------- |
| +1     | 0      | East          | West          |
| -1     | 0      | West          | East          |
| 0      | +1     | North         | South         |
| 0      | -1     | South         | North         |

**Node by node:**

Use a **Switch on Int** on `DeltaX` to branch into the four cases. For each case:

1. **Get** `MazeGrid[IndexA]` → **Break S_MazeCell** → **Make S_MazeCell** with the correct wall boolean set to `false` → **Set Array Elem** back into `MazeGrid` at `IndexA`.
2. Repeat for `MazeGrid[IndexB]` with the opposite wall.

> **Critical reminder:** Blueprint arrays store **copies** of structs. You must Get → modify → Set back. Forgetting the final Set is the most common beginner mistake in Blueprint array work.

<a href="{{ '/assets/images/blog/Part3-Step-10a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part3-Step-10a.png' | relative_url }}" style="width:100%;" alt="The Switch on Int node on DeltaX branching into the four wall-removal direction cases." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part3-Step-10b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part3-Step-10b.png' | relative_url }}" style="width:100%;" alt="One direction case zoomed in: Get from MazeGrid at IndexA, Break struct, Make struct with bWallEast set to false, Set Array Elem back. Then the same for IndexB with bWallWest." class="post-image">
</a>

### Step 11 — Function: `GetUnvisitedNeighbours`

Returns a list of valid, unvisited neighbours for a given cell.

1. Create function `GetUnvisitedNeighbours`.
2. **Input:** `CellIndex` (Integer). **Output:** `Neighbours` (Array of `S_NeighbourInfo`).

**Node by node:**

First, recover X and Y from the flat index:

- `X = CellIndex % MazeWidth` (**Integer % Integer** node)
- `Y = CellIndex / MazeWidth` (**Integer / Integer** node — integer division)

Then for each of the four directions `(1,0)`, `(-1,0)`, `(0,1)`, `(0,-1)`:

- Compute `NX = X + DX`, `NY = Y + DY`.
- Call `IsInBounds(NX, NY)` → **Branch**.
- **True:** Call `GetCellIndex(NX, NY)` → **Get** from `MazeGrid` → **Break S_MazeCell** → check `bVisited`.
- **Branch** on `bVisited == false`:
  - **True (unvisited):** **Make S_NeighbourInfo** (CellIndex = result, DeltaX = DX, DeltaY = DY) → **Add** to `Neighbours`.
- Connect all four chains to the same `Neighbours` local array, then **Return** it.

> You will have four near-identical parallel chains — one per direction. This is verbose but very easy to read and debug.

<a href="{{ '/assets/images/blog/Part3-Step-11a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part3-Step-11a.png' | relative_url }}" style="width:100%;" alt="The top of GetUnvisitedNeighbours showing the X and Y recovery using modulo and integer divide on CellIndex." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part3-Step-11b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part3-Step-11b.png' | relative_url }}" style="width:100%;" alt="One direction chain zoomed in: IsInBounds Branch, then bVisited Branch, then Make S_NeighbourInfo added to the Neighbours array." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part3-Step-11c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part3-Step-11c.png' | relative_url }}" style="width:100%;" alt="The full GetUnvisitedNeighbours graph showing all four direction chains running in parallel before converging at the Return node." class="post-image">
</a>

---

## Part 4 — The Core Algorithm

### Step 12 — Function: `InitializeSeed`

1. Create function `InitializeSeed` (no inputs or outputs — it sets internal variables).
2. **Branch:** Is `MazeSeed == 0`?
   - **True:** **Random Integer in Range** (Min=`1`, Max=`2147483647`) → Set `ActualSeed`.
   - **False:** Set `ActualSeed = MazeSeed`.
3. After both branches set `ActualSeed`, add a **Make Random Stream** node with `ActualSeed` as the seed → **Set** the result into `RandStream`.

> From this point on, every random call in the generator uses **Random Integer in Range from Stream** with `RandStream`. This is what makes the maze reproducible — the same seed always produces the same sequence of random numbers.

<a href="{{ '/assets/images/blog/Part4-Step-12.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-12.png' | relative_url }}" style="width:100%;" alt="The InitializeSeed function: Branch on MazeSeed == 0, both paths set ActualSeed, then Make Random Stream feeds into Set RandStream." class="post-image">
</a>

### Step 13 — Function: `InitializeGrid`

Fills `MazeGrid` with fresh, fully-walled, unvisited cells.

1. Create function `InitializeGrid`.
2. **Clear** the `MazeGrid` array.
3. **For Loop** Y from `0` to `MazeHeight - 1`:
   - **For Loop** X from `0` to `MazeWidth - 1` (nested inside):
     - **Make S_MazeCell**: set `X` and `Y` to the loop index pins. All other fields stay at their struct defaults (walls all `true`, booleans all `false`).
     - **Add** to `MazeGrid`.
4. After the outer loop's **Completed** pin, **Clear** the `Stack` array.

<a href="{{ '/assets/images/blog/Part4-Step-13.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-13.png' | relative_url }}" style="width:100%;" alt="The InitializeGrid function: Clear MazeGrid, then nested Y and X For Loops building Make S_MazeCell nodes, each Added to MazeGrid. Clear Stack on Completed." class="post-image">
</a>

### Step 14 — Function: `RunDFSAlgorithm`

This is the heart of the generator — the iterative Depth-First Search that carves the maze.

**Setup — pick and mark the starting cell:**

1. Create function `RunDFSAlgorithm`.
2. `StartX` = **Random Integer in Range from Stream** (Stream=`RandStream`, Min=`0`, Max=`MazeWidth - 1`)
3. `StartY` = **Random Integer in Range from Stream** (Min=`0`, Max=`MazeHeight - 1`)
4. `StartIndex` = Call `GetCellIndex(StartX, StartY)`.
5. **Get** `MazeGrid[StartIndex]` → **Break** → **Make** with `bVisited = true` → **Set Array Elem** back.
6. **Add** `StartIndex` to `Stack`.

<a href="{{ '/assets/images/blog/Part4-Step-14a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-14a.png' | relative_url }}" style="width:100%;" alt="The setup section of RunDFSAlgorithm: random start X and Y, GetCellIndex, mark bVisited true and set back, Add to Stack." class="post-image">
</a>

**The main loop:**

Use a **For Loop** with Last Index set to `MazeWidth * MazeHeight * 10`. The loop breaks early when the Stack empties.

Inside the loop body:

**A — if Stack is empty, we're done:**

- **Length** of `Stack` → **== 0** → **Branch** → **True** connects to the For Loop's **Break** pin.

**B — get the current cell (top of stack):**

- **Last Index** of `Stack` → **Get (Array)** on `Stack` → `CurrentIndex`.

**C — get unvisited neighbours:**

- Call `GetUnvisitedNeighbours(CurrentIndex)` → local variable `Neighbours`.

**D — branch on whether we can advance or must backtrack:**

- **Length** of `Neighbours` → **== 0** → **Branch**.
  - **True (backtrack):** **Last Index** of `Stack` → **Remove Index** from `Stack`.
  - **False (advance):**
    - **Random Integer in Range from Stream** (Min=`0`, Max=`Length of Neighbours - 1`) → `ChoiceIdx`.
    - **Get** `Neighbours[ChoiceIdx]` → **Break S_NeighbourInfo** → `CellIndex`, `DeltaX`, `DeltaY`.
    - Call `RemoveWallBetween(CurrentIndex, CellIndex, DeltaX, DeltaY)`.
    - **Get** `MazeGrid[CellIndex]` → **Break** → **Make** with `bVisited = true` → **Set Array Elem** back.
    - **Add** `CellIndex` to `Stack`.

<a href="{{ '/assets/images/blog/Part4-Step-14b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-14b.png' | relative_url }}" style="width:100%;" alt="The top of the DFS For Loop: Stack Length == 0 Branch with Break, then Last Index used to read CurrentIndex from the Stack." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part4-Step-14c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-14c.png' | relative_url }}" style="width:100%;" alt="The neighbour branch: Length == 0 leads to Remove Index (backtrack). The False path picks a random neighbour, calls RemoveWallBetween, marks the cell visited, and pushes it to the Stack." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part4-Step-14d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-14d.png' | relative_url }}" style="width:100%;" alt="The full RunDFSAlgorithm graph showing the setup section and the complete main For Loop." class="post-image">
</a>

### Step 15 — Function: `PlaceEntranceAndExit`

After the maze is carved, we pick one cell on each of two different edges and mark them as Entrance and Exit.

1. Create function `PlaceEntranceAndExit`.
2. Pick a random entrance edge (0=West, 1=East, 2=South, 3=North):
   - `EntranceEdge` = **Random Integer in Range from Stream** (Min=`0`, Max=`3`).
3. Pick an exit edge guaranteed to be different:
   - `ExitEdge = (EntranceEdge + 1 + Random(0,2)) % 4`
   - Use **Random Integer in Range from Stream** (Min=`0`, Max=`2`) → **Integer + Integer** with `1` → **Integer + Integer** with `EntranceEdge` → **Integer % Integer** with `4`.

<a href="{{ '/assets/images/blog/Part4-Step-15a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-15a.png' | relative_url }}" style="width:100%;" alt="The edge-selection logic: EntranceEdge from Random Stream, ExitEdge computed via the offset + modulo 4 formula." class="post-image">
</a>

4. Use a **Switch on Int** on `EntranceEdge` (and a separate one on `ExitEdge`) to pick a random cell on that edge:

```
Case 0 (West):  X = 0,            Y = Random(0, MazeHeight-1)
Case 1 (East):  X = MazeWidth-1,  Y = Random(0, MazeHeight-1)
Case 2 (South): X = Random(0, MazeWidth-1),  Y = 0
Case 3 (North): X = Random(0, MazeWidth-1),  Y = MazeHeight-1
```

5. For each chosen cell:
   - **Get** from `MazeGrid` → **Break** → **Make** with `bIsEntrance = true` (or `bIsExit = true`) → **Set Array Elem** back.
   - Also set the outer wall to `false` in the same Make node (e.g., West edge → `bWallWest = false`).
   - Call `GridToWorld(X, Y)` → Set `EntranceLocation` (or `ExitLocation`).

<a href="{{ '/assets/images/blog/Part4-Step-15b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-15b.png' | relative_url }}" style="width:100%;" alt="One Switch case zoomed in: Get cell from MazeGrid, Break struct, Make struct with bIsEntrance true and bWallWest false, Set Array Elem back, GridToWorld into Set EntranceLocation." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part4-Step-15c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-15c.png' | relative_url }}" style="width:100%;" alt="The full PlaceEntranceAndExit graph showing both Switch on Int nodes for entrance and exit edges." class="post-image">
</a>

### Step 16 — Helper Function: `SpawnWall`

Before building `SpawnMeshes`, create this small reusable function to avoid repeating wall logic four times.

1. Create function `SpawnWall`.
2. **Inputs:** `Location` (Vector), `Rotation` (Rotator).
3. Wire:
   - **Spawn Actor from Class** → `StaticMeshActor`, using the input Location and Rotation.
   - **Get Static Mesh Component** on the return value → **Set Static Mesh** to `WallMesh`.
   - **Set World Scale 3D**: `(CellSize / 100, WallThickness / 100, WallHeight / 100)`.
   - **Add** the spawned actor to `SpawnedActors`.

<a href="{{ '/assets/images/blog/Part4-Step-16.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-16.png' | relative_url }}" style="width:100%;" alt="The complete SpawnWall function: Spawn Actor StaticMeshActor, Get Static Mesh Component, Set Static Mesh to WallMesh, Set World Scale 3D using the three divided values, Add to SpawnedActors." class="post-image">
</a>

### Step 17 — Function: `SpawnMeshes`

Walks every cell in the grid and spawns the geometry.

1. Create function `SpawnMeshes`.
2. **Nested For Loop** — Y from `0` to `MazeHeight-1`, X from `0` to `MazeWidth-1`:
   - Call `GetCellIndex(X, Y)` → **Get** `MazeGrid[result]` → local `Cell`.
   - Call `GridToWorld(X, Y)` → local `CellWorldCenter`.

**Spawn a floor for every cell:**

3. **Spawn Actor from Class** → `StaticMeshActor`, Location = `CellWorldCenter`.
   - **Get Static Mesh Component** → **Set Static Mesh** to `FloorMesh`.
   - **Set World Scale 3D**: `(CellSize / 100, CellSize / 100, 1.0)`.
   - **Add** to `SpawnedActors`.

<a href="{{ '/assets/images/blog/Part4-Step-17a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-17a.png' | relative_url }}" style="width:100%;" alt="The floor spawn chain inside the inner loop: Spawn Actor, Get Static Mesh Component, Set Static Mesh to FloorMesh, Set World Scale 3D, Add to SpawnedActors." class="post-image">
</a>

**Spawn walls — one Branch per wall direction:**

**South Wall (`bWallSouth`):** Always check this one.

- **Branch** on `Cell.bWallSouth` → **True:** Call `SpawnWall`:
  - Location: `CellWorldCenter + Vector(0, -(CellSize * 0.5), WallHeight * 0.5)`
  - Rotation: `(0, 0, 0)`

**West Wall (`bWallWest`):** Always check this one.

- Location: `CellWorldCenter + Vector(-(CellSize * 0.5), 0, WallHeight * 0.5)`
- Rotation: `(0, 90, 0)`

**North Wall (`bWallNorth`):** Only check when `Y == MazeHeight - 1` (top row only, to avoid duplicates).

- Add an outer **Branch** on `Y == MazeHeight - 1` before checking `bWallNorth`.
- Location: `CellWorldCenter + Vector(0, CellSize * 0.5, WallHeight * 0.5)`
- Rotation: `(0, 0, 0)`

**East Wall (`bWallEast`):** Only check when `X == MazeWidth - 1` (right column only).

- Location: `CellWorldCenter + Vector(CellSize * 0.5, 0, WallHeight * 0.5)`
- Rotation: `(0, 90, 0)`

<a href="{{ '/assets/images/blog/Part4-Step-17b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-17b.png' | relative_url }}" style="width:100%;" alt="The four wall Branch nodes. South and West check only the wall boolean. North has an outer Y == MazeHeight-1 check. East has an outer X == MazeWidth-1 check. Each True path calls SpawnWall with the correct offset and rotation." class="post-image">
</a>

**Special markers (Entrance / Exit):**

After the floor spawn, break the `Cell` struct and check:

- **Branch** on `bIsEntrance` → **True:** Spawn `EntranceMesh` at `CellWorldCenter`. Add to `SpawnedActors`.
- **Branch** on `bIsExit` → **True:** Spawn `ExitMesh` at `CellWorldCenter`. Add to `SpawnedActors`.

<a href="{{ '/assets/images/blog/Part4-Step-17c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-17c.png' | relative_url }}" style="width:100%;" alt="The entrance and exit marker Branches following the floor spawn, each spawning the appropriate mesh at the cell's world center." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part4-Step-17d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part4-Step-17d.png' | relative_url }}" style="width:100%;" alt="The full SpawnMeshes function showing the nested For Loop, floor spawn, four wall Branches, and the entrance and exit marker Branches." class="post-image">
</a>

---

## Part 5 — Wire Up BeginPlay

### Step 18 — Connect Everything in the Event Graph

Open the **Event Graph** of `BP_MazeGenerator`. Connect the full generation chain:

```
Event BeginPlay
  → InitializeSeed
  → InitializeGrid
  → RunDFSAlgorithm
  → PlaceEntranceAndExit
  → SpawnMeshes
```

Each node's white execution arrow feeds into the next function call's input exec pin.

<a href="{{ '/assets/images/blog/Part5-Step-18.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part5-Step-18.png' | relative_url }}" style="width:100%;" alt="The completed Event BeginPlay graph with five function calls connected left to right via white execution arrows." class="post-image">
</a>

### Step 19 — Optional: `RegenerateMaze` Custom Event

Useful for testing — press a key in-game to tear down and rebuild the maze.

1. Right-click the graph → **Add Custom Event** → name it `RegenerateMaze`.
2. Connect to a **For Each Loop** over `SpawnedActors` → **Destroy Actor** on each one → **Clear** `SpawnedActors` after Completed.
3. Chain: `InitializeGrid → RunDFSAlgorithm → PlaceEntranceAndExit → SpawnMeshes`.

To trigger it from a key, open the **Level Blueprint** (toolbar → **Blueprints → Open Level Blueprint**):

- Add a **R Pressed** keyboard event → **Get All Actors of Class** (`BP_MazeGenerator`) → **Get (index 0)** → **Cast to BP_MazeGenerator** → call **RegenerateMaze**.

<a href="{{ '/assets/images/blog/Part5-Step-19a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part5-Step-19a.png' | relative_url }}" style="width:100%;" alt="The RegenerateMaze custom event: For Each Loop destroying all SpawnedActors, Clear SpawnedActors, then the four generation functions chained." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part5-Step-19b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part5-Step-19b.png' | relative_url }}" style="width:100%;" alt="The Level Blueprint: R Key Pressed, Get All Actors of Class BP_MazeGenerator, Get index 0, Cast to BP_MazeGenerator, call RegenerateMaze." class="post-image">
</a>

---

## Part 6 — Place It in the Level

### Step 20 — Drop the Actor Into the Level

1. **Compile** and **Save** `BP_MazeGenerator`.
2. Drag it from the Content Browser into the **Viewport**.
3. Position it where you want the maze's corner to start (the maze grows in the +X and +Y directions from the Actor's origin).
4. In the **Details** panel, fill in the variables:
   - `MazeSeed`: `0` for random, or any number (e.g., `42`) for a fixed maze.
   - `MazeWidth`, `MazeHeight`: Start with `10`.
   - `CellSize`: `400`.
   - **FloorMesh / WallMesh**: Click the dropdown → search **Cube** → select `/Engine/BasicShapes/Cube`.

<a href="{{ '/assets/images/blog/Part6-Step-20a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part6-Step-20a.png' | relative_url }}" style="width:100%;" alt="The BP_MazeGenerator actor placed in the viewport at the corner of where the maze will grow." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part6-Step-20b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part6-Step-20b.png' | relative_url }}" style="width:100%;" alt="The Details panel for BP_MazeGenerator with MazeSeed, MazeWidth, MazeHeight, CellSize set, and FloorMesh and WallMesh both assigned to the Engine Cube." class="post-image">
</a>

### Step 21 — Hit Play

Press **Play**. A maze should appear.

If nothing generates, check:

- **Window → Output Log** for Blueprint errors.
- That `FloorMesh` and `WallMesh` are assigned in the Details panel.
- That the Actor is in the level and not hidden.

<a href="{{ '/assets/images/blog/Part6-Step-21.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part6-Step-21.png' | relative_url }}" style="width:100%;" alt="The finished maze seen from above in Play mode: a 10x10 grid of floor tiles with walls forming a perfect maze, with a visible entrance gap on one edge and an exit gap on another." class="post-image">
</a>

---

## Part 7 — Carrying the Seed Between Levels

If you want the **same maze to reappear when the player replays a level** (for example, after dying), you need to store the seed somewhere that survives a level reload. The **Game Instance** persists across level loads — it's perfect for this.

### Step 22 — Create `BP_GameInstance`

1. Content Browser → right-click → **Blueprint Class** → parent class: **GameInstance**.
2. Name it `BP_GameInstance`.
3. Add three variables:
   - `PendingSeed` (Integer, default 0)
   - `bHasPendingSeed` (Boolean, default false)
   - `LastGeneratedSeed` (Integer, default 0)

<a href="{{ '/assets/images/blog/Part7-Step-22a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part7-Step-22a.png' | relative_url }}" style="width:100%;" alt="The BP_GameInstance My Blueprint panel with the three seed variables listed." class="post-image">
</a>

4. Add three functions:

**`SetPendingSeed(Seed: Integer)`** — Set `PendingSeed = Seed` and `bHasPendingSeed = true`.

**`ConsumeSeed` → Integer** — Branch on `bHasPendingSeed`: True sets it `false` and returns `PendingSeed`; False returns `0`.

**`RecordGeneratedSeed(Seed: Integer)`** — Set `LastGeneratedSeed = Seed`.

<a href="{{ '/assets/images/blog/Part7-Step-22b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part7-Step-22b.png' | relative_url }}" style="width:100%;" alt="The ConsumeSeed function: Branch on bHasPendingSeed, True path sets it false and returns PendingSeed, False path returns 0." class="post-image">
</a>

5. Go to **Edit → Project Settings → Maps & Modes → Game Instance Class** → set to `BP_GameInstance`.

<a href="{{ '/assets/images/blog/Part7-Step-22c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part7-Step-22c.png' | relative_url }}" style="width:100%;" alt="The Project Settings Maps and Modes section with Game Instance Class set to BP_GameInstance." class="post-image">
</a>

### Step 23 — Use the Game Instance in `BP_MazeGenerator`

Modify `InitializeSeed`:

1. At the start of the function: **Get Game Instance** → **Cast to BP_GameInstance** → call **ConsumeSeed**.
2. **Branch** on the result `!= 0`:
   - **True:** Set `ActualSeed` to the returned value. Skip the random logic entirely.
   - **False:** Fall through to the existing random seed generation.
3. Both paths still feed into the **Make Random Stream** / **Set RandStream** nodes as before.

At the end of **Event BeginPlay** (after `SpawnMeshes`): **Get Game Instance → Cast to BP_GameInstance → RecordGeneratedSeed(ActualSeed)**.

<a href="{{ '/assets/images/blog/Part7-Step-23a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part7-Step-23a.png' | relative_url }}" style="width:100%;" alt="The updated InitializeSeed: Get Game Instance, Cast to BP_GameInstance, ConsumeSeed, Branch on result != 0. The True path sets ActualSeed directly; the False path runs the original random logic. Both paths converge at Make Random Stream." class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part7-Step-23b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part7-Step-23b.png' | relative_url }}" style="width:100%;" alt="The updated Event BeginPlay with RecordGeneratedSeed called on the Game Instance after SpawnMeshes completes." class="post-image">
</a>

To **replay the same maze:**

```
GetGameInstance → Cast to BP_GameInstance → SetPendingSeed(LastGeneratedSeed) → OpenLevel(same level)
```

To **send a specific maze to the next level:**

```
GetGameInstance → Cast to BP_GameInstance → SetPendingSeed(1337) → OpenLevel("Level_02")
```

---

## Troubleshooting

**Walls are floating or misaligned**

- Confirm your mesh is 100×100×100 cm. If it's a different size, adjust the scale math in `SpawnWall` and the floor spawn accordingly.
- The `WallHeight * 0.5` Z offset centers the wall vertically — if you change `WallHeight`, this offset updates automatically since it reads the variable.

**Same seed gives a different maze**

- Make sure every random call uses **Random Integer in Range from Stream** with `RandStream`. Any call to the plain **Random Integer in Range** node uses the global seed and breaks reproducibility.

**Maze is slow to generate on large sizes**

- Blueprint is interpreted, so 50×50+ grids will noticeably lag. For large mazes, replace individual spawned Actors with a **Hierarchical Instanced Static Mesh Component** — one HISM per mesh type, with instances added instead of actors spawned.

**Some cells have no floor**

- Check that both nested For Loops run from `0` to the correct Last Index. Use `MazeHeight - 1` and `MazeWidth - 1` as the Last Index values, not the raw dimensions.

**Entrance and exit are right next to each other**

- This can happen on very small mazes (e.g., 3×3). Increase your dimensions, or add a minimum-distance check between the entrance and exit coordinates after placement.

---

## Summary

Here's everything you built:

- `S_MazeCell` — a struct with four wall booleans, visited flag, and entrance/exit flags
- `S_NeighbourInfo` — a helper struct carrying neighbour index and direction deltas
- `BP_GameInstance` — persists the maze seed across level loads
- `BP_MazeGenerator` — the main Actor with:
  - `GetCellIndex` / `IsInBounds` / `GridToWorld` — coordinate helpers
  - `RemoveWallBetween` — wall carver
  - `GetUnvisitedNeighbours` — neighbour finder
  - `InitializeSeed` — seeded random stream setup
  - `InitializeGrid` — fresh grid population
  - `RunDFSAlgorithm` — the maze carver
  - `PlaceEntranceAndExit` — border cell selection
  - `SpawnWall` / `SpawnMeshes` — geometry spawning
  - `RegenerateMaze` — live rebuild

The key insight of the whole system is the **seeded random stream** — by initializing `RandStream` with `ActualSeed` before the algorithm runs, every random decision becomes deterministic. The same seed produces the same maze, every time. Share the number with someone and they get the exact same layout.

---

## Next Steps

- **Swap the Engine cube** for your own modular wall and floor meshes
- **Add a minimap** by reading `MazeGrid` and drawing Debug Lines or UI Image widgets
- **Add a solve visualizer** that highlights the correct path using a breadth-first search on the grid
- **Add rooms** by designating certain cells before DFS runs and skipping wall removal within a radius
- **Performance:** Replace spawned Actors with a **Hierarchical Instanced Static Mesh Component** — a massive win for mazes larger than 20×20
