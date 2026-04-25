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
- create an entrance and exit
- fully generate the maze in the editor using the Construction Script

> This is where everything finally comes together.

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

And your Blueprint should already have HISM components for:

- `FloorHISM`
- `WallHISM`

If you do not have `FloorHISM` and `WallHISM` yet, create them before continuing.

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

1. In **My Blueprint**, find the **Functions** section

2. Click:

   `+ Function`

3. Name the new function:

   `BuildMazeVisuals`

---

## Expected result

You should now have a new empty function graph named:

`BuildMazeVisuals`

---

# Step 1.2 — Add a For Loop

---

## What this step does

The For Loop will go through every cell in `MazeGrid`.

Each cell will get:

- one floor tile
- walls where needed

---

## Instructions

### Step 1.2.1 — Create the loop

1. Right-click in empty graph space inside `BuildMazeVisuals`

2. Search for:

   `For Loop`

3. Click:

   `For Loop`

---

### Step 1.2.2 — Get the length of MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Length`

4. Click:

   `Length`

---

### Step 1.2.3 — Subtract 1 from the length

1. Drag from the `Length` return value

2. Search for:

   `-`

3. Choose:

   `Integer - Integer`

4. Set the second value to:

   `1`

---

### Step 1.2.4 — Connect the loop range

Connect:

- `First Index` = `0`
- `Length - 1` → `Last Index`

---

## Connections recap

**Execution flow:**

`BuildMazeVisuals → For Loop`

**Data flow:**

- `MazeGrid → Length`
- `Length - 1 → For Loop.Last Index`

---

## Why this matters

Arrays start counting at `0`.

So if `MazeGrid` has 100 cells, the last valid index is:

`99`

That is why we use:

`Length - 1`

---

## Common mistakes

❌ Setting `Last Index` directly to `Length`  
✔️ Use `Length - 1`

---

❌ Forgetting that arrays start at `0`  
✔️ The first cell is index `0`

---

## Expected result

Your For Loop should now run once for every cell in `MazeGrid`.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-1.2.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.2.png' | relative_url }}" style="width:100%;" alt="For Loop iterating from 0 to MazeGrid Length minus 1" class="post-image">
</a>

---

# Step 1.3 — Get the Current Cell

---

## What this step does

Each time the loop runs, we need to get the current cell from `MazeGrid`.

The loop gives us an `Index`.

We use that index to read the matching cell.

---

## Instructions

### Step 1.3.1 — Get a cell from MazeGrid

1. Drag another `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get`

4. Choose:

   `Get (a copy)`

5. Connect:

- `For Loop.Index` → `Get (a copy).Index`

---

### Step 1.3.2 — Break the maze cell struct

1. Drag from the output pin of `Get (a copy)`

2. Search for:

   `Break S_MazeCell`

3. Click:

   `Break S_MazeCell`

---

## Connections recap

**Execution flow:**

`For Loop.Loop Body`

**Data flow:**

- `For Loop.Index → MazeGrid Get.Index`
- `MazeGrid Get output → Break S_MazeCell`

---

## Why this matters

Breaking the struct gives you access to the current cell’s data:

- `Row`
- `Col`
- `bWallNorth`
- `bWallEast`
- `bWallSouth`
- `bWallWest`

The visual maze is built from those values.

---

## Common mistakes

❌ Right-clicking randomly and adding the wrong Break node  
✔️ Drag from the `Get (a copy)` output pin and search for `Break S_MazeCell`

---

❌ Forgetting to connect the For Loop index  
✔️ `For Loop.Index` must connect to `Get (a copy).Index`

---

## Expected result

You should now be able to see the current cell’s row, column, and wall booleans.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-1.3.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.3.png' | relative_url }}" style="width:100%;" alt="MazeGrid Get a copy connected to Break S_MazeCell" class="post-image">
</a>

---

# Step 1.4 — Calculate the Cell World Location

---

## What this step does

Maze cells are stored as grid positions.

For example:

- Row `0`, Col `0`
- Row `0`, Col `1`
- Row `1`, Col `0`

But meshes need world positions.

So we convert the grid position into a world location.

---

## Instructions

### Step 1.4.1 — Calculate X location

1. From `Break S_MazeCell`, locate:

   `Col`

2. Drag from `Col`

3. Search for:

   `*`

4. Click:

   `Multiply`

   (This automatically connects `Col` to the first input)

---

5. Now we need to connect `CellSize`:

6. Drag `CellSize` into the graph as **Get**

7. Drag from the `CellSize` pin

8. Connect it to the empty input pin on the `Multiply` node

---

## What you should see

The `Multiply` node should now have:

- one input connected to `Col`
- one input connected to `CellSize`

---

## Why this matters

This calculation:

`Col × CellSize`

converts the grid column into a world X position.

## Each step in the grid is spaced out by `CellSize`, so this places the cell in the correct horizontal position.

### Step 1.4.2 — Calculate Y location

1. From `Break S_MazeCell`, locate:

   `Row`

2. Drag from `Row`

3. Search for:

   `*`

4. Click:

   `Multiply`

   (This automatically connects `Row` to the first input)

---

5. Now we need to connect `CellSize`:

6. Drag `CellSize` into the graph as **Get**

7. Find your last `CellSize` you just dragged in.

8. Connect it to the empty input pin on the `Multiply` node

---

## What you should see

The `Multiply` node should now have:

- one input connected to `Row`
- one input connected to `CellSize`

---

## Why this matters

This calculation:

`Row × CellSize`

converts the grid row into a world Y position.

Each step in the grid is spaced by `CellSize`, so this places the cell in the correct vertical position.

---

### Step 1.4.3 — Make the location vector

1. Right-click in empty graph space

2. Search for:

   `Make Vector`

3. Click:

   `Make Vector`

4. Connect:

- `Col * CellSize` → `X`
- `Row * CellSize` → `Y`
- `0` → `Z`

---

## Connections recap

**Data flow:**

- `Break S_MazeCell.Col * CellSize → Make Vector.X`
- `Break S_MazeCell.Row * CellSize → Make Vector.Y`
- `0 → Make Vector.Z`

---

## Why this matters

This vector is the center point of the current cell in the world.

The floor tile will be placed here.

The walls will also use this location, plus small offsets.

---

## Common mistakes

❌ Using `Row` for X and `Col` for Y  
✔️ Use:

- `Col` for X
- `Row` for Y

---

❌ Leaving Z empty  
✔️ Set Z to `0`

---

## Expected result

You should now have a world location for the current maze cell.

---

**Note:** I switched the wires on Col and CellSize to keep the wires from crossing in the screenshot

<a href="{{ '/assets/images/blog/Part3-Step-1.4.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.4.png' | relative_url }}" style="width:100%;" alt="Make Vector using Col times CellSize and Row times CellSize" class="post-image">
</a>

---

# Step 1.5 — Add the Floor Mesh

---

## What this step does

Every maze cell needs a floor.

This step adds one floor instance at the cell’s world location.

---

## Instructions

### Step 1.5.1 — Get FloorHISM

1. Drag `FloorHISM` into the graph

2. Choose:

   `Get`

---

### Step 1.5.2 — Add an instance

1. Drag from the `FloorHISM` pin

2. Search for:

   `Add Instance`

3. Click:

   `Add Instance`

4. Connect:

- `For Loop.Loop Body` → `Add Instance` execution input

---

### Step 1.5.3 — Make the floor transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect your cell location vector to:

   `Make Transform.Location`

---

### Step — Connect the cell location to the transform

