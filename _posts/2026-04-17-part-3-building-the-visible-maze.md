---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 3"
date: 2026-04-17
author: Roberta
categories: [Tutorials]
published: false
excerpt: >
  In Part 2, we completed the full maze generation logic using a stack-based depth-first search system. The maze now exists in memory, but it is not yet visible. In this part, we will read the grid data and begin building the maze visually in the world.
---

# Building a Procedural Maze Generator in UE5 Blueprints — Part 3

## Rendering the Maze

At the end of Part 2, your maze generator is fully working.

It can:

- create a grid of cells
- generate a maze using DFS with backtracking
- carve paths through the grid
- store the results in the `Grid` array

However:

> ❗ The maze is still invisible

That is because everything exists only as **data**, not as **objects in the world**.

---

## What We Are Building in This Part

In Part 3, we will:

- read each cell in the `Grid`
- determine if it is a wall or floor
- convert grid coordinates into world positions
- place meshes into the level

> This is where your maze becomes visible.

---

## Before You Start

This tutorial assumes you already completed Part 2 and already have:

- `MazeCell`
- `InitializeGrid`
- `GenerateMaze`
- `GetValidNeighbors`
- `CarvePassage`

You should also already have:

- `GridWidth`
- `GridHeight`
- `TileSize`
- `Grid` (MazeCell Array)

And your maze should already generate correctly in memory.

---

## Step 1 — Create the `BuildVisibleMaze` Function

Now we will create the function that reads the grid and prepares to place tiles in the world.

---

### What this step does

This step creates the main function that will:

- loop through every cell in the grid
- read each `MazeCell`
- prepare for spawning meshes later

> This is the function that will eventually draw the maze.

---

### Instructions

#### Step 1 — Create the function

1. Open `BP_MazeGenerator`

2. In the **My Blueprint** panel, find **Functions**

3. Click the **+ Function** button

4. Name the function:

`BuildVisibleMaze`

5. Press **Enter**

---

### Expected result

You now have a new empty function:

`BuildVisibleMaze`

---

<a href="{{ '/assets/images/blog/Part3-Step-1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-1.png' | relative_url }}" alt="Screenshot showing BuildVisibleMaze function created" class="post-image">
</a>

---

## Step 1.1 — Loop Through the Grid

Now we will go through every cell in the `Grid` array.

---

### What this step does

This step loops through all maze cells so we can process them one at a time.

> Every tile you see later will come from this loop.

---

### Instructions

#### Step 1 — Get the Grid

1. Drag `Grid` into the graph as **Get**

---

#### Step 2 — Add a For Each Loop

2. Right-click in the graph

3. Search for:

`For Each Loop`

4. Click:

`For Each Loop`

---

#### Step 3 — Connect the loop

5. Connect:

- `BuildVisibleMaze` (execution) → `For Each Loop`
- `Grid` → `Array`

---

### Connections recap

- Function Entry → `For Each Loop`
- `Grid` → `Array`

---

### Why this matters

This loop is how we access every tile in the maze.

> Without this, nothing can be placed in the world.

---

### Common mistakes

❌ Using `Set Grid`  
✔️ Use **Get Grid**

---

❌ Using a regular `For Loop`  
✔️ Use **For Each Loop**

---

❌ Not connecting the Array pin  
✔️ The loop needs the Grid to work

---

### Expected result

Your function now loops through every cell in the grid.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-1.1.png' | relative_url }}" alt="Screenshot showing For Each Loop connected to Grid" class="post-image">
</a>

---

## Step 1.2 — Break the MazeCell Struct

Now we will read the values inside each cell.

---

### What this step does

This step lets us access:

- `X`
- `Y`
- `Visited`
- `IsWall`

> These values determine what gets placed in the world.

---

### Instructions

1. Drag from `Array Element`

2. Search for:

`Break MazeCell`

3. Click:

`Break MazeCell`

---

### Connections recap

- `Array Element` → `Break MazeCell`

---

### Why this matters

We need to know:

- where the cell is (`X`, `Y`)
- what it is (`IsWall`)

> This data drives the visual maze.

---

### Common mistakes

❌ Using the wrong struct  
✔️ Use your `MazeCell`

---

❌ Thinking this modifies the grid  
✔️ This only reads data

---

### Expected result

You can now see all values inside each maze cell.

---

<a href="{{ '/assets/images/blog/Part3-Step-1.2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-1.2.png' | relative_url }}" alt="Screenshot showing Break MazeCell connected to Array Element" class="post-image">
</a>

---

## Step 1.3 — Prepare for Placement Logic

