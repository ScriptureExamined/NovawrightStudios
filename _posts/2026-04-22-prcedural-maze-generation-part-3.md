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
- create one entrance and one exit
- fully generate the maze in the editor using the Construction Script

---

## Before You Start

You should already have from Part 2:

- `InitializeGrid`
- `GetUnvisitedNeighbors`
- `RemoveWallBetween`
- `GenerateMaze`

You should also already have these variables:

- `MazeGrid`
- `MazeWidth`
- `MazeHeight`
- `CellSize`
- `MazeSeed`
- `RandomStream`

You should also have these HISM components:

- `FloorHISM`
- `WallHISM`

---

# Step 1 — Create the `BuildMazeVisuals` Function

---

## What this step does

This function turns your invisible maze data into visible floor and wall meshes.

It loops through every cell in `MazeGrid` and:

- places one floor tile per cell
- places wall meshes wherever a wall boolean is still `True`

---

## Before you start

Make sure both HISM components have a mesh assigned from Part 1. If either is empty, go back to Step 1.3 of Part 1 before continuing.

Also review the wall offset reference table below before building this function. You will refer back to it throughout this step.

### Wall offset and rotation reference

| Wall  | X offset    | Y offset    | Z offset   | Rotation Z |
| ----- | ----------- | ----------- | ---------- | ---------- |
| North | 0           | -CellSize/2 | CellSize/2 | 0°         |
| East  | CellSize/2  | 0           | CellSize/2 | 90°        |
| South | 0           | CellSize/2  | CellSize/2 | 180°       |
| West  | -CellSize/2 | 0           | CellSize/2 | -90°       |

> Z offset places the wall centre at half the cell height so it sits correctly above the floor tile. Rotation only matters if you replace the Cube mesh with a custom asymmetric wall mesh later.

### Mesh scale reference

The built-in `Cube` mesh is 100×100×100 units. Since `CellSize` is 200 by default, you must scale the meshes to fill the cell correctly.

| Mesh  | Scale X        | Scale Y        | Scale Z        |
| ----- | -------------- | -------------- | -------------- |
| Floor | CellSize / 100 | CellSize / 100 | 0.1            |
| Wall  | CellSize / 100 | 0.1            | CellSize / 100 |

> If you change `CellSize` later, the scale calculations update automatically because they read directly from the variable.

---

## Instructions

### Step 1.1 — Create the function

1. In the **My Blueprint** panel, find **Functions**

2. Click the **+** button next to **Functions**

3. Name the function:

   `BuildMazeVisuals`

4. Press **Enter**

---

### Step 1.2 — Add comment boxes

Before placing any nodes, set up comment boxes to keep the graph organised.

#### Step 1.2.1 — Add the comment boxes

1. Left-click and drag in empty graph space to select an area

2. Press **C**

3. Name the comment box:

   `Floor`

4. Repeat this process four more times and name them:

- `North Wall`
- `East Wall`
- `South Wall`
- `West Wall`

> Arrange them left to right or top to bottom — whichever feels clearer to you.

---

### Step 1.3 — Add a For Loop

The For Loop goes through every cell in `MazeGrid`. Each pass places one floor tile and checks all four walls.

#### Step 1.3.1 — Place the For Loop

1. Right-click in empty graph space

2. Search for:

   `For Loop`

3. Choose the plain:

   `For Loop`

4. Connect the white execution pin from:

   `BuildMazeVisuals` (function entry node)

   to

   `For Loop`

#### Step 1.3.2 — Set the loop range

5. Drag `MazeGrid` into the graph as **Get**

6. Drag from the `MazeGrid` pin

7. Search for:

   `Length`

8. Click:

   `Array Length`

9. Drag from the `Length` result

10. Search for:

    `-`

11. Choose:

    `Subtract`

12. Set the second input to:

    `1`

13. Connect:
    - subtraction result → `For Loop.Last Index`

14. Set:
    - `For Loop.First Index = 0`

> Arrays start at 0. If `MazeGrid` has 144 cells (12×12), the last valid index is 143 — not 144. That is why we subtract 1.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.3.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.3.png' | relative_url }}" style="width:100%;" alt="For Loop with First Index 0 and Last Index connected from MazeGrid Array Length minus one" class="post-image">
</a>

---

### Step 1.4 — Get the current cell

Each loop pass gives us an index. We use that index to read the matching cell from `MazeGrid` and access its data.

#### Step 1.4.1 — Read the cell from MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Drag `For Loop.Index` and connect:
   - `For Loop.Index` → **Index** on `Get (a copy)`

#### Step 1.4.2 — Break the cell struct

6. Drag from the output of `Get (a copy)`

7. Search for:

   `Break S_MazeCell`

8. Click:

   `Break S_MazeCell`

This gives you access to:

- `Row`
- `Col`
- `bWallNorth`
- `bWallEast`
- `bWallSouth`
- `bWallWest`

> You will reuse the output pins of this Break node throughout the rest of the function. Place it in a central position and do not create additional Break nodes for the same cell.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.4.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.4.png' | relative_url }}" style="width:100%;" alt="MazeGrid Get a copy using For Loop Index connected into Break S_MazeCell showing Row Col and wall boolean outputs" class="post-image">
</a>

---

### Step 1.5 — Calculate the cell world location

The maze stores cells as rows and columns. Meshes need world positions. This step converts grid coordinates into a world location vector.