1.  Find the `Make Transform` node you just created

2.  Find the `Location` pin on the `Make Transform` node  
    (this is the top input pin labeled “Location”)

3.  Now find your **cell location vector**

This is the `Make Vector` node you created earlier in Step 1.4  
 (the one using `Col * CellSize` and `Row * CellSize`)

4.  Drag from the **output pin** of that `Make Vector` node

5.  Connect it to:

    `Make Transform → Location`

---

5. Set Rotation to:

- X = `0`
- Y = `0`
- Z = `0`

6. Set Scale to:

- X = `1`
- Y = `1`
- Z = `1`

7. Connect:

- `Make Transform` → `Add Instance.Instance Transform`

---

## Connections recap

**Execution flow:**

`For Loop.Loop Body → FloorHISM Add Instance`

**Data flow:**

- `Cell Location Make Vector → Make Transform.Location`
- `Make Transform → FloorHISM Add Instance.Instance Transform`

---

## Why this matters

This gives every cell a visible floor tile.

Without this step, you may only see walls, or you may see nothing useful at all.

---

## Common mistakes

❌ Adding only one floor tile outside the loop  
✔️ The floor Add Instance node must run inside the For Loop

---

❌ Forgetting to connect the transform  
✔️ `Make Transform` must connect to `Instance Transform`

---

## Expected result

When the function runs, every cell in the maze should receive a floor mesh.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.5.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.5.png' | relative_url }}" style="width:100%;" alt="FloorHISM Add Instance with Make Transform connected" class="post-image">
</a>

---

# Step 1.6 — Add Walls Based on Cell Data

---

## What this step does

Each maze cell has four wall booleans:

- `bWallNorth`
- `bWallEast`
- `bWallSouth`
- `bWallWest`

If a wall boolean is true, we add a wall mesh.

If it is false, we do not add that wall.

---

## Important concept

The floor was placed at the center of the cell.

Walls need to be placed around the edges of the cell.

So each wall uses this pattern:

`Cell Location + Wall Offset = Final Wall Location`

Then that final wall location goes into:

`Make Transform → WallHISM Add Instance`

---

# Step 1.6.1 — Add the North Wall

---

## What this step does

The north wall is placed on the north edge of the cell.

It uses:

- `bWallNorth`
- Y offset = `-CellSize / 2`
- Z offset = `CellSize / 2`
- Rotation Z = `0`

---

## Instructions

### Step 1.6.1.1 — Add a Branch for the north wall

1. From `Break S_MazeCell`, find:

   `bWallNorth`

2. Drag from `bWallNorth`

3. Search for:

   `Branch`

4. Click:

   `Branch`

5. Connect:

- `FloorHISM Add Instance` execution output → `Branch` execution input
- `bWallNorth` → `Branch.Condition`

---

### Step 1.6.1.2 — Create the north wall offset

We are creating this offset:

- X = `0`
- Y = `-CellSize / 2`
- Z = `CellSize / 2`

---

#### Step A — Create the offset Make Vector node

1. Right-click in empty graph space

2. Search for:

   `Make Vector`

3. Click:

   `Make Vector`

4. Set:

- X = `0`

---

#### Step B — Create `CellSize / 2`

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Click:

   `Divide`

5. Set the second value to:

   `2`

This gives you:

`CellSize / 2`

---

#### Step C — Connect Z

1. Drag from the output of the `Divide` node

2. Connect it to:

   `Make Vector → Z`

---

#### Step D — Create the negative Y value

1. Drag from the output of the `Divide` node again

2. Search for:

   `Multiply`

3. Click:

   `Multiply`

4. Set the second value to:

   `-1`

This gives you:

`-CellSize / 2`

---

#### Step E — Connect Y

1. Drag from the output of the `Multiply` node

2. Connect it to:

   `Make Vector → Y`

---

## What you should see

Your north wall offset `Make Vector` should have:

- X = `0`
- Y = `(CellSize / 2) * -1`
- Z = `CellSize / 2`

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-1.6.1.2.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.6.1.2.png' | relative_url }}" style="width:100%;" alt="North wall offset vector using CellSize divided by 2 for Y and Z" class="post-image">
</a>

---

### Step 1.6.1.3 — Add the offset to the cell location

In Step 1.4, you created a `Make Vector` node for the cell location.

That node used:

- `Col * CellSize` → X
- `Row * CellSize` → Y
- `0` → Z

Now we will add the north wall offset to that cell location.

---

#### Step A — Create the Add node

1. Find your original cell location `Make Vector` node from Step 1.4

2. Drag from the output pin of that `Make Vector` node

3. Search for:

   `+`

4. Click:

   `Add`

Unreal will create a vector Add node.

---

#### Step B — Connect the north wall offset

1. Find the north wall offset `Make Vector` node you created in Step 1.6.1.2

2. Drag from its output pin

3. Connect it to the empty input pin on the `Add` node

---

## What you should see

Your `Add` node should now have:

- first input → cell location vector
- second input → north wall offset vector

The output of this `Add` node is the final north wall location.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-1.6.1.3.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.6.1.3.png' | relative_url }}" style="width:100%;" alt="North wall offset vector added to the cell location vector" class="post-image">
</a>

---

### Step 1.6.1.4 — Create the north wall transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Drag from the output pin of the `Add` node  
   from Step 1.6.1.3

5. Connect it to:

   `Make Transform → Location`

6. Set Rotation to:

- X = `0`
- Y = `0`
- Z = `0`

7. Set Scale to:

- X = `1`
- Y = `1`
- Z = `1`

---

### Step 1.6.1.5 — Add the north wall instance

1. Drag `WallHISM` into the graph as **Get**

2. Drag from `WallHISM`

3. Search for:

   `Add Instance`

4. Click:

   `Add Instance`

5. Connect:

- `Branch.True` → `WallHISM Add Instance`

6. Connect:

- North wall `Make Transform` → `Add Instance.Instance Transform`

---

## Connections recap

**Execution flow:**

`FloorHISM Add Instance → bWallNorth Branch`

`bWallNorth Branch.True → WallHISM Add Instance`

**Data flow:**

- `bWallNorth → Branch.Condition`
- `Cell Location + North Offset → North Wall Make Transform.Location`
- `North Wall Make Transform → WallHISM Add Instance.Instance Transform`

---

## Expected result

A north wall is added only when `bWallNorth` is true.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-1.6.1.5.png' | relative_url }}"style="flex:1;">
<img src="{{ '/assets/images/blog/Part3-Step-1.6.1.5.png' | relative_url }}" style="width:100%;" alt="Complete north wall setup with branch offset transform and WallHISM Add Instance" class="post-image">
</a>

---

# Step 1.6.2 — Add the East Wall

---

## What this step does

The east wall is placed on the east edge of the cell.

It uses:

- `bWallEast`
- X offset = `CellSize / 2`
- Z offset = `CellSize / 2`
- Rotation Z = `90`

---

## Instructions

### Step 1.6.2.1 — Add a Branch for the east wall

1. From `Break S_MazeCell`, find:

   `bWallEast`

2. Drag from `bWallEast`

3. Search for:

   `Branch`

4. Click:

   `Branch`

5. Connect the execution flow into this Branch.

For now, connect:

- `North Wall Add Instance` execution output → `bWallEast Branch`

Later, we will clean up the false path so the east wall check still runs even if there is no north wall.

6. Connect:

- `bWallEast` → `Branch.Condition`

---

### Step 1.6.2.2 — Create the east wall offset

We are creating this offset:

- X = `CellSize / 2`
- Y = `0`
- Z = `CellSize / 2`

---

#### Step A — Create the offset Make Vector node

1. Right-click in empty graph space

2. Search for:

   `Make Vector`

3. Click:

   `Make Vector`

4. Set:

- Y = `0`

---

#### Step B — Create `CellSize / 2`

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Click:

   `Divide`

5. Set the second value to:

   `2`

---

#### Step C — Connect X and Z

1. Drag from the output of the `Divide` node

2. Connect it to:

   `Make Vector → X`

3. Drag from the output of the same `Divide` node again

4. Connect it to:

   `Make Vector → Z`

---

### Step 1.6.2.3 — Add the offset to the cell location

1. Find your original cell location `Make Vector` node from Step 1.4

2. Drag from its output pin

3. Search for:

   `+`

4. Click:

   `Add`

5. Find the east wall offset `Make Vector`

6. Drag from its output pin

7. Connect it to the empty input pin on the `Add` node

---

### Step 1.6.2.4 — Create the east wall transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect:

- East wall final location Add node → `Make Transform.Location`

5. Set Rotation to:

- X = `0`
- Y = `0`
- Z = `90`

6. Set Scale to:

- X = `1`
- Y = `1`
- Z = `1`

---

### Step 1.6.2.5 — Add the east wall instance

1. Drag `WallHISM` into the graph as **Get**

2. Drag from `WallHISM`

3. Search for:

   `Add Instance`

4. Click:

   `Add Instance`

5. Connect:

- `bWallEast Branch.True` → `WallHISM Add Instance`

6. Connect:

- East wall `Make Transform` → `Add Instance.Instance Transform`

---

<a href="{{ '/assets/images/blog/Part3-Step-1.6.2.5.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.6.2.5.png' | relative_url }}" style="width:100%;" alt="Complete east wall setup with branch offset transform and WallHISM Add Instance" class="post-image">
</a>

---

## Expected result

An east wall is added only when `bWallEast` is true.

---

# Step 1.6.3 — Add the South Wall

---

## What this step does

The south wall is placed on the south edge of the cell.

It uses:

- `bWallSouth`
- Y offset = `CellSize / 2`
- Z offset = `CellSize / 2`
- Rotation Z = `180`

---

## Instructions

### Step 1.6.3.1 — Add a Branch for the south wall

1. From `Break S_MazeCell`, find:

   `bWallSouth`

2. Drag from `bWallSouth`

3. Search for:

   `Branch`

4. Click:

   `Branch`

5. Connect the execution flow into this Branch.

For now, connect:

- `East Wall Add Instance` execution output → `bWallSouth Branch`

Later, we will clean up the false path so the south wall check still runs even if there is no east wall.

6. Connect:

- `bWallSouth` → `Branch.Condition`

---

### Step 1.6.3.2 — Create the south wall offset

We are creating this offset:

- X = `0`
- Y = `CellSize / 2`
- Z = `CellSize / 2`

---

#### Step A — Create the offset Make Vector node

1. Right-click in empty graph space

2. Search for:

   `Make Vector`

3. Click:

   `Make Vector`

4. Set:

- X = `0`

---

#### Step B — Create `CellSize / 2`

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Click:

   `Divide`

5. Set the second value to:

   `2`

---

#### Step C — Connect Y and Z

1. Drag from the output of the `Divide` node

2. Connect it to:

   `Make Vector → Y`

3. Drag from the output of the same `Divide` node again

4. Connect it to:

   `Make Vector → Z`

---

### Step 1.6.3.3 — Add the offset to the cell location

1. Find your original cell location `Make Vector` node from Step 1.4

2. Drag from its output pin

3. Search for:

   `+`

4. Click:

   `Add`

5. Find the south wall offset `Make Vector`

6. Drag from its output pin

7. Connect it to the empty input pin on the `Add` node

---

### Step 1.6.3.4 — Create the south wall transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect:

- South wall final location Add node → `Make Transform.Location`

5. Set Rotation to:

- X = `0`
- Y = `0`
- Z = `180`

6. Set Scale to:

- X = `1`
- Y = `1`
- Z = `1`

---

### Step 1.6.3.5 — Add the south wall instance

1. Drag `WallHISM` into the graph as **Get**

2. Drag from `WallHISM`

3. Search for:

   `Add Instance`

4. Click:

   `Add Instance`

5. Connect:

- `bWallSouth Branch.True` → `WallHISM Add Instance`

6. Connect:

- South wall `Make Transform` → `Add Instance.Instance Transform`

---

## Expected result

A south wall is added only when `bWallSouth` is true.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.6.3.5.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.6.3.5.png' | relative_url }}" style="width:100%;" alt="Complete south wall setup with branch offset transform and WallHISM Add Instance" class="post-image">
</a>

---

# Step 1.6.4 — Add the West Wall

---

## What this step does

The west wall is placed on the west edge of the cell.

It uses:

- `bWallWest`
- X offset = `-CellSize / 2`
- Z offset = `CellSize / 2`
- Rotation Z = `-90`

---

## Instructions

### Step 1.6.4.1 — Add a Branch for the west wall

1. From `Break S_MazeCell`, find:

   `bWallWest`

2. Drag from `bWallWest`

3. Search for:

   `Branch`

4. Click:

   `Branch`

5. Connect the execution flow into this Branch.

For now, connect:

- `South Wall Add Instance` execution output → `bWallWest Branch`

Later, we will clean up the false path so the west wall check still runs even if there is no south wall.

6. Connect:

- `bWallWest` → `Branch.Condition`

---

### Step 1.6.4.2 — Create the west wall offset

We are creating this offset:

- X = `-CellSize / 2`
- Y = `0`
- Z = `CellSize / 2`

---

#### Step A — Create the offset Make Vector node

1. Right-click in empty graph space

2. Search for:

   `Make Vector`

3. Click:

   `Make Vector`

4. Set:

- Y = `0`

---

#### Step B — Create `CellSize / 2`

1. Drag `CellSize` into the graph as **Get**

2. Drag from the `CellSize` pin

3. Search for:

   `/`

4. Click:

   `Divide`

5. Set the second value to:

   `2`

---

#### Step C — Connect Z

1. Drag from the output of the `Divide` node

2. Connect it to:

   `Make Vector → Z`

---

#### Step D — Create the negative X value

1. Drag from the output of the `Divide` node again

2. Search for:

   `Multiply`

3. Click:

   `Multiply`

4. Set the second value to:

   `-1`

This gives you:

`-CellSize / 2`

---

#### Step E — Connect X

1. Drag from the output of the `Multiply` node

2. Connect it to:

   `Make Vector → X`

---

### Step 1.6.4.3 — Add the offset to the cell location

1. Find your original cell location `Make Vector` node from Step 1.4

2. Drag from its output pin

3. Search for:

   `+`

4. Click:

   `Add`

5. Find the west wall offset `Make Vector`

6. Drag from its output pin

7. Connect it to the empty input pin on the `Add` node

---

### Step 1.6.4.4 — Create the west wall transform

1. Right-click in empty graph space

2. Search for:

   `Make Transform`

3. Click:

   `Make Transform`

4. Connect:

- West wall final location Add node → `Make Transform.Location`

5. Set Rotation to:

- X = `0`
- Y = `0`
- Z = `-90`

6. Set Scale to:

- X = `1`
- Y = `1`
- Z = `1`

---

### Step 1.6.4.5 — Add the west wall instance

1. Drag `WallHISM` into the graph as **Get**