Right now, the loop reads the data, but does not act on it yet.

---

### What this step does

This step prepares the execution flow for the next steps where we will:

- convert grid coordinates to world position
- decide wall vs floor
- spawn meshes

---

### Instructions

For now:

- leave the `Loop Body` execution pin unconnected

---

### Why this matters

We will use this exact execution path in the next step to place tiles.

> This keeps your Blueprint clean and easier to follow.

---

### Expected result

Your function is now ready to begin placing tiles.

---

# What You Have Built So Far

At this point, your system can now:

- loop through every cell in the maze
- read each `MazeCell`
- access all cell data
- prepare for world placement

> This is the foundation for rendering the maze.

---

## Up Next

In the next step, we will:

- convert grid coordinates into world positions
- use `TileSize`
- begin placing actual meshes in the level

This is where your maze will finally become visible.

---

## Step 2 — Convert Grid Coordinates to World Position

Now that we are looping through every cell in the grid, we need to figure out **where each cell should exist in the world**.

Right now, each cell only has:

- `X`
- `Y`

Those are **grid coordinates**, not world positions.

We need to convert them into real 3D locations.

---

### What this step does

This step converts:

- grid position `(X, Y)`

into:

- world position `(X * TileSize, Y * TileSize)`

> This is what determines where each tile appears in your level.

---

### Instructions

#### Step 1 — Get TileSize

1. In your `BuildVisibleMaze` function:

2. Drag 2 `TileSize` into the graph as **Get**

---

#### Step 2 — Multiply X by TileSize

3. From the `X` output of `Break MazeCell`, drag a wire

4. Search for:

`*`

5. Choose:

`Integer * Integer`

6. Connect:

- `X` → first input
- `TileSize` → second input

---

#### Step 3 — Multiply Y by TileSize

7. From the `Y` output of `Break MazeCell`, drag a wire

8. Search for:

`*`

9. Choose:

`Integer * Integer`

10. Connect:

- `Y` → first input
- `TileSize` → second input

---

### What you now have

You now have:

- `WorldX = X * TileSize`
- `WorldY = Y * TileSize`

---

#### Step 4 — Create a Vector

Now we combine X and Y into a world position.

11. Right-click in the graph

12. Search for:

`Make Vector`

13. Click:

`Make Vector`

---

#### Step 5 — Connect the values

14. Connect:

- X → result of `X * TileSize`
- Y → result of `Y * TileSize`
- Z → `0`

> Unreal will automatically convert the values to float — no extra nodes needed.

---

### Connections recap

- `Break MazeCell.X` → `* TileSize` → `Make Vector.X`
- `Break MazeCell.Y` → `* TileSize` → `Make Vector.Y`
- `Z = 0`

---

### Why this matters

The grid is abstract.

The world is physical.

This step bridges the two.

> Without this, all tiles would spawn at the same location.

---

### Common mistakes

❌ Forgetting to multiply by `TileSize`  
✔️ This controls spacing between tiles

---

❌ Trying to manually convert integers to floats  
✔️ Unreal handles this automatically

---

❌ Adding extra conversion nodes  
✔️ This creates unnecessary clutter

---

❌ Swapping X and Y  
✔️ Keep X → X and Y → Y

---

❌ Setting Z incorrectly  
✔️ Use `0` for a flat maze

---

### Expected result

You now have a valid world position for each maze cell.

Nothing will appear yet — that happens in the next step.

---

<a href="{{ '/assets/images/blog/Part3-Step-2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-2.png' | relative_url }}" alt="Screenshot showing X and Y multiplied by TileSize and connected to Make Vector" class="post-image">
</a>

---

## Step 2.1 — Store the World Position (Optional but Recommended)

Before we start spawning meshes, it is helpful to store this position in a variable.

---

### What this step does

This step stores the calculated world position so it can be reused easily.

---

### Instructions

1. In the **Local Variables** section of `BuildVisibleMaze`, add:

- `WorldLocation` — Vector

2. Drag `WorldLocation` into the graph as:

`Set WorldLocation`

3. Connect:

- output of `Make Vector` → `WorldLocation`

---

### Connections recap

Execution flow:

- `Loop Body` → `Set WorldLocation`

Condition:

- `Make Vector` → `Set WorldLocation`

Break MazeCell.IsWall → Branch.Condition

---

### Why this matters

This keeps your Blueprint clean and easier to read.

> Instead of rebuilding the vector every time, you reuse it.

---

### Common mistakes

❌ Creating a normal variable instead of Local  
✔️ This should be a **Local Variable**