- `Col` → X axis
- `Row` → Y axis
- Z stays `0` (floor level)

#### Step 1.5.1 — Calculate X

1. Drag from `Col` (on `Break S_MazeCell`)

2. Search for:

   `*`

3. Choose:

   `Multiply`

4. Drag `CellSize` into the graph as **Get**

5. Connect:
   - `CellSize` → second input of `*`

#### Step 1.5.2 — Calculate Y

6. Drag from `Row` (on `Break S_MazeCell`)

7. Search for:

   `*`

8. Choose:

   `Multiplyr`

9. Drag `CellSize` into the graph as **Get** (you can use the same CellSize from the last step as well)

10. Connect:
    - `CellSize` → second input of `*`

#### Step 1.5.3 — Make the cell location vector

11. Right-click in empty graph space

12. Search for:

    `Make Vector`

13. Click:

    `Make Vector`

14. Connect:
    - `Col × CellSize` result → `Make Vector.X`
    - `Row × CellSize` result → `Make Vector.Y`

15. Set:
    - `Make Vector.Z = 0`

> This vector is the centre point of the current cell. All floor and wall placements will use this as their base position.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.5.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.5.png' | relative_url }}" style="width:100%;" alt="Col multiplied by CellSize connected to Make Vector X and Row multiplied by CellSize connected to Make Vector Y with Z set to zero" class="post-image">
</a>

---

### Step 1.6 — Calculate the floor mesh scale

The `Cube` mesh is 100×100×100 units. You must scale it to fill the cell.

#### Step 1.6.1 — Calculate scale XY

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Choose:

   `Divide`

5. Set the second input to:

   `100`

This gives `CellSize / 100`.

#### Step 1.6.2 — Make the floor scale vector

6. Right-click in empty graph space

7. Search for:

   `Make Vector`

8. Click:

   `Make Vector`

9. Connect:
   - `CellSize / 100` → `Make Vector.X`
   - `CellSize / 100` → `Make Vector.Y`

> You can drag multiple wires from the same output pin — just drag from it again.

10. Set:
    - `Make Vector.Z = 0.1`

> Z scale of 0.1 makes the floor tile thin. You can adjust this later.

---

### Step 1.7 — Add the floor mesh

Place all nodes for this section **inside the `Floor` comment box**.

#### Step 1.7.1 — Create the floor transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect:
   - cell location `Make Vector` output → `Make Transform.Location`
   - floor scale `Make Vector` output → `Make Transform.Scale`

5. Set Rotation:
   - X = `0`
   - Y = `0`
   - Z = `0`

#### Step 1.7.2 — Add the floor instance

6. Drag `FloorHISM` into the graph as **Get**

7. Drag from the `FloorHISM` pin

8. Search for:

   `Add Instance`

9. Click:

   `Add Instance`

10. Connect:
    - `For Loop.Loop Body` → `FloorHISM Add Instance`
    - floor `Make Transform` → `Add Instance.Instance Transform`

---

<a href="{{ '/assets/images/blog/Part3-Step-1.7.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.7.png' | relative_url }}" style="width:100%;" alt="Floor comment box showing Make Transform with cell location and floor scale connected into FloorHISM Add Instance" class="post-image">
</a>

---

### Step 1.8 — Add the Sequence node

The Sequence node lets all four wall checks run independently after the floor is placed.

> Because we are using a Sequence node, each wall check runs on its own execution path. The `Branch.False` pins do not need to connect anywhere — if the wall does not exist, that branch simply ends and the Sequence continues to the next direction.

#### Step 1.8.1 — Place and connect the Sequence node

1. Right-click in empty graph space

2. Search for:

   `Sequence`

3. Click:

   `Sequence`

4. Connect the white execution pin from:

   `FloorHISM Add Instance`

   to

   `Sequence`

The Sequence node starts with two outputs. Add two more:

5. Click **Add pin +** on the Sequence node **twice**

You should now have:

- `Then 0` → North wall check
- `Then 1` → East wall check
- `Then 2` → South wall check
- `Then 3` → West wall check

---

<a href="{{ '/assets/images/blog/Part3-Step-1.8.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.8.png' | relative_url }}" style="width:100%;" alt="Sequence node connected after FloorHISM Add Instance showing four outputs Then 0 through Then 3" class="post-image">
</a>

---

### Step 1.9 — Calculate the wall mesh scale

All four walls use the same scale. Build it once and reuse the output.

#### Step 1.9.1 — Calculate wall scale

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Choose:

   `Divide`

5. Set the second input to:

   `100`

This gives `CellSize / 100`.

#### Step 1.9.2 — Make the wall scale vector

6. Right-click in empty graph space

7. Search for:

   `Make Vector`

8. Click:

   `Make Vector`

9. Connect:
   - `CellSize / 100` → `Make Vector.X`

10. Set:
    - `Make Vector.Y = 0.1`
    - `Make Vector.Z` → connect `CellSize / 100` here as well

> You can drag a second wire from the same `CellSize / 100` output pin.

> Y scale of 0.1 gives the wall its thickness. X and Z scale to match the cell size so the wall fills the full cell width and height.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.9.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.9.png' | relative_url }}" style="width:100%;" alt="Full floor comment box" class="post-image">
</a>

---

### Step 1.10 — Add the North wall