2. Drag from `WallHISM`

3. Search for:

   `Add Instance`

4. Click:

   `Add Instance`

5. Connect:

- `bWallWest Branch.True` → `WallHISM Add Instance`

6. Connect:

- West wall `Make Transform` → `Add Instance.Instance Transform`

---

<a href="{{ '/assets/images/blog/Part3-Step-1.6.4.5.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.6.4.5.png' | relative_url }}" style="width:100%;" alt="Complete west wall setup with branch offset transform and WallHISM Add Instance" class="post-image">
</a>

---

## Expected result

A west wall is added only when `bWallWest` is true.

---

# Step 1.6.5 — Fix the Wall Execution Flow

---

## What this step does

This is important.

Each wall check must continue to the next wall check whether the wall exists or not.

If you only connect the `True` pins, the function may stop checking walls whenever one wall boolean is false.

---

## Correct wall check order

The execution should check walls in this order:

`North → East → South → West`

---

## Beginner-friendly setup

For each wall Branch:

- `True` means: add the wall, then continue
- `False` means: skip adding the wall, then continue

That means both paths need to eventually reach the next wall Branch.

---

## How to connect North to East

1. Find the `bWallNorth` Branch

2. Find the `bWallEast` Branch

3. Connect:

- `bWallNorth Branch.False` → `bWallEast Branch`

4. Connect:

- `North Wall Add Instance` execution output → `bWallEast Branch`

Now the east wall check runs whether the north wall was added or skipped.

---

## How to connect East to South

1. Find the `bWallEast` Branch

2. Find the `bWallSouth` Branch

3. Connect:

- `bWallEast Branch.False` → `bWallSouth Branch`

4. Connect:

- `East Wall Add Instance` execution output → `bWallSouth Branch`

Now the south wall check runs whether the east wall was added or skipped.

---

## How to connect South to West

1. Find the `bWallSouth` Branch

2. Find the `bWallWest` Branch

3. Connect:

- `bWallSouth Branch.False` → `bWallWest Branch`

4. Connect:

- `South Wall Add Instance` execution output → `bWallWest Branch`

Now the west wall check runs whether the south wall was added or skipped.

---

## What about West?

West is the last wall check.

So after west:

- if `bWallWest` is true, add the wall
- if `bWallWest` is false, the loop simply moves on to the next cell

---

## Common mistakes

❌ Only connecting the True pins  
✔️ Connect both paths so the next wall check always happens

---

❌ Letting execution stop after a false Branch  
✔️ The False pin should go to the next wall Branch

---

❌ Letting execution stop after Add Instance  
✔️ The Add Instance output should also go to the next wall Branch

---

## Expected result

For every cell, Unreal checks:

- north wall
- east wall
- south wall
- west wall

Even if one wall is missing, the remaining walls are still checked.

---

# Step 1.6.6 — Final Result for Wall Placement

---

## What you have built

Your wall system now:

- checks each wall boolean
- creates a wall offset
- adds that offset to the cell location
- creates a wall transform
- adds a wall instance
- continues checking the remaining walls

---

## Expected result

Each maze cell now places only the walls that still exist.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-1.6-AllWalls.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-1.6-AllWalls.png' | relative_url }}" style="width:100%;" alt="Complete wall placement setup for north east south and west walls" class="post-image">
</a>

---

# Step 1.7 — Finish the Wall Execution Flow

---

## What this step does

Each wall check needs to continue into the next wall check.

This makes sure the function checks all four walls for every cell.

---

## Instructions

Connect the wall checks in this order:

`Floor Add Instance`
→ `North Wall Branch`
→ `East Wall Branch`
→ `South Wall Branch`
→ `West Wall Branch`

Each Branch has:

- a `True` path that adds the wall
- a path that continues to the next wall check

---

## Beginner note

Blueprint Branch nodes do not automatically continue after the `True` path.

If you add a wall from the `True` pin, you still need to make sure the execution continues to the next wall check afterward.

A common beginner-friendly way to handle this is:

1. Check north wall
2. If true, add north wall
3. Continue to east wall check
4. If true, add east wall
5. Continue to south wall check
6. If true, add south wall
7. Continue to west wall check

---

## Common mistakes

❌ Only connecting the True pins  
✔️ Make sure every wall check can continue to the next wall check

---

❌ Letting the execution stop after the first wall  
✔️ The function must check all four walls for every cell

---

## Expected result

For each cell, the function checks all four wall booleans and adds the needed wall instances.

---

# Step 1.8 — Final Result for `BuildMazeVisuals`

---

## What you have built

Your `BuildMazeVisuals` function now:

- loops through every cell in `MazeGrid`
- calculates the world location of each cell
- adds a floor tile for each cell
- checks each wall boolean
- adds wall meshes where walls still exist

---

## Expected result

When this function runs, the maze should become visible.

---

# Step 2 — Create Entrance and Exit

---

## What this step does

This step opens two outside walls:

- one entrance
- one exit

Both openings will be placed on the outer border of the maze.

---

## Important note

This function changes maze data.

That means it must run:

after:

`GenerateMaze`

but before:

`BuildMazeVisuals`

If you build the visuals first, the walls will already be placed.

---

# Step 2.1 — Create the `CreateEntranceAndExit` Function

---

## Instructions

### Step 2.1.1 — Add the function

1. In **My Blueprint → Functions**

2. Click:

   `+ Function`

3. Name the function:

   `CreateEntranceAndExit`

---

## Expected result

You should now have a new empty function called:

`CreateEntranceAndExit`

---

# Step 2.2 — Create a Local Border Index Array

---

## What this step does

We need a list of all cells that are on the outside edge of the maze.

This local array will store those cell indexes.

---

## Instructions

### Step 2.2.1 — Create the local variable

1. Inside `CreateEntranceAndExit`, find the **Local Variables** section

2. Click:

   `+ Local Variable`

3. Name it:

   `BorderIndices`

4. Set the type to:

   `Integer`

5. Change it to an array by clicking the array icon

---

## Expected result

You should now have a local Integer Array named:

`BorderIndices`

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.2.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.2.png' | relative_url }}" style="width:100%;" alt="BorderIndices local integer array created" class="post-image">
</a>

---

# Step 2.3 — Loop Through MazeGrid

---

## What this step does

This loop checks every maze cell.

If a cell is on the border, we add its index to `BorderIndices`.

---

## Instructions

### Step 2.3.1 — Add a For Loop

1. Right-click in empty graph space

2. Search for:

   `For Loop`

3. Click:

   `For Loop`

---