---

❌ Forgetting to set it  
✔️ It must receive the vector value

---

### Expected result

You now have a reusable world position stored in `WorldLocation`.

---

<a href="{{ '/assets/images/blog/Part3-Step-2.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-2.1.png' | relative_url }}" alt="Screenshot showing Make Vector connected to Set WorldLocation" class="post-image">
</a>

---

# What You Have Built So Far

At this point, your system can now:

- loop through every cell
- read maze data
- convert grid coordinates into world space
- store world positions

> You now know **where** to place each tile.

---

## Up Next

In the next step, we will:

- check `IsWall`
- decide what to spawn
- place wall and floor meshes into the world

👉 This is where the maze finally becomes visible.

---

## Step 3 — Spawn Wall and Floor Meshes

Now we will use everything we’ve built so far to actually place objects into the world.

This is the step where your maze finally becomes visible.

---

### What this step does

This step:

- checks if a cell is a wall or floor
- chooses what to spawn
- places a mesh at the correct world location

> This is where your maze appears in the level.

---

## Step 3.1 — Create Mesh Variables

Before we spawn anything, we need variables to hold our mesh references.

---

### What this step does

This step creates variables so you can assign meshes in the editor.

> This makes your system flexible and reusable.

---

### Instructions

1. In `BP_MazeGenerator`, go to **My Blueprint → Variables**

2. Add the following variables:

- `WallMesh` — Static Mesh
- `FloorMesh` — Static Mesh

3. Select `WallMesh`

4. In the **Details panel**, enable:

- **Instance Editable**

5. Repeat for:

- `FloorMesh`

---

### Why this matters

This allows you to assign meshes from the level without editing the Blueprint.

---

### Common mistakes

❌ Forgetting Instance Editable  
✔️ You won’t be able to assign meshes in the editor

---

### Expected result

You now have:

- `WallMesh`
- `FloorMesh`

ready to assign in the level.

---

<a href="{{ '/assets/images/blog/Part3-Step-3.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-3.1.png' | relative_url }}" alt="Screenshot showing WallMesh and FloorMesh variables set as Instance Editable" class="post-image">
</a>

---

## Step 3.2 — Add a Branch (Wall vs Floor)

Now we decide what each cell should become.

---

### What this step does

This step checks:

- `IsWall`

and splits execution into:

- wall path
- floor path

This is where we decide what to spawn for each cell.

---

### VERY IMPORTANT (read this first)

At this point in your Blueprint, your execution flow should already be:

Loop Body  
→ Set WorldLocation

We are now continuing from **Set WorldLocation**, not directly from the loop.

---

### Instructions

#### Step 1 — Add the Branch

1. Find your node:

   `Set WorldLocation`

2. On the **right side** of that node, find the **white execution output pin**

3. Drag from that white pin into empty graph space

4. Search for:

   `Branch`

5. Click:

   `Branch`

---

#### Step 2 — Connect the Condition

6. Find your `Break MazeCell` node

7. Locate the pin:

   `IsWall`

8. Drag from `IsWall`

9. Connect it to the **Condition** input on the `Branch`

---

### Connections recap

Execution flow:

Loop Body  
→ Set WorldLocation  
→ Branch

Condition:

Break MazeCell.IsWall → Branch.Condition

---

### Why this matters

This is the decision point for your maze rendering.

- If `IsWall = true` → spawn a wall
- If `IsWall = false` → spawn a floor

Without this step, every tile would be treated the same.

---

### Common mistakes

❌ Connecting `Loop Body` directly to the Branch  
✔️ You must go through `Set WorldLocation` first

---

❌ Leaving `Set WorldLocation` unconnected  
✔️ Execution must continue into the Branch

---

❌ Using `Visited` instead of `IsWall`  
✔️ Always use `IsWall` for rendering

---

❌ Forgetting to connect the Condition pin  
✔️ The Branch will not work without it

---

### Expected result

You now have two execution paths:

- **True** → Wall
- **False** → Floor

These paths will be used in the next steps to spawn meshes.

---

<a href="{{ '/assets/images/blog/Part3-Step-3.2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-3.2.png' | relative_url }}" alt="Screenshot showing Branch connected to IsWall" class="post-image">
</a>

---

## Step 3.3 — Spawn the Wall Mesh

Now we handle the **True** branch (walls).

---

### What this step does

This step spawns a wall mesh at the correct world location.

> This is what makes the walls of your maze visible.

---

### VERY IMPORTANT (read this first)

At this point, your execution flow should be:

Loop Body  
→ Set WorldLocation  
→ Branch

We are now continuing from the **True** output of the Branch.

---

### Instructions

#### Step 1 — Add Spawn Actor from Class

1. Find your `Branch` node

2. Drag from the **True** execution pin

3. Search for:

   `Spawn Actor from Class`

4. Click:

   `Spawn Actor from Class`

---

#### Step 2 — Set the Class

5. On the `Spawn Actor from Class` node, find the **Class** dropdown

6. Select:

   `StaticMeshActor`

---

#### Step 3 — Add Make Transform

7. Drag from the **Spawn Transform** pin

8. Search for:

   `Make Transform`

9. Click:

   `Make Transform`

---

#### Step 4 — Connect World Location

10. Drag your `WorldLocation` variable into the graph as **Get**

11. Connect:

- `WorldLocation` → `Make Transform Location`

---

#### Step 5 — Connect Transform to Spawn

12. Connect:

- `Make Transform` → `Spawn Transform`

---

#### Step 6 — Get Static Mesh Component

13. From the **Return Value** of `Spawn Actor from Class`, drag a wire

14. Search for:

`Get Static Mesh Component`

15. Click:

`Get Static Mesh Component`

---

#### Step 7 — Set Static Mesh

16. Drag from the output of `Get Static Mesh Component`

17. Search for:

`Set Static Mesh`

18. Click:

`Set Static Mesh`

---

#### Step 8 — Assign WallMesh

19. Drag `WallMesh` into the graph as **Get**

20. Connect:

- `WallMesh` → `New Mesh` on the `Set Static Mesh` node

---

#### Step 9 — Connect Execution Flow

21. Connect the white execution wires:

- `Branch (True)` → `Spawn Actor from Class`
- `Spawn Actor from Class` → `Set Static Mesh`

---

### Connections recap

Execution flow:

Branch (True)  
→ Spawn Actor from Class  
→ Set Static Mesh

Data flow:

WorldLocation → Make Transform Location  
Make Transform → Spawn Transform

Spawn Actor Return Value → Get Static Mesh Component → Set Static Mesh (Target)  
WallMesh → Set Static Mesh (New Mesh)

---

### Why this matters

This is what actually creates visible wall geometry in your maze.

> Without this step, walls exist in data only, not in the world.

---

### Common mistakes

❌ Forgetting to connect `Spawn Transform`  
✔️ Without it, everything spawns at (0,0,0)

---

❌ Skipping `Get Static Mesh Component`  
✔️ You must access the mesh component before setting it

---

❌ Looking for a pin called “Static Mesh”  
✔️ The correct pin is called **New Mesh**

---

❌ Not connecting execution wires  
✔️ The nodes must execute in order

---

### Expected result

Wall cells will now spawn visible meshes in the world at the correct positions.

---

<a href="{{ '/assets/images/blog/Part3-Step-3.3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-3.3.png' | relative_url }}" alt="Screenshot showing wall mesh spawning setup" class="post-image">
</a>

---

## Step 3.4 — Spawn the Floor Mesh

Now we handle the **False** branch (floor tiles).

---

### What this step does

This step spawns a floor mesh at the correct world location.

> This is what creates the walkable paths in your maze.

---

### VERY IMPORTANT (read this first)

At this point, your execution flow should be:

Loop Body  
→ Set WorldLocation  
→ Branch

We are now continuing from the **False** output of the Branch.

---

### Instructions

#### Step 1 — Add Spawn Actor from Class

1. Find your `Branch` node

2. Drag from the **False** execution pin

3. Search for:

   `Spawn Actor from Class`

4. Click:

   `Spawn Actor from Class`

---

#### Step 2 — Set the Class

5. On the `Spawn Actor from Class` node, find the **Class** dropdown

6. Select:

   `StaticMeshActor`

---

#### Step 3 — Add Make Transform

7. Drag from the **Spawn Transform** pin

8. Search for:

   `Make Transform`

9. Click:

   `Make Transform`

---

#### Step 4 — Connect World Location

10. Drag your `WorldLocation` variable into the graph as **Get**

11. Connect:

- `WorldLocation` → `Make Transform Location`

---

#### Step 5 — Connect Transform to Spawn

12. Connect:

- `Make Transform` → `Spawn Transform`

---

#### Step 6 — Get Static Mesh Component

13. From the **Return Value** of `Spawn Actor from Class`, drag a wire

14. Search for:

`Get Static Mesh Component`

15. Click:

`Get Static Mesh Component`

---

#### Step 7 — Set Static Mesh