Place all nodes for this section **inside the `North Wall` comment box**.

#### Step 1.10.1 — Add the North Branch

1. Right-click in empty graph space

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect the white execution pin from:

   `Sequence.Then 0`

   to

   `Branch` (North)

5. Connect:
   - `bWallNorth` (from `Break S_MazeCell`) → `Branch.Condition`

#### Step 1.10.2 — Calculate the North wall offset

The North wall sits at:

- X = `0`
- Y = `-CellSize / 2`
- Z = `CellSize / 2`

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Choose:

   `Divide`

5. Set the second input to:

   `2`

This gives `CellSize / 2`.

6. Right-click in empty graph space

7. Search for:

   `Make Vector`

8. Click:

   `Make Vector`

9. Connect:
   - `CellSize / 2` → `Make Vector.Z`

10. Set:
    - `Make Vector.X = 0`

11. Drag from the `CellSize / 2` result again

12. Search for:

    `*`

13. Choose:

    `Multiply`

14. Set the second input to:

    `-1`

15. Connect:
    - output of the `Multiply` node → `Make Vector.Y`

#### Step 1.10.3 — Add the offset to the cell location

1. Drag from the cell location `Make Vector` output (from Step 1.5.3)

2. Search for:

   `+`

3. Choose:

   `Add`

4. Connect:
   - North wall offset `Make Vector` → second input of `+`

#### Step 1.10.4 — Create the North wall transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect:
   - `+` result → `Make Transform.Location`
   - wall scale `Make Vector` output (from Step 1.9.2) → `Make Transform.Scale`

5. Set Rotation:
   - X = `0`
   - Y = `0`
   - Z = `0`

#### Step 1.10.5 — Add the North wall instance

1. Drag `WallHISM` into the graph as **Get**

2. Drag from the `WallHISM` pin

3. Search for:

   `Add Instance`

4. Click:

   `Add Instance`

5. Connect the white execution pin from:

   `Branch.True` (North)

   to

   `WallHISM Add Instance`

6. Connect:
   - North wall `Make Transform` → `Add Instance.Instance Transform`

> Leave `Branch.False` unconnected. The Sequence node handles continuation.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.10.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.10.png' | relative_url }}" style="width:100%;" alt="North Wall comment box showing Branch on bWallNorth, offset Make Vector with negative CellSize over 2 for Y and CellSize over 2 for Z, added to cell location, Make Transform with wall scale, and WallHISM Add Instance" class="post-image">
</a>

---

### Step 1.11 — Add the East wall

Place all nodes for this section **inside the `East Wall` comment box**.

#### Step 1.11.1 — Add the East Branch

1. Right-click in empty graph space

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect the white execution pin from:

   `Sequence.Then 1`

   to

   `Branch` (East)

5. Connect:
   - `bWallEast` (from `Break S_MazeCell`) → `Branch.Condition`

#### Step 1.11.2 — Calculate the East wall offset

The East wall sits at:

- X = `CellSize / 2`
- Y = `0`
- Z = `CellSize / 2`

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Choose:

   `Float / Float`

5. Set the second input to:

   `2`

This gives `CellSize / 2`.

6. Right-click in empty graph space

7. Search for:

   `Make Vector`

8. Click:

   `Make Vector`

9. Connect:
   - `CellSize / 2` → `Make Vector.X`
   - `CellSize / 2` → `Make Vector.Z`

> Drag a second wire from the same `CellSize / 2` output pin for Z.

10. Set:
    - `Make Vector.Y = 0`

#### Step 1.11.3 — Add the offset to the cell location

1. Drag from the cell location `Make Vector` output (from Step 1.5.3)

2. Search for:

   `+`

3. Choose:

   `Vector + Vector`

4. Connect:
   - East wall offset `Make Vector` → second input of `+`

#### Step 1.11.4 — Create the East wall transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect:
   - `+` result → `Make Transform.Location`
   - wall scale `Make Vector` output (from Step 1.9.2) → `Make Transform.Scale`

5. Set Rotation:
   - X = `0`
   - Y = `0`
   - Z = `90`

#### Step 1.11.5 — Add the East wall instance

1. Drag `WallHISM` into the graph as **Get**

2. Drag from the `WallHISM` pin

3. Search for:

   `Add Instance`

4. Click:

   `Add Instance`

5. Connect the white execution pin from:

   `Branch.True` (East)

   to

   `WallHISM Add Instance`

6. Connect:
   - East wall `Make Transform` → `Add Instance.Instance Transform`

> Leave `Branch.False` unconnected.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.11.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.11.png' | relative_url }}" style="width:100%;" alt="East Wall comment box showing Branch on bWallEast, offset Make Vector with CellSize over 2 for X and Z, added to cell location, Make Transform with 90 degree Z rotation and wall scale, and WallHISM Add Instance" class="post-image">
</a>

---

### Step 1.12 — Add the South wall

Place all nodes for this section **inside the `South Wall` comment box**.

#### Step 1.12.1 — Add the South Branch

1. Right-click in empty graph space

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect the white execution pin from:

   `Sequence.Then 2`

   to

   `Branch` (South)

5. Connect:
   - `bWallSouth` (from `Break S_MazeCell`) → `Branch.Condition`

#### Step 1.12.2 — Calculate the South wall offset

The South wall sits at:

- X = `0`
- Y = `CellSize / 2`
- Z = `CellSize / 2`

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Choose:

   `Float / Float`

5. Set the second input to:

   `2`

This gives `CellSize / 2`.

6. Right-click in empty graph space

7. Search for:

   `Make Vector`

8. Click:

   `Make Vector`

9. Connect:
   - `CellSize / 2` → `Make Vector.Y`
   - `CellSize / 2` → `Make Vector.Z`

> Drag a second wire from the same `CellSize / 2` output pin for Z.

10. Set:
    - `Make Vector.X = 0`

#### Step 1.12.3 — Add the offset to the cell location

1. Drag from the cell location `Make Vector` output (from Step 1.5.3)

2. Search for:

   `+`

3. Choose:

   `Vector + Vector`

4. Connect:
   - South wall offset `Make Vector` → second input of `+`

#### Step 1.12.4 — Create the South wall transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect:
   - `+` result → `Make Transform.Location`
   - wall scale `Make Vector` output (from Step 1.9.2) → `Make Transform.Scale`

5. Set Rotation:
   - X = `0`
   - Y = `0`
   - Z = `180`

#### Step 1.12.5 — Add the South wall instance

1. Drag `WallHISM` into the graph as **Get**

2. Drag from the `WallHISM` pin

3. Search for:

   `Add Instance`

4. Click:

   `Add Instance`

5. Connect the white execution pin from:

   `Branch.True` (South)

   to

   `WallHISM Add Instance`

6. Connect:
   - South wall `Make Transform` → `Add Instance.Instance Transform`

> Leave `Branch.False` unconnected.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.12.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.12.png' | relative_url }}" style="width:100%;" alt="South Wall comment box showing Branch on bWallSouth, offset Make Vector with CellSize over 2 for Y and Z, added to cell location, Make Transform with 180 degree Z rotation and wall scale, and WallHISM Add Instance" class="post-image">
</a>

---

### Step 1.13 — Add the West wall

Place all nodes for this section **inside the `West Wall` comment box**.

#### Step 1.13.1 — Add the West Branch

1. Right-click in empty graph space

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect the white execution pin from:

   `Sequence.Then 3`

   to

   `Branch` (West)

5. Connect:
   - `bWallWest` (from `Break S_MazeCell`) → `Branch.Condition`

#### Step 1.13.2 — Calculate the West wall offset

The West wall sits at:

- X = `-CellSize / 2`
- Y = `0`
- Z = `CellSize / 2`

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Choose:

   `Float / Float`

5. Set the second input to:

   `2`

This gives `CellSize / 2`.

6. Right-click in empty graph space

7. Search for:

   `Make Vector`

8. Click:

   `Make Vector`

9. Connect:
   - `CellSize / 2` → `Make Vector.Z`

10. Set:
    - `Make Vector.Y = 0`

11. Drag from the `CellSize / 2` result again

12. Search for:

    `*`

13. Choose:

    `Float * Float`

14. Set the second input to:

    `-1`

15. Connect:
    - `-CellSize / 2` result → `Make Vector.X`

#### Step 1.13.3 — Add the offset to the cell location

1. Drag from the cell location `Make Vector` output (from Step 1.5.3)

2. Search for:

   `+`

3. Choose:

   `Vector + Vector`

4. Connect:
   - West wall offset `Make Vector` → second input of `+`

#### Step 1.13.4 — Create the West wall transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect:
   - `+` result → `Make Transform.Location`
   - wall scale `Make Vector` output (from Step 1.9.2) → `Make Transform.Scale`

5. Set Rotation:
   - X = `0`
   - Y = `0`
   - Z = `-90`

#### Step 1.13.5 — Add the West wall instance

1. Drag `WallHISM` into the graph as **Get**

2. Drag from the `WallHISM` pin

3. Search for:

   `Add Instance`

4. Click:

   `Add Instance`

5. Connect the white execution pin from:

   `Branch.True` (West)

   to

   `WallHISM Add Instance`

6. Connect:
   - West wall `Make Transform` → `Add Instance.Instance Transform`

> Leave `Branch.False` unconnected.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.13.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.13.png' | relative_url }}" style="width:100%;" alt="West Wall comment box showing Branch on bWallWest, offset Make Vector with negative CellSize over 2 for X and CellSize over 2 for Z, added to cell location, Make Transform with negative 90 degree Z rotation and wall scale, and WallHISM Add Instance" class="post-image">
</a>

---

### Step 1.14 — Final wall placement check

Your wall placement should now follow this execution structure:

```
FloorHISM Add Instance
→ Sequence
   → Then 0 → Branch (bWallNorth) → True → WallHISM Add Instance (North)
   → Then 1 → Branch (bWallEast)  → True → WallHISM Add Instance (East)
   → Then 2 → Branch (bWallSouth) → True → WallHISM Add Instance (South)
   → Then 3 → Branch (bWallWest)  → True → WallHISM Add Instance (West)
```

Each Branch False pin is intentionally unconnected. The Sequence node guarantees all four checks run regardless.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.14.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.14.png' | relative_url }}" style="width:100%;" alt="Complete wall placement setup showing Sequence node with four outputs each connected to a Branch checking the corresponding wall boolean and adding a WallHISM instance on True" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`BuildMazeVisuals → For Loop → For Loop.Loop Body → FloorHISM Add Instance → Sequence → Then 0/1/2/3 → Branch (per wall) → WallHISM Add Instance (if True)`