### Step 2.3.2 — Set the loop range

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Length`

4. Click:

   `Length`

---

## Step A — Subtract 1 from the length

5. Drag from the output pin of the `Length` node

6. Search for:

   `-`

7. Click:

   `Subtract`

   (This creates an Integer - Integer node)

8. In the second input box, type:

   `1`

---

## Step B — Connect the For Loop range

9. Set:

- `First Index` = `0` (type 0 directly into the First Index field)

10. Connect:

- Output of the `Subtract` node → `For Loop.Last Index`

---

## What you should see

- `MazeGrid → Length`
- `Length → Subtract`
- `Subtract (Length - 1) → For Loop.Last Index`

---

## Why this matters

Arrays start at index `0`.

So if your array has 10 elements:

- First index = `0`
- Last index = `9`

That’s why we use:

`Length - 1`

---

## Common mistakes

❌ Connecting `Length` directly to Last Index  
✔️ Always subtract 1

---

❌ Forgetting to type `1` into the Subtract node  
✔️ The second input must be `1`

---

## Expected result

Your For Loop will now correctly loop through every element in `MazeGrid` without going out of bounds.

---

## Connections recap

**Execution flow:**

`CreateEntranceAndExit → For Loop`

**Data flow:**

- `MazeGrid → Length`
- `Length - 1 → For Loop.Last Index`

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.3.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.3.png' | relative_url }}" style="width:100%;" alt="CreateEntranceAndExit For Loop through MazeGrid" class="post-image">
</a>

---

# Step 2.4 — Get and Break the Current Cell

---

## What this step does

For each loop index, we need to read the cell and check its row and column.

---

## Instructions

### Step 2.4.1 — Get the cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from `MazeGrid`

3. Search for:

   `Get`

4. Choose:

   `Get (a copy)`

5. Connect:

- `For Loop.Index` → `Get (a copy).Index`

---

### Step 2.4.2 — Break the cell

1. Drag from the output of `Get (a copy)`

2. Search for:

   `Break S_MazeCell`

3. Click:

   `Break S_MazeCell`

---

## Expected result

You now have access to:

- `Row`
- `Col`

for the current cell.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.4.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.4.png' | relative_url }}" style="width:100%;" alt="MazeGrid current cell broken inside CreateEntranceAndExit" class="post-image">
</a>

---

# Step 2.5 — Check If the Cell Is on the Border

---

## What this step does

A cell is on the border if any of these are true:

- `Row == 0`
- `Row == MazeHeight - 1`
- `Col == 0`
- `Col == MazeWidth - 1`

---

## Instructions

### Step 2.5.1 — Check top border

1. Drag from `Row`

2. Search for:

   `==`

3. Choose:

   `Equal Equal`

4. Set the second value to:

   `0`

This checks:

`Row == 0`

---

### Step 2.5.2 — Check bottom border

We want to check:

`Row == MazeHeight - 1`

This means: “Is this cell on the last row?”

---

## Step A — Get MazeHeight

1. Drag `MazeHeight` into the graph as **Get**

---

## Step B — Subtract 1 from MazeHeight

2. Drag from the `MazeHeight` pin

3. Search for:

   `-`

4. Click:

   `Subtract`

   (This creates a node that subtracts one value from another)

5. In the second input box on the Subtract node, type:

   `1`

Now you have:

`MazeHeight - 1`

---

## Step C — Compare Row to MazeHeight - 1

6. From `Break S_MazeCell`, find:

   `Row`

7. Drag from the `Row` pin

8. Search for:

   `==`

9. Click:

   `Equal (Integer)`

---

## Step D — Connect the comparison

10. Connect:

- `Row` → first input of the Equal node
- Output of the `Subtract` node (`MazeHeight - 1`) → second input

---

## What you should see

- `MazeHeight → Subtract (1)`
- `Row → Equal`
- `Subtract output → Equal`

This forms:

`Row == MazeHeight - 1`

---

## Why this matters

- `Row == 0` → top edge
- `Row == MazeHeight - 1` → bottom edge

So this condition checks if the cell is on the **bottom border** of the maze.

---

## Common mistakes

❌ Comparing `Row == MazeHeight`  
✔️ Must use `MazeHeight - 1`

---

❌ Forgetting to subtract 1  
✔️ Arrays start at 0, so the last row is one less than the height

---

## Expected result

## This node returns **true** only when the current cell is on the bottom edge of the maze.

### Step 2.5.3 — Check left border

1. Drag from `Col`

2. Search for:

   `==`

3. Set the second value to:

   `0`

This checks:

`Col == 0`

---

### Step 2.5.4 — Check right border

We want to check:

`Col == MazeWidth - 1`

This means: “Is this cell on the last column (right edge)?”

---

## Step A — Get MazeWidth

1. Drag `MazeWidth` into the graph as **Get**

---

## Step B — Subtract 1 from MazeWidth

2. Drag from the `MazeWidth` pin

3. Search for:

   `-`

4. Click:

   `Subtract`

   (This creates an Integer - Integer node)

5. In the second input box on the Subtract node, type:

   `1`

Now you have:

`MazeWidth - 1`

---

## Step C — Compare Col to MazeWidth - 1

6. From `Break S_MazeCell`, find:

   `Col`

7. Drag from the `Col` pin

8. Search for:

   `==`

9. Click:

   `Equal (Integer)`

---

## Step D — Connect the comparison

10. Connect:

- `Col` → first input of the Equal node
- Output of the `Subtract` node (`MazeWidth - 1`) → second input

---

## What you should see

- `MazeWidth → Subtract (1)`
- `Col → Equal`
- `Subtract output → Equal`

This forms:

`Col == MazeWidth - 1`

---

## Why this matters

- `Col == 0` → left edge
- `Col == MazeWidth - 1` → right edge

So this condition checks if the cell is on the **right border** of the maze.

---

## Common mistakes

❌ Comparing `Col == MazeWidth`  
✔️ Must use `MazeWidth - 1`

---

❌ Forgetting to subtract 1  
✔️ The last column index is one less than the total width

---

## Expected result

This node returns **true** only when the current cell is on the right edge of the maze.

---

### Step 2.5.5 — Combine the checks with OR nodes

We now have four separate True/False results:

- `Row == 0` (top border)
- `Row == MazeHeight - 1` (bottom border)
- `Col == 0` (left border)
- `Col == MazeWidth - 1` (right border)

We need to combine them into one final True/False result using OR nodes.

---

## Step A — Create the first OR node

1. Drag from the output pin of one of your comparison nodes  
   (for example: `Row == 0`)

2. Search for:

   `OR`

3. Click:

   `OR (Boolean)`

---

## Step B — Connect the first two conditions

4. Connect:

- `Row == 0` → first input
- `Row == MazeHeight - 1` → second input

This gives:

`Top OR Bottom`

---

## Step C — Add a second OR node

5. Drag from the output pin of the first OR node

6. Search for:

   `OR`

7. Click:

   `OR (Boolean)`

---

## Step D — Add the third condition

8. Connect:

- Output of first OR → first input
- `Col == 0` → second input

This gives:

`(Top OR Bottom) OR Left`

---

## Step E — Add a third OR node

9. Drag from the output pin of the second OR node

10. Search for:

`OR`

11. Click:

`OR (Boolean)`

---

## Step F — Add the final condition

12. Connect:

- Output of second OR → first input
- `Col == MazeWidth - 1` → second input

This gives:

`(Top OR Bottom OR Left) OR Right`

---

<a href="{{ '/assets/images/blog/Part3-Step-2.5.5.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.5.5.png' | relative_url }}" style="width:100%;" alt="Checking to see if the cell is on one of the edges" class="post-image">
</a>

---

## What you should see

You should now have a chain of OR nodes combining all four checks.

The final output is a single Boolean value.

---

## Final meaning

This final result is TRUE if:

- the cell is on the top edge  
  OR
- the bottom edge  
  OR
- the left edge  
  OR
- the right edge

---

## Why this matters

We only want to select cells that are on the outside of the maze.

This combined condition identifies all border cells.

---

## Common mistakes

❌ Trying to connect all four conditions into one OR node  
✔️ Use multiple OR nodes chained together

---

❌ Leaving one condition unconnected  
✔️ Make sure all four comparisons are included

---

❌ Mixing up AND and OR  
✔️ Use OR — only one condition needs to be true

---

## Expected result

You now have a single Boolean output that is TRUE for any border cell.

---

### Step 2.5.6 — Add a Branch

1. Drag from the final OR result

2. Search for:

   `Branch`

3. Click:

   `Branch`

4. Connect:

- `For Loop.Loop Body` → `Branch`
- Final OR result → `Branch.Condition`

---

## Connections recap

**Execution flow:**

`For Loop.Loop Body → Branch`

**Data flow:**

- `Row == 0`
- `Row == MazeHeight - 1`
- `Col == 0`
- `Col == MazeWidth - 1`
- all four checks combined with OR
- final OR result → `Branch.Condition`

---

## Why this matters

Only border cells can be used as entrance or exit locations.

A cell in the middle of the maze should not open to the outside.

---

## Common mistakes

❌ Using AND instead of OR  
✔️ Use OR, because only one border condition needs to be true

---

❌ Forgetting to subtract 1 from MazeWidth or MazeHeight  
✔️ The last row is `MazeHeight - 1` and the last column is `MazeWidth - 1`

---

## Expected result

The Branch returns true only when the current cell is on the outside edge of the maze.

---

# Step 2.6 — Add Border Cells to the BorderIndices Array

---

## What this step does

If the current cell is on the border, we store its index.

---

## Instructions

### Step 2.6.1 — Add the index

1. Drag `BorderIndices` into the graph

2. Choose:

   `Get`

3. Drag from `BorderIndices`

4. Search for:

   `Add`

5. Choose the array Add node

6. Connect:

- `Branch.True` → `Add` execution input
- `For Loop.Index` → `Add.Item`

---

## Connections recap

**Execution flow:**

`Branch.True → BorderIndices Add`

**Data flow:**

- `For Loop.Index → BorderIndices Add.Item`

---

## Why this matters

At the end of the loop, `BorderIndices` contains only cells that touch the outside of the maze.

---

## Expected result

Every border cell index is added to `BorderIndices`.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.6.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.6.png' | relative_url }}" style="width:100%;" alt="Adding border cell indexes to BorderIndices array" class="post-image">
</a>

---

# Step 2.7 — Select a Random Entrance Index

---

## What this step does

After the loop finishes, we choose one random border cell to become the entrance.

---

## Instructions

### Step 2.7.1 — Use the Completed pin

1. Find the `Completed` pin on the For Loop

2. This is where the next part starts

Do not use the `Loop Body` pin for this step.

---

### Step 2.7.2 — Get BorderIndices length

We need the size of the `BorderIndices` array, then subtract 1 so we get the highest valid index.

---

## Step A — Get the array length

1. Drag `BorderIndices` into the graph as **Get**

2. Drag from the `BorderIndices` pin

3. Search for:

   `Length`

4. Click:

   `Length`

---

## Step B — Subtract 1 from the length

5. Drag from the output pin of the `Length` node

6. Search for:

   `-`

7. Click:

   `Subtract`

   (This creates an Integer - Integer node)

8. In the second input box, type:

   `1`

Now you have:

`BorderIndices Length - 1`

---

## What you should see

- `BorderIndices → Length`
- `Length → Subtract`
- `Subtract (Length - 1)` output

---

## Why this matters

Arrays start at index `0`.

So if your array has 5 items:

- First index = `0`
- Last index = `4`

That’s why we use:

`Length - 1`

---

## Common mistakes

❌ Using `Length` directly  
✔️ Always subtract 1 for the last index

---

❌ Forgetting to type `1` into the Subtract node  
✔️ The second input must be `1`

---

## Expected result

You now have the **maximum valid index** you can safely use when picking a random value from `BorderIndices`.

---

### Step 2.7.3 — Get random integer in range from stream

We are going to generate a random number between:

`0` and `BorderIndices Length - 1`

---

## Step A — Add the Random node

1. Drag `RandomStream` into the graph as **Get**

2. Drag from the `RandomStream` pin

3. Search for:

   `Random Integer in Range from Stream`

4. Click:

   `Random Integer in Range from Stream`

---

## Step B — Set the minimum value

5. Click in the **Min** field on the node

6. Type:

   `0`

---

## Step C — Connect the maximum value

We already created this value in the previous step:

`BorderIndices Length - 1`

7. Find your **Subtract node** from Step 2.7.2  
   (this is the node that calculates `Length - 1`)

8. Drag from the **output pin** of that Subtract node

9. Connect it to:

   `Random Integer in Range from Stream → Max`

---

## What you should see

- `RandomStream` connected into the Random node
- Min = `0`
- Max = `Length - 1` (from your Subtract node)

---

## Why this matters

This random number is used to pick an index from the `BorderIndices` array.

- `0` = first item
- `Length - 1` = last item

So this ensures we always pick a **valid index**.

---

## Common mistakes

❌ Typing a number into Max manually  
✔️ Use the Subtract node (`Length - 1`)

---

❌ Forgetting to connect RandomStream  
✔️ This version uses the seeded random stream for consistent results

---

❌ Using plain "Random Integer in Range" instead  
✔️ Make sure it says **“from Stream”**

---

## Expected result

You now have a random integer that safely points to an index inside `BorderIndices`.

---

### Step 2.7.4 — Get the entrance cell index

We are now using the random number to pick a value from the `BorderIndices` array.

---

## Step A — Add the Get node

1. Drag `BorderIndices` into the graph as **Get**

2. Drag from the `BorderIndices` pin

3. Search for:

   `Get`

4. Click:

   `Get (a copy)`

---

## Note

You do NOT need to drag in a new `BorderIndices` node each time.

You can reuse the same one already in your graph.

All Get nodes reference the same data.

---

## Step B — Connect the random index

5. Find the output of your node from Step 2.7.3  
   (`Random Integer in Range from Stream`)

6. Drag from the **output pin** of that node

7. Connect it to:

   `Get (a copy) → Index`

---

## What you should see

- `BorderIndices → Get (a copy)`
- Random Integer → connected to the **Index** pin
- The Get node now has a value coming out of its right side

---

## Very important concept (read this carefully)

There are TWO different indexes here:

1. The random number you generated  
   → this is the position inside the `BorderIndices` array

2. The value stored inside `BorderIndices`  
   → this is the actual index of a cell in `MazeGrid`

This step converts:

`Random position in BorderIndices`
→ into  
`Actual MazeGrid cell index`

---

## Simple way to think about it

- `BorderIndices` = a list of valid border cells
- Random number = “pick one spot in that list”
- Get node = “give me the value at that spot”

---

## Common mistakes

❌ Thinking the random number is already the MazeGrid index  
✔️ It is only the position inside BorderIndices

---

❌ Forgetting to connect the Random node to the Index pin  
✔️ The Get node will not work without an Index

---

## Expected result

The output of `Get (a copy)` is the **EntranceIndex** —  
a valid index that points to a cell in `MazeGrid`.

---

## Beginner note — Two different indexes (important)

There are two different indexes being used here:

1. The **random index**
   - This comes from `Random Integer in Range`
   - It is used to pick a position inside the `BorderIndices` array

2. The **maze cell index**
   - This is the value stored inside the `BorderIndices` array
   - This points to a specific cell inside `MazeGrid`

---

## What just happened

You used:

`Random Integer → BorderIndices Get`

This means:

- “Pick a random position in the BorderIndices array”
- “Give me the value stored at that position”

---

## Example (this helps a lot)

If `BorderIndices` contains:

`[3, 7, 12, 20]`

And your random number is:

`2`

Then:

`BorderIndices[2] = 12`

So:

- `2` = random position
- `12` = actual MazeGrid index

---

## Why this matters

We do NOT want a random number from the entire maze.

We only want a random **border cell**.

This step ensures that the selected cell is always on the edge.

---

## Expected result

You now have:

- a valid index that points to a cell in `MazeGrid`
- that cell is guaranteed to be on the border

This will be used as the entrance.

---

<a href="{{ '/assets/images/blog/Part3-Step-2.7.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.7.png' | relative_url }}" style="width:100%;" alt="Selecting random entrance index from BorderIndices using RandomStream" class="post-image">
</a>

---

# Step 2.8 — Select a Random Exit Index

---

## What this step does

Now we choose a second random border cell for the exit.

The exit must not be the same as the entrance.

---

## Instructions

### Step 2.8.1 — Create and set EntranceIndex

---

## Step A — Create the local variable

1. In the `CreateEntranceAndExit` function, find the **Local Variables** section

2. Click:

   `+ Local Variable`

3. Name it:

   `EntranceIndex`

4. Set the type to:

   `Integer` (single value, not array)

---

## Step B — Add the Set node

5. Drag `EntranceIndex` into the graph

6. Choose:

   `Set`

---

## Step C — Connect execution from the loop

7. Find your `For Loop` node

8. Locate the pin labeled:

   `Completed`

9. Drag from `Completed`

10. Connect it to:

`Set EntranceIndex`

---

## Step D — Connect the value

11. Find the output of your:

`BorderIndices → Get (a copy)` node

12. Drag from that output pin

13. Connect it to:

`Set EntranceIndex → Value`

---

## What you should see

- A `Set EntranceIndex` node in your graph
- The value input connected from `Get (a copy)`
- An execution wire flowing into the Set node

---

## Why this matters

This stores the randomly selected border cell so we can:

- compare it later (when picking the exit)
- open the correct wall for the entrance

---

## Common mistakes

❌ Creating the variable but never setting it  
✔️ You must use a **Set node**

---

❌ Connecting the random number instead of the array value  
✔️ Use the output of `BorderIndices Get`, not the random index

---

## Expected result

You now have a variable called `EntranceIndex` that stores a valid border cell index from `MazeGrid`.

---

### Step 2.8.2 — Create a local variable for ExitIndex

1. Create a local variable named:

   `ExitIndex`

2. Set its type to:

   `Integer`

---

### Step 2.8.3 — Choose a random exit

1. Use another:

   `Random Integer in Range from Stream`

2. Use:

- Min = `0`
- Max = `BorderIndices Length - 1`

3. Use `BorderIndices Get (a copy)` again to get the actual maze cell index

4. Set that result into:

   `ExitIndex`

---

### Step 2.8.4 — Make sure the exit is different

1. Compare:

   `ExitIndex != EntranceIndex`

2. Add a Branch

3. If true:

   continue

4. If false:

   choose another random exit index

---

## Beginner note

The easiest beginner-friendly way to handle this is with a small loop:

- choose random exit
- check if it is different from entrance
- if not, choose again

If your maze has more than one border cell, this will eventually find a different exit.

---

## Common mistakes

❌ Allowing entrance and exit to be the same cell  
✔️ Check that `ExitIndex != EntranceIndex`

---

❌ Comparing the wrong index  
✔️ Compare the actual MazeGrid cell indexes, not just the random array positions

---

## Expected result

You should now have:

- `EntranceIndex`
- `ExitIndex`

Both should point to border cells.

They should not be the same.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.8.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.8.png' | relative_url }}" style="width:100%;" alt="Selecting random exit index and checking it is different from EntranceIndex" class="post-image">
</a>

---

# Step 2.9 — Open the Entrance Wall

---

## What this step does

Now we remove one outside wall from the entrance cell.

Which wall gets removed depends on where the cell is located.

---

## Instructions

### Step 2.9.1 — Get the entrance cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from it and search:

   `Get`

3. Choose:

   `Get (a copy)`

4. Connect:

- `EntranceIndex` → `Get (a copy).Index`

---

### Step 2.9.2 — Break the entrance cell

1. Drag from the output of `Get (a copy)`

2. Search for:

   `Break S_MazeCell`

3. Click:

   `Break S_MazeCell`

---

### Step 2.9.3 — Set the correct outside wall to false

Use the cell’s position:

- If `Row == 0`, set `bWallNorth` to false
- If `Row == MazeHeight - 1`, set `bWallSouth` to false
- If `Col == 0`, set `bWallWest` to false
- If `Col == MazeWidth - 1`, set `bWallEast` to false

---

### Step 2.9.4 — Use Set Members in S_MazeCell

1. Drag from the entrance cell struct

2. Search for:

   `Set Members in S_MazeCell`

3. Expose the wall booleans you need to change

4. Set the correct wall boolean to:

   `false`

---

### Step 2.9.5 — Write the updated cell back into MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from it and search:

   `Set Array Elem`

3. Connect:

- `EntranceIndex` → `Index`
- updated entrance cell → `Item`

4. Make sure `Size to Fit` is unchecked

---

## Connections recap

**Data flow:**

- `EntranceIndex → MazeGrid Get.Index`
- Entrance cell → `Set Members in S_MazeCell`
- Updated entrance cell → `Set Array Elem.Item`
- `EntranceIndex → Set Array Elem.Index`

---

## Why this matters

Changing the struct is not enough.

You must write the updated struct back into `MazeGrid`.

Otherwise the entrance wall will not actually be saved.

---

## Common mistakes

❌ Breaking the struct and changing a value, but not writing it back  
✔️ Use `Set Array Elem` after changing the wall boolean

---

❌ Removing an inside wall instead of an outside wall  
✔️ Use Row and Col to decide which border wall to remove

---

## Expected result

The entrance cell now has one outside wall removed.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.9.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.9.png' | relative_url }}" style="width:100%;" alt="Opening entrance wall and writing updated cell back into MazeGrid" class="post-image">
</a>

---

# Step 2.10 — Open the Exit Wall

---

## What this step does

This repeats the same process for the exit cell.

---

## Instructions

### Step 2.10.1 — Get the exit cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from it and search:

   `Get`

3. Choose:

   `Get (a copy)`

4. Connect:

- `ExitIndex` → `Get (a copy).Index`

---

### Step 2.10.2 — Break the exit cell

1. Drag from the output of `Get (a copy)`

2. Search for:

   `Break S_MazeCell`

3. Click:

   `Break S_MazeCell`

---

### Step 2.10.3 — Set the correct outside wall to false

Use the exit cell’s position:

- If `Row == 0`, set `bWallNorth` to false
- If `Row == MazeHeight - 1`, set `bWallSouth` to false
- If `Col == 0`, set `bWallWest` to false
- If `Col == MazeWidth - 1`, set `bWallEast` to false

---

### Step 2.10.4 — Use Set Members in S_MazeCell

1. Drag from the exit cell struct

2. Search for:

   `Set Members in S_MazeCell`

3. Expose the wall boolean you need to change

4. Set the correct wall boolean to:

   `false`

---

### Step 2.10.5 — Write the updated exit cell back into MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from it and search:

   `Set Array Elem`

3. Connect:

- `ExitIndex` → `Index`
- updated exit cell → `Item`

4. Make sure `Size to Fit` is unchecked

---

## Expected result

The exit cell now has one outside wall removed.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.10.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.10.png' | relative_url }}" style="width:100%;" alt="Opening exit wall and writing updated cell back into MazeGrid" class="post-image">
</a>

---

# Step 2.11 — Final Result for `CreateEntranceAndExit`

---

## What you have built

Your `CreateEntranceAndExit` function now:

- finds all border cells
- stores them in `BorderIndices`
- selects a random entrance
- selects a different random exit
- opens the correct outside wall for both

---

## Expected result

The maze now has:

- one entrance
- one exit
- both on the outside edge

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-2.11.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-2.11.png' | relative_url }}" style="width:100%;" alt="Full CreateEntranceAndExit function overview" class="post-image">
</a>

---

# Step 3 — Final Construction Script Flow

---

## What this step does

This connects the whole system together.

The Construction Script will:

- clear old visuals
- clear old maze data
- set the random seed
- initialize the grid
- generate the maze
- create entrance and exit
- build the visible maze

---

# Step 3.1 — Open the Construction Script

---

## Instructions

1. In **My Blueprint**, click:

   `Construction Script`

2. You should already have the beginning of your setup from earlier parts

---

## Expected result

You should be inside the Construction Script graph.

---

# Step 3.2 — Clear Existing Floor Instances

---

## Instructions

1. Drag `FloorHISM` into the graph as **Get**

2. Drag from it and search:

   `Clear Instances`

3. Click:

   `Clear Instances`

4. Connect the white execution pin from `Construction Script` into `Clear Instances`

---

## Why this matters

Every time the Construction Script runs, it needs to remove the old floor instances first.

Otherwise the maze visuals can stack on top of themselves.

---

## Expected result

Old floor instances are cleared before the maze is rebuilt.

---

# Step 3.3 — Clear Existing Wall Instances

---

## Instructions

1. Drag `WallHISM` into the graph as **Get**

2. Drag from it and search:

   `Clear Instances`

3. Click:

   `Clear Instances`

4. Connect:

- `FloorHISM Clear Instances` → `WallHISM Clear Instances`

---

## Expected result

Old wall instances are cleared before new ones are added.

---

# Step 3.4 — Clear MazeGrid

---

## Instructions

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from it and search:

   `Clear`

3. Click the array `Clear` node

4. Connect:

- `WallHISM Clear Instances` → `MazeGrid Clear`

---

## Why this matters

If you do not clear `MazeGrid`, old cells can remain in the array and cause incorrect maze data.

---

## Expected result

The old maze data is removed before a new maze is generated.

---

# Step 3.5 — Set the Random Stream

---

## Instructions

1. Drag `RandomStream` into the graph as **Set**

2. Add:

   `Make Random Stream`

3. Connect:

- `MazeSeed` → `Make Random Stream.Initial Seed`
- `Make Random Stream` → `Set RandomStream`

4. Connect:

- `MazeGrid Clear` → `Set RandomStream`

---

## Why this matters

This makes your maze seed-based.

The same seed should create the same maze.

A different seed should create a different maze.

---

## Expected result

`RandomStream` is reset before the maze is generated.

---

# Step 3.6 — Call InitializeGrid

---

## Instructions

1. Right-click in the Construction Script graph

2. Search for:

   `InitializeGrid`

3. Click:

   `InitializeGrid`

4. Connect:

- `Set RandomStream` → `InitializeGrid`

---

## Expected result

The maze grid is created before maze generation begins.

---

# Step 3.7 — Call GenerateMaze

---

## Instructions

1. Right-click in empty graph space

2. Search for:

   `GenerateMaze`

3. Click:

   `GenerateMaze`

4. Connect:

- `InitializeGrid` → `GenerateMaze`

---

## Expected result

The maze data is generated after the grid has been initialized.

---

# Step 3.8 — Call CreateEntranceAndExit

---

## Instructions

1. Right-click in empty graph space

2. Search for:

   `CreateEntranceAndExit`

3. Click:

   `CreateEntranceAndExit`

4. Connect:

- `GenerateMaze` → `CreateEntranceAndExit`

---

## Why this matters

The entrance and exit must be created after the maze is generated.

If you do this before `GenerateMaze`, the maze generation may overwrite the changes.

---

## Expected result

The entrance and exit are created after the maze layout exists.

---

# Step 3.9 — Call BuildMazeVisuals

---

## Instructions

1. Right-click in empty graph space

2. Search for:

   `BuildMazeVisuals`

3. Click:

   `BuildMazeVisuals`

4. Connect:

- `CreateEntranceAndExit` → `BuildMazeVisuals`

---

## Why this matters

`BuildMazeVisuals` must be last.

It reads the finished maze data and turns it into visible meshes.

---

## Expected result

The visual maze is built after all maze data is finished.

---

# Step 3.10 — Final Construction Script Order

Your Construction Script should now flow like this:

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

## Common mistakes

❌ Calling `BuildMazeVisuals` before `CreateEntranceAndExit`  
✔️ Build visuals after the entrance and exit are created

---

❌ Calling `GenerateMaze` before `InitializeGrid`  
✔️ Initialize the grid first

---

❌ Forgetting to clear old instances  
✔️ Clear floor and wall instances at the beginning

---

## Expected result

Your Construction Script now rebuilds the full maze correctly whenever the actor updates.

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-3.10.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-3.10.png' | relative_url }}" style="width:100%;" alt="Full Construction Script showing clear initialize generate entrance exit and build visuals order" class="post-image">
</a>

---

# Step 4 — Testing the Maze

---

## What this step does

Now you will test whether the full maze system works.

---

## Instructions

### Step 4.1 — Place the maze generator in the level

1. Open your level

2. Drag `BP_MazeGenerator` into the level

3. Select it in the viewport or World Outliner

---

### Step 4.2 — Change the maze settings

In the Details panel, try changing:

- `MazeWidth`
- `MazeHeight`
- `MazeSeed`
- `CellSize`

---

## Expected behavior

You should see:

- the maze appear in the editor
- floors for every cell
- walls around the maze paths
- one entrance
- one exit

Changing `MazeSeed` should create a different layout.

Using the same `MazeSeed` again should recreate the same layout.

---

## Common mistakes

❌ Nothing appears  
✔️ Check that `BuildMazeVisuals` is called in the Construction Script

---

❌ Only floors appear  
✔️ Check that wall booleans are connected to Branch nodes

---

❌ Walls appear in the wrong place  
✔️ Check the wall offsets and rotations

---

❌ Maze keeps getting thicker or duplicated  
✔️ Make sure `Clear Instances` is called for both `FloorHISM` and `WallHISM`

---

❌ Entrance and exit do not appear  
✔️ Make sure `CreateEntranceAndExit` runs before `BuildMazeVisuals`

---

### Screenshot Placeholder

<a href="{{ '/assets/images/blog/Part3-Step-4.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part3-Step-4.png' | relative_url }}" style="width:100%;" alt="Generated maze visible in the Unreal Engine level" class="post-image">
</a>

---

# What You Have Built

At this point, your maze system can:

- generate a perfect maze using depth-first search
- use a seed for reproducible layouts
- store maze data in a struct array
- remove walls between cells
- backtrack correctly
- render floors and walls efficiently using HISM components
- create playable entrances and exits
- run entirely in the editor

> This is a complete procedural maze system.

---

# Where to Go Next

You can expand this system by:

- spawning the player at the entrance
- placing an exit marker at the exit
- adding materials to floors and walls
- generating larger mazes
- adding keys, locked doors, enemies, or puzzles
- turning this into a dungeon generator
- adding rooms inside the maze

---

# Final Note

You now have a fully working procedural maze generator in UE5 Blueprints.

The important thing is not just that the maze works.

You now understand the core pieces behind it:

- grid data
- array indexing
- structs
- seeded randomness
- wall removal
- backtracking
- visual generation

That foundation can be reused in many other procedural systems.