16. Drag from the output of `Get Static Mesh Component`

17. Search for:

`Set Static Mesh`

18. Click:

`Set Static Mesh`

---

#### Step 8 — Assign FloorMesh

19. Drag `FloorMesh` into the graph as **Get**

20. Connect:

- `FloorMesh` → `New Mesh` on the `Set Static Mesh` node

---

#### Step 9 — Connect Execution Flow

21. Connect the white execution wires:

- `Branch (False)` → `Spawn Actor from Class`
- `Spawn Actor from Class` → `Set Static Mesh`

---

### Connections recap

Execution flow:

Branch (False)  
→ Spawn Actor from Class  
→ Set Static Mesh

Data flow:

WorldLocation → Make Transform Location  
Make Transform → Spawn Transform

Spawn Actor Return Value → Get Static Mesh Component → Set Static Mesh (Target)  
FloorMesh → Set Static Mesh (New Mesh)

---

### Why this matters

This creates the floor tiles that make up the walkable maze paths.

> Without this step, you would only see walls and no paths.

---

### Common mistakes

❌ Forgetting to build the False branch  
✔️ You need both wall and floor paths

---

❌ Using WallMesh instead of FloorMesh  
✔️ Keep them separate

---

❌ Skipping `Get Static Mesh Component`  
✔️ Required to assign the mesh

---

❌ Not connecting execution wires  
✔️ Nodes must execute in order

---

### Expected result

Floor tiles will now spawn in all path locations of the maze.

---

<a href="{{ '/assets/images/blog/Part3-Step-3.4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-3.4.png' | relative_url }}" alt="Screenshot showing floor mesh spawning setup" class="post-image">
</a>

---

# What You Have Built So Far

At this point, your system can now:

- read every cell
- convert positions
- determine wall vs floor
- spawn meshes into the world

> Your maze should now be fully visible.

---

## VERY IMPORTANT — Call the Function

You must call this function, or nothing will appear.

---

### Instructions

In your **Event Graph**:
Event BeginPlay
→ InitializeGrid
→ GenerateMaze
→ BuildVisibleMaze

<a href="{{ '/assets/images/blog/Part3-Step-3.4a.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part3-Step-3.4a.png' | relative_url }}" alt="Screenshot showing updated Event BeginPlay" class="post-image">
</a>

---

### Why this matters

Without calling `BuildVisibleMaze`:

> the maze exists… but you will never see it

---

## Before You Press Play — Assign Your Meshes

Before running the maze, you need to assign meshes for the walls and floor.

If you skip this step:

> ❗ Nothing will appear, even though everything is working correctly

---

### What this step does

This step assigns visual meshes to:

- `WallMesh`
- `FloorMesh`

> Without these, the system has nothing to display.

---

### Instructions

#### Step 1 — Place the Blueprint in the Level

1. In the **Content Browser**, find:

`BP_MazeGenerator`

2. Drag it into your level

---

#### Step 2 — Select the Blueprint

3. Click the placed `BP_MazeGenerator` in the level

4. Look at the **Details panel**

---

#### Step 3 — Assign Wall Mesh

5. Find:

`WallMesh`

6. Click the dropdown

7. Search for:

`SM_Cube`

8. Select:

`SM_Cube`

---

#### Step 4 — Assign Floor Mesh

9. Find:

`FloorMesh`

10. Click the dropdown

11. Search for:

`Cube`

12. Select:

`SM_Cube`

---

### Why we use Cube for both (important)

Using `Shape_Cube` for both:

- avoids scaling issues
- keeps everything aligned with `TileSize`
- makes debugging easier

> We will improve visuals later.

---

### Common mistakes

❌ Forgetting to place the Blueprint in the level  
✔️ It must exist in the scene to run

---

❌ Not selecting the instance in the level  
✔️ Variables appear in the Details panel only when selected

---

❌ Leaving meshes empty  
✔️ Nothing will spawn visually

---

❌ Using Plane for floor too early  
✔️ It can cause confusing size issues for beginners

---

### Expected result

You now have:

- `WallMesh` assigned
- `FloorMesh` assigned

Your maze is now ready to be displayed.

---

## Now Press Play

When you press Play:

- the grid initializes
- the maze generates
- the meshes spawn

🎉 You should now see your maze in the level

### Expected result

When you press Play:

- the maze generates
- walls appear
- floor appears

🎉 You now have a fully visible procedural maze.

---

## Up Next

In the next step, we will improve performance by replacing spawned actors with:

👉 **Instanced Static Meshes**

This is how real games handle large grids efficiently.