**Data flow:**

- `MazeGrid.Length - 1` → `For Loop.Last Index`
- `For Loop.Index` → `MazeGrid.Get (a copy).Index`
- `Get (a copy)` output → `Break S_MazeCell`
- `Col × CellSize` → `Make Vector.X` (cell location)
- `Row × CellSize` → `Make Vector.Y` (cell location)
- cell location + wall offset → `Make Transform.Location` (per wall)
- `CellSize / 100` → floor and wall scale vectors
- wall booleans → Branch conditions

---

## Why this matters

This function is what makes the maze visible. Without it, the maze exists only as data in `MazeGrid` with no representation in the world.

The Sequence node ensures all four wall checks always run. The Branch nodes ensure only walls that still exist get rendered.

---

## Common mistakes

❌ Not scaling the floor or wall meshes
✔️ The Cube mesh is 100 units — scale by `CellSize / 100` or tiles will have gaps

---

❌ Forgetting to add the Sequence node and chaining Branch False pins instead
✔️ The Sequence node is cleaner and avoids execution gaps

---

❌ Connecting the cell location directly into `Make Transform` without adding the wall offset
✔️ Each wall needs its own offset vector added to the cell location first

---

❌ Reusing the floor scale vector for walls
✔️ Floor and wall scales are different — build them separately

---

❌ Forgetting to call `BuildMazeVisuals` from the Construction Script
✔️ See Step 2 — the function must be added to the Construction Script execution chain

---

## Expected result

Your `BuildMazeVisuals` function now:

- loops through every cell in `MazeGrid`
- places a correctly scaled floor tile at each cell position
- checks all four wall booleans
- places correctly scaled and positioned wall meshes wherever walls still exist

When this function runs, the maze becomes visible in the editor.

---

# Step 2 — Create the `OpenBorderWallAtIndex` Function

---

## Why we are making this helper function

Both the entrance and the exit need to do the same thing:

1. Get a border cell
2. Check which edge it is on
3. Remove the correct outside wall
4. Write the updated cell back into `MazeGrid`

Instead of building that logic twice, we will make one reusable function.

---

# Step 2.1 — Create the Function

---

1. In **My Blueprint → Functions**

2. Click:

   `+ Function`

3. Name it:

   `OpenBorderWallAtIndex`

---

# Step 2.2 — Add the Function Input

---

1. Select the `OpenBorderWallAtIndex` function

2. In the Details panel, find **Inputs**

3. Click:

   `+`

4. Name the input:

   `CellIndex`

5. Set the type to:

   `Integer`

6. Make sure it is a single value, not an array

---

## Expected result

The function now accepts one integer called `CellIndex`.

This tells the function which cell to open.

---

# Step 2.3 — Get the Cell from MazeGrid

---

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from `MazeGrid`

3. Search for:

   `Get`

4. Click:

   `Get (a copy)`

5. Connect:

- `CellIndex` → `Get (a copy).Index`

---

# Step 2.4 — Break the Cell Struct

---

1. Drag from the output pin of `Get (a copy)`

2. Search for:

   `Break S_MazeCell`

3. Click:

   `Break S_MazeCell`

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.4.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.4.png' | relative_url }}" style="width:100%;" alt="OpenBorderWallAtIndex getting MazeGrid cell by CellIndex and breaking S_MazeCell" class="post-image">
</a>

---

# Step 2.5 — Create Border Checks

---

## What this step does

We check which outer edge the selected cell is on.

---

## Top border check

1. From `Break S_MazeCell`, drag from:

   `Row`

2. Search for:

   `==`

3. Click:

   `Equal (Integer)`

4. Set the second value to:

   `0`

This creates:

`Row == 0`

---

## Bottom border check

1. Drag `MazeHeight` into the graph as **Get**

2. Drag from `MazeHeight`

3. Search for:

   `Subtract`

4. Click:

   `Subtract`

5. Set the second value to:

   `1`

6. From `Break S_MazeCell`, drag from:

   `Row`

7. Search for:

   `==`

8. Click:

   `Equal (Integer)`

9. Connect:

- `Row` → first input
- `MazeHeight - 1` → second input

This creates:

`Row == MazeHeight - 1`

---

## Left border check

1. From `Break S_MazeCell`, drag from:

   `Col`

2. Search for:

   `==`

3. Click:

   `Equal (Integer)`

4. Set the second value to:

   `0`

This creates:

`Col == 0`

---

## Right border check

1. Drag `MazeWidth` into the graph as **Get**

2. Drag from `MazeWidth`

3. Search for:

   `Subtract`

4. Click:

   `Subtract`

5. Set the second value to:

   `1`

6. From `Break S_MazeCell`, drag from:

   `Col`

7. Search for:

   `==`

8. Click:

   `Equal (Integer)`

9. Connect:

- `Col` → first input
- `MazeWidth - 1` → second input

This creates:

`Col == MazeWidth - 1`

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.5.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.5.png' | relative_url }}" style="width:100%;" alt="Four border checks for top bottom left and right edges using Row Col MazeHeight and MazeWidth" class="post-image">
</a>

---

# Step 2.6 — Add the Border Branch Chain

---

## What this step does

Only one outside wall should be opened.

We will check in this order:

`Top → Bottom → Left → Right`

---

# Step 2.6.1 — Top Branch

---

1. Drag from the `Row == 0` comparison output

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect the function execution input to this Branch

5. Connect:

- `Row == 0` → `Branch.Condition`

---

# Step 2.6.2 — Bottom Branch

---

1. Drag from the `Row == MazeHeight - 1` comparison output

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect:

- `Top Branch.False` → `Bottom Branch`

5. Connect:

- `Row == MazeHeight - 1` → `Bottom Branch.Condition`

---

# Step 2.6.3 — Left Branch

---

1. Drag from the `Col == 0` comparison output

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect:

- `Bottom Branch.False` → `Left Branch`

5. Connect:

- `Col == 0` → `Left Branch.Condition`

---

# Step 2.6.4 — Right Branch

---

1. Drag from the `Col == MazeWidth - 1` comparison output

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect:

- `Left Branch.False` → `Right Branch`

5. Connect:

- `Col == MazeWidth - 1` → `Right Branch.Condition`

6. Leave `Right Branch.False` unconnected

---

## Execution recap

- Top True → open North wall
- Top False → check Bottom

- Bottom True → open South wall
- Bottom False → check Left

- Left True → open West wall
- Left False → check Right

- Right True → open East wall
- Right False → end

---

# Step 2.7 — Open the Correct Wall and Save the Cell

---

## Important concept

`Set Members in S_MazeCell` changes a copy of the cell.

`Set Array Elem` writes that updated cell back into `MazeGrid`.

Each wall path needs its own:

- `Set Members in S_MazeCell`
- `Set Array Elem`

---

# Step 2.7.1 — Top Branch True: Open North Wall

---

1. Drag from the original:

   `MazeGrid → Get (a copy)`

2. Search for:

   `Set Members in S_MazeCell`

3. Click:

   `Set Members in S_MazeCell`

4. Enable only:

   `bWallNorth`

5. Set `bWallNorth` to:

   `false`

6. Connect:

- `Top Branch.True` → `Set Members in S_MazeCell`

7. Drag `MazeGrid` into the graph as **Get**

8. Drag from `MazeGrid`

9. Search for:

   `Set Array Elem`

10. Click:

`Set Array Elem`

11. Connect:

- `Set Members` execution output → `Set Array Elem`
- `Set Members` struct output → `Set Array Elem.Item`
- `MazeGrid` → `Set Array Elem.Target Array`
- `CellIndex` → `Set Array Elem.Index`

12. Make sure:

- `Size to Fit` is unchecked

---

# Step 2.7.2 — Bottom Branch True: Open South Wall

---

Repeat the same pattern, but use:

- `Bottom Branch.True`
- `bWallSouth = false`
- `CellIndex` for `Set Array Elem.Index`

---

# Step 2.7.3 — Left Branch True: Open West Wall

---

Repeat the same pattern, but use:

- `Left Branch.True`
- `bWallWest = false`
- `CellIndex` for `Set Array Elem.Index`

---

# Step 2.7.4 — Right Branch True: Open East Wall

---

Repeat the same pattern, but use:

- `Right Branch.True`
- `bWallEast = false`
- `CellIndex` for `Set Array Elem.Index`

---

## What you should see

You should now have four separate save paths:

- Top → Set `bWallNorth = false` → Set Array Elem
- Bottom → Set `bWallSouth = false` → Set Array Elem
- Left → Set `bWallWest = false` → Set Array Elem
- Right → Set `bWallEast = false` → Set Array Elem

Each path writes back to:

`MazeGrid`

Each path uses:

`CellIndex`

---

## Expected result

The selected border cell now has the correct outside wall removed.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.7.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.7.png' | relative_url }}" style="width:100%;" alt="OpenBorderWallAtIndex branch chain with Set Members and Set Array Elem paths for each border wall" class="post-image">
</a>

---

# Step 3 — Create the `CreateEntranceAndExit` Function

---

## What this step does

This function will:

- find all border cells
- randomly choose one entrance
- randomly choose one exit
- make sure they are different
- call `OpenBorderWallAtIndex` for both

---

# Step 3.1 — Create the Function

---

1. In **My Blueprint → Functions**

2. Click:

   `+ Function`

3. Name it:

   `CreateEntranceAndExit`

---

# Step 3.2 — Create Local Variables

---

Create these local variables inside `CreateEntranceAndExit`:

## BorderIndices

- Name: `BorderIndices`
- Type: `Integer`
- Array: Yes

## EntranceIndex

- Name: `EntranceIndex`
- Type: `Integer`
- Array: No

## ExitIndex

- Name: `ExitIndex`
- Type: `Integer`
- Array: No

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-3.2.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-3.2.png' | relative_url }}" style="width:100%;" alt="CreateEntranceAndExit local variables BorderIndices EntranceIndex and ExitIndex" class="post-image">
</a>

---

# Step 3.3 — Loop Through MazeGrid

---

1. Add a:

   `For Loop`

2. Drag `MazeGrid` into the graph as **Get**

3. Drag from `MazeGrid`

4. Search for:

   `Length`

5. Drag from `Length`

6. Search for:

   `Subtract`

7. Set the second value to:

   `1`

8. Connect:

- `0` → `For Loop.First Index`
- `Length - 1` → `For Loop.Last Index`

---

# Step 3.4 — Get and Break the Current Cell

---

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from `MazeGrid`

3. Search for:

   `Get`

4. Click:

   `Get (a copy)`

5. Connect:

- `For Loop.Index` → `Get (a copy).Index`

6. Drag from the output of `Get (a copy)`

7. Search for:

   `Break S_MazeCell`

8. Click:

   `Break S_MazeCell`

---

# Step 3.5 — Check If the Cell Is on the Border

---

Create these four checks:

- `Row == 0`
- `Row == MazeHeight - 1`
- `Col == 0`
- `Col == MazeWidth - 1`

Use the same method you used in `OpenBorderWallAtIndex`.

---

# Step 3.6 — Combine Border Checks with OR Nodes

---

1. Drag from `Row == 0`

2. Add:

   `OR`

3. Connect:

- `Row == 0`
- `Row == MazeHeight - 1`

4. Drag from that OR output

5. Add another:

   `OR`

6. Connect:

- Previous OR output
- `Col == 0`

7. Drag from that OR output

8. Add another:

   `OR`

9. Connect:

- Previous OR output
- `Col == MazeWidth - 1`

---

## Expected result

You now have one final Boolean that is true if the cell is on any border.

---

# Step 3.7 — Add Border Index to BorderIndices

---

1. Drag from the final OR output

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect:

- `For Loop.Loop Body` → `Branch`
- final OR output → `Branch.Condition`

5. Drag `BorderIndices` into the graph as **Get**

6. Drag from it

7. Search for:

   `Add`

8. Click the array `Add` node

9. Connect:

- `Branch.True` → `BorderIndices Add`
- `For Loop.Index` → `BorderIndices Add.Item`

---

## Expected result

Every border cell index is added to `BorderIndices`.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-3.7.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-3.7.png' | relative_url }}" style="width:100%;" alt="For Loop checking border cells and adding valid indexes to BorderIndices" class="post-image">
</a>

---

# Step 3.8 — Select the Entrance Index

---

## Important

This starts from the For Loop `Completed` pin.

Do not use `Loop Body`.

---

1. Drag `BorderIndices` into the graph as **Get**

2. Drag from it

3. Search for:

   `Length`

4. Subtract:

   `1`

5. Drag `RandomStream` into the graph as **Get**

6. Drag from `RandomStream`

7. Search for:

   `Random Integer in Range from Stream`

8. Set:

- Min = `0`
- Max = `BorderIndices Length - 1`

9. Drag from `BorderIndices`

10. Search for:

`Get`

11. Click:

`Get (a copy)`

12. Connect:

- Random Integer output → `BorderIndices Get.Index`

13. Drag `EntranceIndex` into the graph

14. Choose:

`Set`

15. Connect:

- `For Loop.Completed` → `Set EntranceIndex`
- `BorderIndices Get` output → `Set EntranceIndex.Value`

---

## Beginner note

The random number is not the maze cell index.

It is only the position inside `BorderIndices`.

The value coming out of `BorderIndices Get` is the actual maze cell index.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-3.8.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-3.8.png' | relative_url }}" style="width:100%;" alt="For Loop Completed selecting a random EntranceIndex from BorderIndices" class="post-image">
</a>

---

# Step 3.9 — Select the Exit Index

---

1. Use another:

   `Random Integer in Range from Stream`

2. Use:

- Min = `0`
- Max = `BorderIndices Length - 1`

3. Use another `BorderIndices Get (a copy)`

4. Connect:

- Random Integer output → `BorderIndices Get.Index`

5. Drag `ExitIndex` into the graph

6. Choose:

   `Set`

7. Connect:

- `Set EntranceIndex` execution output → `Set ExitIndex`
- `BorderIndices Get` output → `Set ExitIndex.Value`

---

# Step 3.10 — Make Sure ExitIndex Is Different

---

1. Drag `ExitIndex` into the graph as **Get**

2. Drag from it

3. Search for:

   `!=`

4. Click:

   `Not Equal (Integer)`

5. Drag `EntranceIndex` into the graph as **Get**

6. Connect:

- `EntranceIndex` → second input of `Not Equal`

7. Drag from the `Not Equal` output

8. Search for:

   `Branch`

9. Click:

   `Branch`

10. Connect:

- `Set ExitIndex` execution output → `Branch`
- `Not Equal` → `Branch.Condition`

11. Connect:

- `Branch.False` → `Set ExitIndex`

This retries until the exit is different.

12. Leave `Branch.True` unconnected for now.

We will connect it in the next step.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-3.10.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-3.10.png' | relative_url }}" style="width:100%;" alt="ExitIndex selection loop checking ExitIndex is different from EntranceIndex" class="post-image">
</a>

---

# Step 3.11 — Open the Entrance and Exit Walls

---

1. Right-click in empty graph space

2. Search for:

   `OpenBorderWallAtIndex`

3. Click:

   `OpenBorderWallAtIndex`

4. Connect:

- `Branch.True` from Step 3.10 → `OpenBorderWallAtIndex`

5. Connect:

- `EntranceIndex` → `CellIndex`

---

## Step 3.11.1 — Open the exit wall

1. Add another:

   `OpenBorderWallAtIndex`

2. Connect:

- First `OpenBorderWallAtIndex` execution output → second `OpenBorderWallAtIndex`

3. Connect:

- `ExitIndex` → `CellIndex`

---

## Expected result

The entrance and exit cells now have one outside wall removed.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-3.11.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-3.11.png' | relative_url }}" style="width:100%;" alt="CreateEntranceAndExit calling OpenBorderWallAtIndex for EntranceIndex and ExitIndex" class="post-image">
</a>

---

# Step 3.12 — Final Result for `CreateEntranceAndExit`

---

## What you have built

Your `CreateEntranceAndExit` function now:

- finds every border cell
- stores those indexes in `BorderIndices`
- selects a random entrance
- selects a random exit
- makes sure the entrance and exit are different
- opens one outside wall for each

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-3.12.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-3.12.png' | relative_url }}" style="width:100%;" alt="Full CreateEntranceAndExit function overview" class="post-image">
</a>

---

# Step 4 — Final Construction Script Flow

---

## What this step does

This connects everything together in the correct order.

---

# Step 4.1 — Open the Construction Script

---

1. In **My Blueprint**, click:

   `Construction Script`

---

# Step 4.2 — Clear Floor Instances

---

1. Drag `FloorHISM` into the graph as **Get**

2. Drag from it

3. Search for:

   `Clear Instances`

4. Click:

   `Clear Instances`

5. Connect:

- `Construction Script` execution pin → `FloorHISM Clear Instances`

---

# Step 4.3 — Clear Wall Instances

---

1. Drag `WallHISM` into the graph as **Get**

2. Drag from it

3. Search for:

   `Clear Instances`

4. Click:

   `Clear Instances`

5. Connect:

- `FloorHISM Clear Instances` → `WallHISM Clear Instances`

---

# Step 4.4 — Clear MazeGrid

---

1. Drag `MazeGrid` into the graph as \*\*Get`

2. Drag from it

3. Search for:

   `Clear`

4. Click the array `Clear` node

5. Connect:

- `WallHISM Clear Instances` → `MazeGrid Clear`

---

# Step 4.5 — Set RandomStream

---

1. Drag `RandomStream` into the graph as **Set**

2. Add:

   `Make Random Stream`

3. Connect:

- `MazeSeed` → `Make Random Stream.Initial Seed`
- `Make Random Stream` → `Set RandomStream`

4. Connect:

- `MazeGrid Clear` → `Set RandomStream`

---

# Step 4.6 — Call the Functions in Order

---

Add these function calls in this exact order:

1. `InitializeGrid`

2. `GenerateMaze`

3. `CreateEntranceAndExit`

4. `BuildMazeVisuals`

Connect the white execution pins like this:

`Set RandomStream`
→ `InitializeGrid`
→ `GenerateMaze`
→ `CreateEntranceAndExit`
→ `BuildMazeVisuals`

---

## Final Construction Script Order

Your Construction Script should now be:

`Construction Script`
→ `Clear Instances (FloorHISM)`
→ `Clear Instances (WallHISM)`
→ `Clear MazeGrid`
→ `Set RandomStream`
→ `InitializeGrid`
→ `GenerateMaze`
→ `CreateEntranceAndExit`
→ `BuildMazeVisuals`

---

## Why this order matters

`CreateEntranceAndExit` must happen after `GenerateMaze`.

`BuildMazeVisuals` must happen last.

If visuals are built before the entrance and exit are opened, the maze may look fully enclosed.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-4.6.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-4.6.png' | relative_url }}" style="width:100%;" alt="Full Construction Script showing clear initialize generate entrance exit and build visuals order" class="post-image">
</a>

---

# Step 5 — Testing the Maze

---

## Step 5.1 — Place the generator in the level

1. Open your level

2. Drag `BP_MazeGenerator` into the level

3. Select it in the viewport or World Outliner

---

## Step 5.2 — Change maze settings

In the Details panel, try changing:

- `MazeWidth`
- `MazeHeight`
- `MazeSeed`
- `CellSize`

---

## Expected behavior

You should see:

- floors for every cell
- walls around the maze paths
- one entrance
- one exit

Changing `MazeSeed` should create a different maze.

Using the same `MazeSeed` again should recreate the same maze.

---

## Common mistakes

❌ Nothing appears  
✔️ Check that `BuildMazeVisuals` is called in the Construction Script

---

❌ Only floors appear  
✔️ Check that wall booleans are connected to the Branch nodes

---

❌ Walls appear in the wrong place  
✔️ Check wall offsets and rotations

---

❌ Maze keeps getting thicker or duplicated  
✔️ Make sure both HISM components are cleared first

---

❌ Entrance and exit do not appear  
✔️ Make sure `CreateEntranceAndExit` runs before `BuildMazeVisuals`

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-5.2.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-5.2.png' | relative_url }}" style="width:100%;" alt="Generated maze visible in the Unreal Engine level with entrance and exit" class="post-image">
</a>

---

# What You Have Built

At this point, your maze system can:

- generate a complete maze
- use a seed for repeatable layouts
- store maze data in a struct array
- render floors and walls using HISM components
- create an entrance and exit
- update in the editor using the Construction Script

> You now have a complete procedural maze generator in UE5 Blueprints.

---

# Where to Go Next

You can expand this system by:

- spawning the player at the entrance
- placing an exit marker
- adding materials
- generating larger mazes
- adding keys, enemies, locked doors, or puzzles
- turning this into a dungeon generator
