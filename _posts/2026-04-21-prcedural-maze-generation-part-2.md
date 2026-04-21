---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 2 (Maze Generation Logic)"
date: 2026-04-21
author: Roberta
categories: [Tutorials]
published: false
excerpt: >
  In Part 2, we build the full maze generation logic. By the end of this part, your maze will generate completely in memory using a stack-based depth-first search system.
---

# Building a Procedural Maze Generator in UE5 Blueprints — Part 2

## Introduction

In Part 1, you built the foundation for your maze generator:

- project structure
- custom structs
- the main Blueprint
- variables
- HISM components

Now we are building the real logic.

By the end of this part, your system will:

- create a full grid of maze cells
- choose a starting cell
- search for valid unvisited neighbors
- remove walls between connected cells
- backtrack when needed
- generate a complete maze in memory

> Nothing will be visible yet. That happens in Part 3.

---

## What We Are Building in This Part

In this part, we will create:

- the `InitializeGrid` function
- the `GetUnvisitedNeighbors` helper function
- the `RemoveWallBetween` helper function
- the `GenerateMaze` function
- the Construction Script flow that calls everything in order

> This is the brain of your maze generator.

---

## Before You Start

You should already have:

- `BP_MazeGenerator`
- `S_MazeCell`
- `S_NeighborInfo`

And these variables from Part 1:

- `MazeWidth`
- `MazeHeight`
- `CellSize`
- `MazeSeed`
- `MazeGrid`
- `RandomStream`

You should also already have these components:

- `FloorHISM`
- `WallHISM`

---

# Step 1 — Build the Construction Script Setup

Before we create the maze functions, we need to prepare the Construction Script.

---

## What this step does

This step sets up the Construction Script so it:

- clears old mesh instances
- clears old maze data
- creates a seeded random stream
- prepares to call the maze generation functions later

> This makes sure every rebuild starts clean.

---

## Instructions

### Step 1.1 — Open the Construction Script

#### Step 1.1.1 — Open the Blueprint

1. Open `BP_MazeGenerator`

2. In the left panel, click:

   `Construction Script`

---

### Step 1.2 — Clear old floor instances

#### Step 1.2.1 — Add the FloorHISM clear node

1. Drag `FloorHISM` from the **Components** panel into the graph as **Get**

2. Drag from the `FloorHISM` pin

3. Search for:

   `Clear Instances`

4. Click:

   `Clear Instances`

---

### Step 1.3 — Clear old wall instances

#### Step 1.3.1 — Add the WallHISM clear node

1. Drag `WallHISM` from the **Components** panel into the graph as **Get**

2. Drag from the `WallHISM` pin

3. Search for:

   `Clear Instances`

4. Click:

   `Clear Instances`

#### Step 1.3.2 — Connect execution flow

5. Connect the white execution pin from:

   `Construction Script`

   to

   `Clear Instances` on `FloorHISM`

6. Connect the white execution pin from:

   `Clear Instances` on `FloorHISM`

   to

   `Clear Instances` on `WallHISM`

---

### Step 1.4 — Clear the MazeGrid array

#### Step 1.4.1 — Add the Clear node

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Clear`

4. Click:

   `Clear`

#### Step 1.4.2 — Connect execution flow

5. Connect the white execution pin from:

   `Clear Instances` on `WallHISM`

   to

   `Clear` on `MazeGrid`

---

### Step 1.5 — Create and store the RandomStream

#### Step 1.5.1 — Create the stream

1. Drag `MazeSeed` into the graph as **Get**

2. Drag from the `MazeSeed` pin

3. Search for:

   `Make Random Stream`

4. Click:

   `Make Random Stream`

#### Step 1.5.2 — Store the stream

5. Drag `RandomStream` into the graph as **Set**

6. Connect the output of `Make Random Stream` into the value pin on `Set RandomStream`

**_Pro tip: If you drag `RandomStream` and drop it on the `Return Value` pin, Blueprints will create the Set node automatically._**

#### Step 1.5.3 — Connect execution flow

7. Connect the white execution pin from:

   `Clear` on `MazeGrid`

   to

   `Set RandomStream`

---

### Connections recap

**Execution flow:**  
`Construction Script → Clear Instances (FloorHISM) → Clear Instances (WallHISM) → Clear (MazeGrid) → Set RandomStream`

**Data flow:**

- `FloorHISM` → `Clear Instances`
- `WallHISM` → `Clear Instances`
- `MazeGrid` → `Clear`
- `MazeSeed` → `Make Random Stream`
- `Make Random Stream` → `Set RandomStream`

---

## Why this matters

If you skip this setup:

- old mesh instances can stack up
- old grid data can remain in memory
- your random results will not be controlled by the seed

> This setup gives you a clean and repeatable starting point every time the Blueprint rebuilds.

---

## Common mistakes

❌ Using `Clear` on an HISM component  
✔️ Use `Clear Instances`

---

❌ Dragging `FloorHISM` or `WallHISM` in as **Set**  
✔️ Drag them in as **Get**

---

❌ Forgetting to store the random stream  
✔️ The result of `Make Random Stream` must go into `Set RandomStream`

---

## Expected result

Your Construction Script now:

- clears previous mesh instances
- clears old maze data
- stores a seeded random stream

---

### Screenshot Placeholder

**[Screenshot: Construction Script clearing FloorHISM, WallHISM, MazeGrid, and setting RandomStream from MazeSeed]**

---

<a href="{{ '/assets/images/blog/Part2-Step-1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-1.png' | relative_url }}" alt="Construction Script clearing HISM instances, clearing MazeGrid, and setting RandomStream from MazeSeed" class="post-image">
</a>

---

# Step 2 — Create the `InitializeGrid` Function

Now we will build the function that creates every maze cell.

---

## What this step does

This function creates a full grid of `S_MazeCell` structs and stores them in `MazeGrid`.

Each cell begins as:

- unvisited
- fully enclosed by walls

> This gives the maze generator a clean starting state.

---

## Instructions

### Step 2.1 — Create the function

#### Step 2.1.1 — Add the function

1. In the **My Blueprint** panel, find **Functions**

2. Click the **+ Function** button

3. Name the function:

   `InitializeGrid`

4. Press **Enter**

---

### Step 2.2 — Clear the MazeGrid array inside the function

#### Step 2.2.1 — Add the Clear node

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Clear`

4. Click:

   `Clear`

#### Step 2.2.2 — Connect execution flow

5. Connect the white execution pin from:

   `InitializeGrid`

   to

   `Clear` on `MazeGrid`

---

### Step 2.3 — Add a For Loop

#### Step 2.3.1 — Add the loop node

1. Right-click in empty graph space

2. Search for:

   `For Loop`

3. Click:

   `For Loop`

#### Step 2.3.2 — Connect execution flow

4. Connect the white execution pin from:

   `Clear` on `MazeGrid`

   to

   `For Loop`

---

### Step 2.4 — Calculate the Last Index

We want the loop to run once for every cell in the maze.

#### Step 2.4.1 — Multiply width and height

1. Drag `MazeWidth` into the graph as **Get**

2. Drag `MazeHeight` into the graph as **Get**

3. Drag from `MazeWidth`

4. Search for:

   `*`

5. Choose:

   `Integer * Integer`

6. Connect:

- `MazeWidth` → first input
- `MazeHeight` → second input

#### Step 2.4.2 — Subtract 1 for the last valid index

7. Drag from the result of the multiply node

8. Search for:

   `-`

9. Choose:

   `Integer - Integer`

10. Set the second input to:

`1`

#### Step 2.4.3 — Connect to the For Loop

11. Connect the result into:

`For Loop.Last Index`

12. Set:

`For Loop.First Index = 0`

---

### Step 2.5 — Calculate Row

#### Step 2.5.1 — Divide by MazeWidth

1. Drag from the `Index` pin on the `For Loop`

2. Search for:

   `/`

3. Choose:

   `Integer / Integer`

4. Drag another `MazeWidth` into the graph as **Get**

5. Connect:

- `Index` → first input
- `MazeWidth` → second input

This gives you:

`Row = Index / MazeWidth`

---

### Step 2.6 — Calculate Col

#### Step 2.6.1 — Use modulo with MazeWidth

1. Drag from the `Index` pin again

2. Search for:

   `%`

3. Choose:

   `Percent (Integer)`

4. Drag another `MazeWidth` into the graph as **Get**

5. Connect:

- `Index` → first input
- `MazeWidth` → second input

This gives you:

`Col = Index % MazeWidth`

---

### Step 2.7 — Create the MazeCell struct

#### Step 2.7.1 — Add the Make S_MazeCell node

1. Right-click in empty graph space

2. Search for:

   `Make S_MazeCell`

3. Click:

   `Make S_MazeCell`

#### Step 2.7.2 — Connect the position data

4. Connect:

- the divide result → `Row`
- the modulo result → `Col`

#### Step 2.7.3 — Set default values

5. Set:

- `bVisited = False`
- `bWallNorth = True`
- `bWallEast = True`
- `bWallSouth = True`
- `bWallWest = True`

---

### Step 2.8 — Add the cell to MazeGrid

#### Step 2.8.1 — Add the Add node

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Add`

4. Click:

   `Add`

#### Step 2.8.2 — Connect execution and data

5. Connect the white execution pin from:

   `For Loop.Loop Body`

   to

   `Add`

6. Connect:

- `Make S_MazeCell` → `Add.Item`

---

### Connections recap

**Execution flow:**  
`InitializeGrid → Clear (MazeGrid) → For Loop → Add to MazeGrid`

**Data flow:**

- `MazeWidth × MazeHeight - 1` → `For Loop.Last Index`
- `For Loop.Index / MazeWidth` → `Row`
- `For Loop.Index % MazeWidth` → `Col`
- `Row` and `Col` → `Make S_MazeCell`
- `Make S_MazeCell` → `MazeGrid.Add`

---

## Why this matters

This function builds the entire maze structure in memory before the maze algorithm runs.

Every cell now has:

- a row
- a column
- an unvisited state
- all four walls still intact

> This is the starting point the algorithm expects.

---

## Common mistakes

❌ Setting `Last Index` to `MazeWidth * MazeHeight`  
✔️ Use `MazeWidth * MazeHeight - 1`

---

❌ Mixing up Row and Col  
✔️ Row uses division, Col uses modulo

---

❌ Forgetting to add the struct into `MazeGrid`  
✔️ `Make S_MazeCell` must connect into `Add.Item`

---

## Expected result

Your `InitializeGrid` function now creates a full array of maze cells.

---

### Screenshot Placeholder

**[Screenshot: InitializeGrid function with Clear MazeGrid, For Loop, row and column math, Make S_MazeCell, and Add node]**

---

<a href="{{ '/assets/images/blog/Part2-Step-2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-2.png' | relative_url }}" alt="InitializeGrid function with Clear MazeGrid, For Loop, row and column calculations, Make S_MazeCell, and Add to MazeGrid" class="post-image">
</a>

---

# Step 3 — Create the `GetUnvisitedNeighbors` Function

Now we need a helper function that checks which neighboring cells are still valid moves.

---

## What this step does

This function checks the four directions around the current cell and returns only neighbors that are:

- inside the maze bounds
- not already visited

It returns them as an array of `S_NeighborInfo`.

> This is how the maze generator decides where it can go next.

---

## Instructions

### Step 3.1 — Create the function

#### Step 3.1.1 — Add the function

1. In the **Functions** section, click **+ Function**

2. Name it:

   `GetUnvisitedNeighbors`

---

### Step 3.2 — Add input and output

#### Step 3.2.1 — Add the input

In the **Details** panel for the function, add:

- `CurrentIndex` (Integer)

#### Step 3.2.2 — Add the output

Add:

- `Neighbors` (Array of `S_NeighborInfo`)

---

### Step 3.3 — Add local variables

#### Step 3.3.1 — Create local variables

In the function, create these **Local Variables**:

- `CurrentRow` (Integer)
- `CurrentCol` (Integer)
- `LocalNeighbors` (Array of `S_NeighborInfo`)
- `TestIndex` (Integer)

---

### Step 3.4 — Calculate CurrentRow

#### Step 3.4.1 — Divide CurrentIndex by MazeWidth

1. From the **function entry node**, drag from the input pin:

   `CurrentIndex`

2. Search for:

   `/`

3. Choose:

   `Integer / Integer`

4. Drag `MazeWidth` into the graph as **Get**

5. Connect:

- `CurrentIndex` → first input
- `MazeWidth` → second input

#### Step 3.4.2 — Store the result

6. Drag `CurrentRow` into the graph as **Set**

7. Connect the result into `Set CurrentRow`

8. Connect the white execution pin from:

   `GetUnvisitedNeighbors`

   to

   `Set CurrentRow`

---

### Step 3.5 — Calculate CurrentCol

#### Step 3.5.1 — Use modulo with MazeWidth

1. From the **function entry node**, drag from the input pin:

   `CurrentIndex`

2. Search for:

   `%`

3. Choose:

   `Percent (Integer)`

4. Drag `MazeWidth` into the graph as **Get**

5. Connect:

- `CurrentIndex` → first input
- `MazeWidth` → second input

#### Step 3.5.2 — Store the result

6. Drag `CurrentCol` into the graph as **Set**

7. Connect the modulo result into `Set CurrentCol`

8. Connect the white execution pin from:

   `Set CurrentRow`

   to

   `Set CurrentCol`

---

### Step 3.6 — Check the North neighbor

Use this pattern for North:

`CurrentRow > 0 → TestIndex = CurrentIndex - MazeWidth → MazeGrid[TestIndex] → NOT bVisited → Make S_NeighborInfo (0, -1) → Add to LocalNeighbors`

#### Step 3.6.1 — Check north bounds

1. Drag `CurrentRow` into the graph as **Get**

2. Drag from the `CurrentRow` pin

3. Search for:

   `>`

4. Choose:

   `Integer > Integer`

5. Set the second input to:

   `0`

6. Right-click in empty graph space

7. Search for:

   `Branch`

8. Click:

   `Branch`

9. Connect the white execution pin from:

   `Set CurrentCol`

   to

   `Branch`

10. Connect:

- `CurrentRow > 0` → `Branch.Condition`

#### Step 3.6.2 — Calculate TestIndex

11. From the **function entry node**, drag from the input pin:

`CurrentIndex`

12. Drag `MazeWidth` into the graph as **Get**

13. Search for:

`Integer - Integer`

14. Connect:

- `CurrentIndex` → first input
- `MazeWidth` → second input

15. Drag `TestIndex` into the graph as **Set**

16. Connect the result into `Set TestIndex`

17. Connect the white execution pin from:

`Branch.True`

to

`Set TestIndex`

#### Step 3.6.3 — Read the north cell

18. Drag `MazeGrid` into the graph as **Get**

19. Drag from the `MazeGrid` pin

20. Search for:

`Get (a copy)`

21. Click:

`Get (a copy)`

22. Connect:

- `TestIndex` → `Index`

23. Drag from the output of `Get (a copy)`

24. Search for:

`Break S_MazeCell`

25. Click:

`Break S_MazeCell`

#### Step 3.6.4 — Check if north is unvisited

26. Drag from `bVisited`

27. Search for:

`NOT Boolean`

28. Click:

`NOT Boolean`

29. Right-click in empty graph space

30. Search for:

`Branch`

31. Click:

`Branch`

32. Connect the white execution pin from:

`Set TestIndex`

to

this second `Branch`

33. Connect:

- `NOT bVisited` → `Branch.Condition`

#### Step 3.6.5 — Add the north neighbor

34. Right-click in empty graph space

35. Search for:

`Make S_NeighborInfo`

36. Click:

`Make S_NeighborInfo`

37. Set:

- `CellIndex = TestIndex`
- `DeltaX = 0`
- `DeltaY = -1`

38. Drag `LocalNeighbors` into the graph as **Get**

39. Drag from the `LocalNeighbors` pin

40. Search for:

`Add`

41. Click:

`Add`

42. Connect the white execution pin from:

second `Branch.True`

to

`Add`

43. Connect:

- `Make S_NeighborInfo` → `Add.Item`

---

### Step 3.7 — Check the East neighbor

Repeat the same pattern, but use these values:

- Bounds check: `CurrentCol < MazeWidth - 1`
- Index formula: `CurrentIndex + 1`
- `DeltaX = 1`
- `DeltaY = 0`

Connect the white execution pin from the North section into the East section so the function continues cleanly.

---

### Step 3.8 — Check the South neighbor

Repeat the same pattern, but use these values:

- Bounds check: `CurrentRow < MazeHeight - 1`
- Index formula: `CurrentIndex + MazeWidth`
- `DeltaX = 0`
- `DeltaY = 1`

Connect the white execution pin from the East section into the South section.

---

### Step 3.9 — Check the West neighbor

Repeat the same pattern, but use these values:

- Bounds check: `CurrentCol > 0`
- Index formula: `CurrentIndex - 1`
- `DeltaX = -1`
- `DeltaY = 0`

Connect the white execution pin from the South section into the West section.

---

### Step 3.10 — Final execution pattern

#### Step 3.10.1 — Review the full branch chain

When all four directions are connected, the full function should flow like this:

`Set CurrentCol  
→ [Branch: CurrentRow > 0] (North Bounds)  
→ [Branch: CurrentCol < MazeWidth - 1] (East Bounds)  
→ [Branch: CurrentRow < MazeHeight - 1] (South Bounds)  
→ [Branch: CurrentCol > 0] (West Bounds)  
→ Return Node`

If a direction is valid, its internal logic runs before execution continues to the next direction.

---

### Screenshot Placeholder

**[Screenshot: Full GetUnvisitedNeighbors directional branch chain showing North, East, South, and West sections connected in order]**

---

### Step 3.11 — Return the LocalNeighbors array

#### Step 3.11.1 — Connect the return value

1. Drag your **Return Node** into view

2. Drag `LocalNeighbors` into the graph as **Get**

3. Connect:

- `LocalNeighbors` → `Neighbors` on the Return Node

4. Connect the white execution pin from the final West section into the Return Node

---

### Connections recap

**Execution flow:**  
`GetUnvisitedNeighbors → Set CurrentRow → Set CurrentCol → Check North → Check East → Check South → Check West → Return`

**Data flow:**

- `CurrentIndex / MazeWidth` → `CurrentRow`
- `CurrentIndex % MazeWidth` → `CurrentCol`
- Neighbor index formulas → `TestIndex`
- `MazeGrid[TestIndex]` → `Break S_MazeCell`
- Valid unvisited neighbor data → `Make S_NeighborInfo`
- `Make S_NeighborInfo` → `LocalNeighbors.Add`
- `LocalNeighbors` → Return value `Neighbors`

---

## Why this matters

This function is how the maze generator finds possible next moves.

It prevents the algorithm from:

- going outside the maze
- revisiting old cells
- choosing invalid directions

> Without this function, the generator has no idea where it can go.

---

## Common mistakes

❌ Forgetting the bounds checks  
✔️ Always make sure the neighbor is inside the maze first

---

❌ Reading the current cell instead of the neighbor cell  
✔️ Use `TestIndex` to read the neighbor from `MazeGrid`

---

❌ Forgetting to negate `bVisited`  
✔️ You want unvisited neighbors only

---

❌ Returning nothing  
✔️ `LocalNeighbors` must connect into the Return Node

---

## Expected result

Your `GetUnvisitedNeighbors` function now returns all valid unvisited neighbors for any current cell.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}" alt="GetUnvisitedNeighbors function checking north east south and west neighbors and returning valid S_NeighborInfo entries" class="post-image">
</a>

---

# Step 4 — Create the `RemoveWallBetween` Function

Now we need a helper function that removes the wall between two connected cells.

---

## What this step does

Given:

- the current cell
- the chosen neighbor
- the direction between them

this function removes the correct wall from both cells.

> This is what carves the path through the maze.

---

## Instructions

### Step 4.1 — Create the function

#### Step 4.1.1 — Add the function

1. Create a new function named:

   `RemoveWallBetween`

---

### Step 4.2 — Add inputs

#### Step 4.2.1 — Add function inputs

Add these inputs:

- `CurrentIndex` (Integer)
- `NeighborIndex` (Integer)
- `DeltaX` (Integer)
- `DeltaY` (Integer)

---

### Step 4.3 — Add local variables

#### Step 4.3.1 — Create local cell variables

Create these **Local Variables**:

- `CurrentCell` (`S_MazeCell`)
- `NeighborCell` (`S_MazeCell`)

---

### Step 4.4 — Read the current cell

#### Step 4.4.1 — Read from MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. From the **function entry node**, drag from the input pin:

   `CurrentIndex`

6. Connect:

- `CurrentIndex` → `Index` on `Get (a copy)`

#### Step 4.4.2 — Store the cell in CurrentCell

7. Drag `CurrentCell` into the graph as **Set**

8. Connect:

- output of `Get (a copy)` → value input on `Set CurrentCell`

9. Connect the white execution pin from:

   `RemoveWallBetween`

   to

   `Set CurrentCell`

---

### Connections recap

**Execution flow:**  
`RemoveWallBetween → Set CurrentCell`

**Data flow:**

- `MazeGrid` → `Get (a copy).Target Array`
- `CurrentIndex` (function input) → `Get (a copy).Index`
- `Get (a copy)` output → `Set CurrentCell`

---

### Step 4.5 — Read the neighbor cell

#### Step 4.5.1 — Read from MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. From the **function entry node**, drag from the input pin:

   `NeighborIndex`

6. Connect:

- `NeighborIndex` → `Index` on `Get (a copy)`

#### Step 4.5.2 — Store the cell in NeighborCell

7. Drag `NeighborCell` into the graph as **Set**

8. Connect:

- output of `Get (a copy)` → value input on `Set NeighborCell`

9. Connect the white execution pin from:

   `Set CurrentCell`

   to

   `Set NeighborCell`

---

### Connections recap

**Execution flow:**  
`Set CurrentCell → Set NeighborCell`

**Data flow:**

- `MazeGrid` → `Get (a copy).Target Array`
- `NeighborIndex` (function input) → `Get (a copy).Index`
- `Get (a copy)` output → `Set NeighborCell`

---

### Step 4.6 — Add the Sequence node

#### Step 4.6.1 — Add and connect Sequence

1. Right-click in empty graph space

2. Search for:

   `Sequence`

3. Click:

   `Sequence`

4. Connect the white execution pin from:

   `Set NeighborCell`

   to

   `Sequence`

This creates separate execution outputs:

- `Then 0`
- `Then 1`
- `Then 2`
- `Then 3`

We will use them like this:

- `Then 0` → North
- `Then 1` → East
- `Then 2` → South
- `Then 3` → West

---

### Screenshot Placeholder

**[Screenshot: Sequence node connected after Set NeighborCell with Then 0, Then 1, Then 2, and Then 3 visible]**

---

### Step 4.7 — Check direction: North

If `DeltaY == -1`, then:

- the **current cell loses its North wall**
- the **neighbor cell loses its South wall**

For North, we will use:

- `Sequence → Then 0`

#### Step 4.7.1 — Check if the direction is North

1. From the **function entry node**, drag from the input pin:

   `DeltaY`

2. Search for:

   `==`

3. Choose:

   `Integer == Integer`

4. Set the second input value to:

   `-1`

5. Right-click in empty graph space

6. Search for:

   `Branch`

7. Click:

   `Branch`

8. Connect the white execution pin from:

   `Sequence → Then 0`

   to

   `Branch`

9. Connect:

- `DeltaY == -1` → `Branch.Condition`

#### Step 4.7.2 — If True, remove the North wall from the Current Cell

10. Right-click in empty graph space

11. Search for:

`Set Members in S_MazeCell`

12. Click:

`Set Members in S_MazeCell`

13. Connect:

- `CurrentCell` → struct input (left side of the node)

14. In the **Details panel**, enable only:

- `bWallNorth`

15. Set:

- `bWallNorth = False`

16. Connect the white execution pin from:

`Branch.True`

to

`Set Members in S_MazeCell` (CurrentCell)

#### Step 4.7.3 — Remove the South wall from the Neighbor Cell

17. Right-click in empty graph space

18. Search for:

`Set Members in S_MazeCell`

19. Click:

`Set Members in S_MazeCell`

20. Connect:

- `NeighborCell` → struct input (left side of the node)

21. In the **Details panel**, enable only:

- `bWallSouth`

22. Set:

- `bWallSouth = False`

23. Connect the white execution pin from:

`Set Members in S_MazeCell` (CurrentCell)

to

`Set Members in S_MazeCell` (NeighborCell)

---

### Connections recap

**Execution flow:**  
`Set NeighborCell → Sequence → Then 0 → Branch → Set Members in S_MazeCell (CurrentCell) → Set Members in S_MazeCell (NeighborCell)`

**Data flow:**

- `DeltaY` (function input) → `Integer == Integer`
- `DeltaY == -1` → `Branch.Condition`
- `CurrentCell` → `Set Members in S_MazeCell` (sets `bWallNorth = False`)
- `NeighborCell` → `Set Members in S_MazeCell` (sets `bWallSouth = False`)

---

## Why this matters

Using a `Sequence` node lets each direction check run from its own execution output.

That means:

- North does not need to chain into East
- East does not need to chain into South
- South does not need to chain into West

Each direction gets its own clean path.

> This is much easier to manage than trying to force all direction checks into one long branch chain.

---

## Common mistakes

❌ Connecting North directly from `Set NeighborCell` without a `Sequence`  
✔️ Use `Sequence → Then 0`

---

❌ Trying to connect the end of North into East  
✔️ Each direction should start from its own `Sequence` output

---

❌ Forgetting that `Set Members in S_MazeCell` only updates the local struct variable  
✔️ You still need to write `CurrentCell` and `NeighborCell` back into `MazeGrid` later with `Set Array Elem`

---

## Expected result

Your North direction check now runs from the `Sequence` node and correctly updates:

- `CurrentCell.bWallNorth = False`
- `NeighborCell.bWallSouth = False`

when `DeltaY == -1`.

---

### Step 4.8 — Check direction: East

If `DeltaX == 1`, then:

- the **current cell loses its East wall**
- the **neighbor cell loses its West wall**

For East, we will use:

- `Sequence → Then 1`

#### Step 4.8.1 — Check if the direction is East

1. From the **function entry node**, drag from the input pin:

   `DeltaX`

2. Search for:

   `==`

3. Choose:

   `Integer == Integer`

4. Set the second input value to:

   `1`

5. Right-click in empty graph space

6. Search for:

   `Branch`

7. Click:

   `Branch`

8. Connect the white execution pin from:

   `Sequence → Then 1`

   to

   `Branch`

9. Connect:

- `DeltaX == 1` → `Branch.Condition`

#### Step 4.8.2 — If True, remove the East wall from the Current Cell

10. Right-click in empty graph space

11. Search for:

`Set Members in S_MazeCell`

12. Click:

`Set Members in S_MazeCell`

13. Connect:

- `CurrentCell` → struct input (left side of the node)

14. In the **Details panel**, enable only:

- `bWallEast`

15. Set:

- `bWallEast = False`

16. Connect the white execution pin from:

`Branch.True`

to

`Set Members in S_MazeCell` (CurrentCell)

#### Step 4.8.3 — Remove the West wall from the Neighbor Cell

17. Right-click in empty graph space

18. Search for:

`Set Members in S_MazeCell`

19. Click:

`Set Members in S_MazeCell`

20. Connect:

- `NeighborCell` → struct input (left side of the node)

21. In the **Details panel**, enable only:

- `bWallWest`

22. Set:

- `bWallWest = False`

23. Connect the white execution pin from:

`Set Members in S_MazeCell` (CurrentCell)

to

`Set Members in S_MazeCell` (NeighborCell)

---

### Connections recap

**Execution flow:**  
`Set NeighborCell → Sequence → Then 1 → Branch → Set Members in S_MazeCell (CurrentCell) → Set Members in S_MazeCell (NeighborCell)`

**Data flow:**

- `DeltaX` (function input) → `Integer == Integer`
- `DeltaX == 1` → `Branch.Condition`
- `CurrentCell` → `Set Members in S_MazeCell` (sets `bWallEast = False`)
- `NeighborCell` → `Set Members in S_MazeCell` (sets `bWallWest = False`)

---

## Why this matters

This step handles the case where the chosen neighbor is to the **East** of the current cell.

If that happens:

- the current cell must open its **East wall**
- the neighbor cell must open its **West wall**

> Both cells must agree that the wall between them is gone.

---

## Common mistakes

❌ Connecting East from the end of the North block  
✔️ East should start from `Sequence → Then 1`

---

❌ Using `DeltaY` instead of `DeltaX`  
✔️ East and West use `DeltaX`

---

❌ Setting the wrong wall values  
✔️ For East, use:

- `CurrentCell.bWallEast = False`
- `NeighborCell.bWallWest = False`

---

❌ Forgetting that these are still local struct changes  
✔️ You still need to write `CurrentCell` and `NeighborCell` back into `MazeGrid` later with `Set Array Elem`

---

## Expected result

When `DeltaX == 1`, this step now updates:

- `CurrentCell.bWallEast = False`
- `NeighborCell.bWallWest = False`

using the East path from the `Sequence` node.

---

### Step 4.9 — Check direction: South

If `DeltaY == 1`, then:

- the **current cell loses its South wall**
- the **neighbor cell loses its North wall**

For South, we will use:

- `Sequence → Then 2`

#### Step 4.9.1 — Check if the direction is South

1. From the **function entry node**, drag from the input pin:

   `DeltaY`

2. Search for:

   `==`

3. Choose:

   `Integer == Integer`

4. Set the second input value to:

   `1`

5. Right-click in empty graph space

6. Search for:

   `Branch`

7. Click:

   `Branch`

8. Connect the white execution pin from:

   `Sequence → Then 2`

   to

   `Branch`

9. Connect:

- `DeltaY == 1` → `Branch.Condition`

#### Step 4.9.2 — If True, remove the South wall from the Current Cell

10. Right-click in empty graph space

11. Search for:

`Set Members in S_MazeCell`

12. Click:

`Set Members in S_MazeCell`

13. Connect:

- `CurrentCell` → struct input (left side of the node)

14. In the **Details panel**, enable only:

- `bWallSouth`

15. Set:

- `bWallSouth = False`

16. Connect the white execution pin from:

`Branch.True`

to

`Set Members in S_MazeCell` (CurrentCell)

#### Step 4.9.3 — Remove the North wall from the Neighbor Cell

17. Right-click in empty graph space

18. Search for:

`Set Members in S_MazeCell`

19. Click:

`Set Members in S_MazeCell`

20. Connect:

- `NeighborCell` → struct input (left side of the node)

21. In the **Details panel**, enable only:

- `bWallNorth`

22. Set:

- `bWallNorth = False`

23. Connect the white execution pin from:

`Set Members in S_MazeCell` (CurrentCell)

to

`Set Members in S_MazeCell` (NeighborCell)

---

### Connections recap

**Execution flow:**  
`Set NeighborCell → Sequence → Then 2 → Branch → Set Members in S_MazeCell (CurrentCell) → Set Members in S_MazeCell (NeighborCell)`

**Data flow:**

- `DeltaY` (function input) → `Integer == Integer`
- `DeltaY == 1` → `Branch.Condition`
- `CurrentCell` → `Set Members in S_MazeCell` (sets `bWallSouth = False`)
- `NeighborCell` → `Set Members in S_MazeCell` (sets `bWallNorth = False`)

---

## Why this matters

This step handles the case where the chosen neighbor is **below (South)** of the current cell.

If that happens:

- the current cell must open its **South wall**
- the neighbor cell must open its **North wall**

> Both cells must agree that the wall between them is removed.

---

## Common mistakes

❌ Connecting South from the end of the East block  
✔️ South must start from `Sequence → Then 2`

---

❌ Using `DeltaX` instead of `DeltaY`  
✔️ North and South use `DeltaY`

---

❌ Setting the wrong wall values  
✔️ For South, use:

- `CurrentCell.bWallSouth = False`
- `NeighborCell.bWallNorth = False`

---

❌ Forgetting that these are local struct changes  
✔️ You still need to write both cells back into `MazeGrid` later

---

## Expected result

When `DeltaY == 1`, this step now updates:

- `CurrentCell.bWallSouth = False`
- `NeighborCell.bWallNorth = False`

using the South path from the `Sequence` node.

---

### Step 4.10 — Check direction: West

If `DeltaX == -1`, then:

- the **current cell loses its West wall**
- the **neighbor cell loses its East wall**

For West, we will use:

- `Sequence → Then 3`

#### Step 4.10.1 — Check if the direction is West

1. From the **function entry node**, drag from the input pin:

   `DeltaX`

2. Search for:

   `==`

3. Choose:

   `Integer == Integer`

4. Set the second input value to:

   `-1`

5. Right-click in empty graph space

6. Search for:

   `Branch`

7. Click:

   `Branch`

8. Connect the white execution pin from:

   `Sequence → Then 3`

   to

   `Branch`

9. Connect:

- `DeltaX == -1` → `Branch.Condition`

#### Step 4.10.2 — If True, remove the West wall from the Current Cell

10. Right-click in empty graph space

11. Search for:

`Set Members in S_MazeCell`

12. Click:

`Set Members in S_MazeCell`

13. Connect:

- `CurrentCell` → struct input (left side of the node)

14. In the **Details panel**, enable only:

- `bWallWest`

15. Set:

- `bWallWest = False`

16. Connect the white execution pin from:

`Branch.True`

to

`Set Members in S_MazeCell` (CurrentCell)

#### Step 4.10.3 — Remove the East wall from the Neighbor Cell

17. Right-click in empty graph space

18. Search for:

`Set Members in S_MazeCell`

19. Click:

`Set Members in S_MazeCell`

20. Connect:

- `NeighborCell` → struct input (left side of the node)

21. In the **Details panel**, enable only:

- `bWallEast`

22. Set:

- `bWallEast = False`

23. Connect the white execution pin from:

`Set Members in S_MazeCell` (CurrentCell)

to

`Set Members in S_MazeCell` (NeighborCell)

---

### Connections recap

**Execution flow:**  
`Set NeighborCell → Sequence → Then 3 → Branch → Set Members in S_MazeCell (CurrentCell) → Set Members in S_MazeCell (NeighborCell)`

**Data flow:**

- `DeltaX` (function input) → `Integer == Integer`
- `DeltaX == -1` → `Branch.Condition`
- `CurrentCell` → `Set Members in S_MazeCell` (sets `bWallWest = False`)
- `NeighborCell` → `Set Members in S_MazeCell` (sets `bWallEast = False`)

---

## Why this matters

This step handles the case where the chosen neighbor is to the **West** of the current cell.

If that happens:

- the current cell must open its **West wall**
- the neighbor cell must open its **East wall**

> Both cells must agree that the wall between them is removed.

---

## Common mistakes

❌ Connecting West from the end of the South block  
✔️ West must start from `Sequence → Then 3`

---

❌ Using `DeltaY` instead of `DeltaX`  
✔️ East and West use `DeltaX`

---

❌ Setting the wrong wall values  
✔️ For West, use:

- `CurrentCell.bWallWest = False`
- `NeighborCell.bWallEast = False`

---

❌ Forgetting that these are local struct changes  
✔️ You still need to write both cells back into `MazeGrid` later

---

## Expected result

When `DeltaX == -1`, this step now updates:

- `CurrentCell.bWallWest = False`
- `NeighborCell.bWallEast = False`

using the West path from the `Sequence` node.

---

### Step 4.11 — Write the updated CurrentCell back into MazeGrid

Now that all direction checks have run, we need to write the updated `CurrentCell` back into the `MazeGrid`.

With the Sequence setup, we will add one final execution output that runs **after all direction checks are complete**.

#### Step 4.11.1 — Add Set Array Elem for the Current Cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Set Array Elem`

4. Click:

   `Set Array Elem`

#### Step 4.11.2 — Connect the Current Cell data

5. From the **function entry node**, drag from the input pin:

   `CurrentIndex`

6. Connect:

- `CurrentIndex` → `Index` on `Set Array Elem`

7. Drag `CurrentCell` into the graph as **Get**

8. Connect:

- `CurrentCell` → `Item` on `Set Array Elem`

9. Connect:

- `MazeGrid` → `Target Array` on `Set Array Elem`

#### Step 4.11.3 — Connect execution flow

10. On the `Sequence` node, click **Add Pin** so it creates:

- `Then 4`

11. Connect the white execution pin from:

`Sequence → Then 4`

to

`Set Array Elem` (CurrentCell)

---

### Connections recap

**Execution flow:**  
`Set NeighborCell → Sequence → Then 4 → Set Array Elem (CurrentCell)`

**Data flow:**

- `MazeGrid` → `Set Array Elem.Target Array`
- `CurrentIndex` (function input) → `Set Array Elem.Index`
- `CurrentCell` (updated local variable) → `Set Array Elem.Item`

---

## Why this matters

The `Sequence` node runs each output in order:

- `Then 0` → North
- `Then 1` → East
- `Then 2` → South
- `Then 3` → West
- `Then 4` → Write updated data back

By the time execution reaches `Then 4`, all direction checks have already been evaluated.

> This guarantees that any wall changes made to `CurrentCell` are complete before writing it back into `MazeGrid`.

---

## Common mistakes

❌ Connecting write-back to `Then 3` (West)  
✔️ This breaks the West branch  
✔️ Always use a new pin (`Then 4`) for write-back

---

❌ Forgetting to add the extra Sequence pin  
✔️ You need a dedicated execution path after all direction checks

---

❌ Forgetting to connect `MazeGrid` to `Target Array`  
✔️ `Set Array Elem` must know which array to modify

---

❌ Using the wrong index  
✔️ Use `CurrentIndex` from the function input pin

---

## Expected result

The updated `CurrentCell` is now written back into `MazeGrid` at `CurrentIndex`.

This ensures that all wall changes made during the direction checks are saved correctly.

---

### Step 4.12 — Write the updated NeighborCell back into MazeGrid

Now we need to write the updated `NeighborCell` back into the `MazeGrid` array.

#### Step 4.12.1 — Add Set Array Elem for the Neighbor Cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Set Array Elem`

4. Click:

   `Set Array Elem`

#### Step 4.12.2 — Connect the Neighbor Cell data

5. From the **function entry node**, drag from the input pin:

   `NeighborIndex`

6. Connect:

- `NeighborIndex` → `Index` on `Set Array Elem`

7. Drag `NeighborCell` into the graph as **Get**

8. Connect:

- `NeighborCell` → `Item` on `Set Array Elem`

9. Connect:

- `MazeGrid` → `Target Array` on `Set Array Elem`

#### Step 4.12.3 — Connect execution flow

10. Connect the white execution pin from:

`Set Array Elem` (CurrentCell)

to

`Set Array Elem` (NeighborCell)

---

### Connections recap

**Execution flow:**  
`Set Array Elem (CurrentCell) → Set Array Elem (NeighborCell)`

**Data flow:**

- `MazeGrid` → `Set Array Elem.Target Array`
- `NeighborIndex` (function input) → `Set Array Elem.Index`
- `NeighborCell` (updated local variable) → `Set Array Elem.Item`

---

## Why this matters

Up to this point, you have only modified the local variable:

- `NeighborCell`

That does **not** automatically update the array.

> This step writes the updated `NeighborCell` back into `MazeGrid`.

Both cells must be written back correctly, or the wall removal will only exist on one side.

---

## Common mistakes

❌ Using `CurrentIndex` here  
✔️ This step must use `NeighborIndex`

---

❌ Using the old struct instead of `NeighborCell`  
✔️ Connect the updated local variable into `Item`

---

❌ Forgetting to connect this after the first `Set Array Elem`  
✔️ Write back the current cell first, then the neighbor cell

---

## Expected result

The updated `NeighborCell` is now written back into `MazeGrid` at `NeighborIndex`.

Your `RemoveWallBetween` function now correctly stores both sides of the wall removal.

---

### Screenshot Placeholder

**[Screenshot: Full RemoveWallBetween function showing Set CurrentCell, Set NeighborCell, Sequence, all four direction checks, Then 4, and both Set Array Elem nodes]**

---

<a href="{{ '/assets/images/blog/Part2-Step-4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-4.png' | relative_url }}" alt="RemoveWallBetween function updating both current and neighbor cells and writing them back to MazeGrid" class="post-image">
</a>

---

### Step 4.13 — Full function overview

#### Step 4.13.1 — Review the full execution flow

Before moving on, step back and look at the complete execution flow for `RemoveWallBetween`.

Your function should now look like this:

`RemoveWallBetween  
→ Set CurrentCell  
→ Set NeighborCell  
→ Sequence  
   Then 0 → North check  
   Then 1 → East check  
   Then 2 → South check  
   Then 3 → West check  
   Then 4 → Set Array Elem (CurrentCell)  
→ Set Array Elem (NeighborCell)`

> This full overview is important because it shows how the direction checks and the write-back stage fit together in one complete system.

---

### Screenshot Placeholder

**[Screenshot: Zoomed-out full RemoveWallBetween function overview with labels for Sequence outputs Then 0 through Then 4]**

---

# Step 5 — Create the `GenerateMaze` Function

Now we build the main maze generation logic.

---

## What this step does

This function:

- picks a random starting cell
- marks it visited
- uses a stack to track the current path
- chooses unvisited neighbors
- removes walls between cells
- backtracks when stuck

> This creates the full maze in memory.

---

## Instructions

### Step 5.1 — Create the function

#### Step 5.1.1 — Add the function

1. Create a new function named:

   `GenerateMaze`

---

### Step 5.2 — Add local variables

#### Step 5.2.1 — Create local variables

Create these **Local Variables**:

- `Stack` (Integer Array)
- `CurrentIndex` (Integer)
- `Neighbors` (Array of `S_NeighborInfo`)
- `ChosenNeighbor` (`S_NeighborInfo`)
- `StackTopIndex` (Integer)
- `RandomNeighborIndex` (Integer)

---

### Step 5.3 — Choose the starting cell

#### Step 5.3.1 — Calculate the max index

1. Drag `MazeWidth` into the graph as **Get**

2. Drag `MazeHeight` into the graph as **Get**

3. Multiply them using:

   `Integer * Integer`

4. Subtract `1` using:

   `Integer - Integer`

#### Step 5.3.2 — Pick a random starting index

5. Drag `RandomStream` into the graph as **Get**

6. Right-click and search for:

   `Random Integer in Range from Stream`

7. Connect:

- `Min = 0`
- `Max = MazeWidth * MazeHeight - 1`
- `Stream = RandomStream`

#### Step 5.3.3 — Store the starting index

8. Drag `CurrentIndex` into the graph as **Set**

9. Connect the random result into `Set CurrentIndex`

10. Connect the white execution pin from:

`GenerateMaze`

to

`Set CurrentIndex`

---

### Connections recap

**Execution flow:**  
`GenerateMaze → Set CurrentIndex`

**Data flow:**

- `MazeWidth × MazeHeight - 1` → max random index
- `RandomStream` → random selection
- random result → `CurrentIndex`

---

## Why this matters

The maze generator needs somewhere to begin.

Using a seeded random start keeps the maze reproducible while still feeling random.

---

## Common mistakes

❌ Forgetting to subtract `1` from total cell count  
✔️ Arrays are zero-based, so the last valid index is total cells minus one

---

❌ Using a normal random node instead of the stream version  
✔️ Use `Random Integer in Range from Stream`

---

## Expected result

You now have a valid random starting cell stored in `CurrentIndex`.

---

### Step 5.4 — Mark the starting cell as visited

#### Step 5.4.1 — Read the starting cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Connect:

- `CurrentIndex` → `Index`

#### Step 5.4.2 — Set bVisited to True

6. Drag from the output struct

7. Search for:

   `Set Members in S_MazeCell`

8. Click:

   `Set Members in S_MazeCell`

9. In the node details, enable only:

- `bVisited`

10. Set:

- `bVisited = True`

#### Step 5.4.3 — Write the updated cell back

11. Drag `MazeGrid` into the graph as **Get**

12. Drag from the `MazeGrid` pin

13. Search for:

`Set Array Elem`

14. Click:

`Set Array Elem`

15. Connect:

- `MazeGrid` → `Target Array`
- `CurrentIndex` → `Index`
- output of `Set Members in S_MazeCell` → `Item`

16. Connect the white execution pin from:

`Set CurrentIndex`

to

`Set Array Elem`

---

### Connections recap

**Execution flow:**  
`Set CurrentIndex → Set Array Elem`

**Data flow:**

- `CurrentIndex` → `MazeGrid.Get`
- returned cell → `Set Members in S_MazeCell`
- updated cell → `Set Array Elem`
- `CurrentIndex` → `Set Array Elem.Index`

---

## Why this matters

If the starting cell is not marked visited, the algorithm may treat it as unvisited later and break the maze logic.

---

## Common mistakes

❌ Changing `bVisited` but forgetting to write the struct back into `MazeGrid`  
✔️ Use `Set Array Elem`

---

## Expected result

The starting cell is now marked as visited in `MazeGrid`.

---

### Step 5.5 — Add the starting cell to the Stack

#### Step 5.5.1 — Add the stack entry

1. Drag `Stack` into the graph as **Get**

2. Drag from the `Stack` pin

3. Search for:

   `Add`

4. Click:

   `Add`

5. Connect the white execution pin from:

   `Set Array Elem`

   to

   `Add`

6. Connect:

- `CurrentIndex` → `Add.Item`

---

### Connections recap

**Execution flow:**  
`Set Array Elem → Stack.Add`

**Data flow:**

- `CurrentIndex` → `Stack.Add`

---

## Why this matters

The stack is what allows the algorithm to move forward and backtrack correctly.

Without it, this would not be a depth-first search.

---

## Common mistakes

❌ Forgetting to add the start cell to the stack  
✔️ The loop depends on the stack having its first entry

---

## Expected result

The starting cell is now the first item in `Stack`.

---

### Step 5.6 — Add the While Loop

#### Step 5.6.1 — Add the While Loop node

1. Right-click in empty graph space

2. Search for:

   `While Loop`

3. Click:

   `While Loop`

#### Step 5.6.2 — Connect execution flow

4. Connect the white execution pin from:

   `Add` on `Stack`

   to

   `While Loop`

#### Step 5.6.3 — Set the condition

5. Drag `Stack` into the graph as **Get**

6. Drag from the `Stack` pin

7. Search for:

   `Length`

8. Drag from the `Length` result

9. Search for:

   `>`

10. Choose:

`Integer > Integer`

11. Set the second input to:

`0`

12. Connect the result into:

`While Loop.Condition`

---

### Connections recap

**Execution flow:**  
`Stack.Add → While Loop`

**Data flow:**

- `Stack.Length > 0` → `While Loop.Condition`

---

## Why this matters

This is the main control loop for the whole maze algorithm.

It continues until there is nowhere left to go.

---

## Common mistakes

❌ Leaving the condition disconnected  
✔️ The `While Loop` must know when to stop

---

❌ Using `>= 0` instead of `> 0`  
✔️ A length of 0 means the stack is empty and generation is finished

---

## Expected result

Your maze generator now has a loop that runs while there are still cells in the stack.

---

### Step 5.7 — Find the top of the Stack

#### Step 5.7.1 — Calculate StackTopIndex

1. Drag `Stack` into the graph as **Get**

2. Drag from the `Stack` pin

3. Search for:

   `Length`

4. Drag from the `Length` result

5. Search for:

   `-`

6. Choose:

   `Integer - Integer`

7. Set the second input to:

   `1`

8. Drag `StackTopIndex` into the graph as **Set**

9. Connect the subtraction result into:

   `Set StackTopIndex`

10. Connect the white execution pin from:

`While Loop.Loop Body`

to

`Set StackTopIndex`

#### Step 5.7.2 — Read the current stack value

11. Drag `Stack` into the graph as **Get**

12. Drag from the `Stack` pin

13. Search for:

`Get (a copy)`

14. Click:

`Get (a copy)`

15. Connect:

- `StackTopIndex` → `Index`

16. Drag `CurrentIndex` into the graph as **Set**

17. Connect the result of `Get (a copy)` into:

`Set CurrentIndex`

18. Connect the white execution pin from:

`Set StackTopIndex`

to

`Set CurrentIndex`

---

### Connections recap

**Execution flow:**  
`While Loop.Loop Body → Set StackTopIndex → Set CurrentIndex`

**Data flow:**

- `Stack.Length - 1` → `StackTopIndex`
- `Stack[StackTopIndex]` → `CurrentIndex`

---

## Why this matters

The top of the stack represents the cell we are currently exploring.

---

## Common mistakes

❌ Using index `0` instead of the last index  
✔️ This would break the depth-first search behavior

---

## Expected result

At the start of each loop pass, `CurrentIndex` now holds the current active cell.

---

### Step 5.8 — Get the current cell’s unvisited neighbors

#### Step 5.8.1 — Call the helper function

1. Right-click in empty graph space

2. Search for:

   `GetUnvisitedNeighbors`

3. Click the function call

4. Connect:

- `CurrentIndex` → function input

#### Step 5.8.2 — Store the result

5. Drag `Neighbors` into the graph as **Set**

6. Connect the return value of `GetUnvisitedNeighbors` into:

   `Set Neighbors`

7. Connect the white execution pin from:

   `Set CurrentIndex`

   to

   `Set Neighbors`

---

### Connections recap

**Execution flow:**  
`Set CurrentIndex → Set Neighbors`

**Data flow:**

- `CurrentIndex` → `GetUnvisitedNeighbors`
- returned neighbor array → `Neighbors`

---

## Why this matters

The algorithm can only move if valid unvisited neighbors exist.

---

## Common mistakes

❌ Forgetting to store the returned array  
✔️ Save it into `Neighbors`

---

## Expected result

You now have all valid unvisited neighbor options for the current cell.

---

### Step 5.9 — Check whether any neighbors exist

#### Step 5.9.1 — Check the length

1. Drag `Neighbors` into the graph as **Get**

2. Drag from the `Neighbors` pin

3. Search for:

   `Length`

4. Drag from the `Length` result

5. Search for:

   `>`

6. Choose:

   `Integer > Integer`

7. Set the second value to:

   `0`

#### Step 5.9.2 — Add the Branch

8. Right-click in empty graph space

9. Search for:

   `Branch`

10. Click:

`Branch`

11. Connect the white execution pin from:

`Set Neighbors`

to

`Branch`

12. Connect:

- `Length(Neighbors) > 0` → `Branch.Condition`

---

### Connections recap

**Execution flow:**  
`Set Neighbors → Branch`

**Data flow:**

- `Neighbors.Length > 0` → `Branch.Condition`

---

## Why this matters

This is the main decision point in the algorithm.

- **True** = move forward
- **False** = backtrack

---

## Common mistakes

❌ Forgetting this branch  
✔️ The algorithm must decide between progressing and backtracking

---

## Expected result

Your function now splits into two paths:

- **True** → choose a neighbor
- **False** → remove the top stack entry

---

### Step 5.10 — If neighbors exist, choose one randomly

#### Step 5.10.1 — Calculate the max neighbor index

1. Drag `Neighbors` into the graph as **Get**

2. Drag from the `Neighbors` pin

3. Search for:

   `Length`

4. Drag from the `Length` result

5. Search for:

   `-`

6. Choose:

   `Integer - Integer`

7. Set the second input to:

   `1`

#### Step 5.10.2 — Pick a random neighbor index

8. Drag `RandomStream` into the graph as **Get**

9. Right-click in empty graph space

10. Search for:

`Random Integer in Range from Stream`

11. Click:

`Random Integer in Range from Stream`

12. Connect:

- `Min = 0`
- `Length(Neighbors) - 1` → `Max`
- `RandomStream` → `Stream`

13. Drag `RandomNeighborIndex` into the graph as **Set**

14. Connect the result of the random node into:

`Set RandomNeighborIndex`

15. Connect the white execution pin from:

`Branch.True`

to

`Set RandomNeighborIndex`

#### Step 5.10.3 — Read the chosen neighbor

16. Drag `Neighbors` into the graph as **Get**

17. Drag from the `Neighbors` pin

18. Search for:

`Get (a copy)`

19. Click:

`Get (a copy)`

20. Connect:

- `RandomNeighborIndex` → `Index`

21. Drag `ChosenNeighbor` into the graph as **Set**

22. Connect the returned struct into:

`Set ChosenNeighbor`

23. Connect the white execution pin from:

`Set RandomNeighborIndex`

to

`Set ChosenNeighbor`

---

### Connections recap

**Execution flow:**  
`Branch.True → Set RandomNeighborIndex → Set ChosenNeighbor`

**Data flow:**

- `Neighbors.Length - 1` → max random neighbor index
- `RandomStream` → random neighbor selection
- random result → `RandomNeighborIndex`
- `Neighbors[RandomNeighborIndex]` → `ChosenNeighbor`

---

## Why this matters

If more than one valid neighbor exists, the algorithm must choose one randomly to create maze variation.

---

## Common mistakes

❌ Using `Neighbors.Length` as the max value  
✔️ Use `Neighbors.Length - 1`

---

❌ Forgetting to store the chosen neighbor  
✔️ Save it into `ChosenNeighbor`

---

## Expected result

You now have one random valid neighbor stored in `ChosenNeighbor`.

---

### Step 5.11 — Remove the wall between the Current Cell and the ChosenNeighbor

#### Step 5.11.1 — Call RemoveWallBetween

1. Right-click in empty graph space

2. Search for:

   `RemoveWallBetween`

3. Click the function call

4. Connect:

- `CurrentIndex` → `CurrentIndex`
- `ChosenNeighbor.CellIndex` → `NeighborIndex`
- `ChosenNeighbor.DeltaX` → `DeltaX`
- `ChosenNeighbor.DeltaY` → `DeltaY`

5. Connect the white execution pin from:

   `Set ChosenNeighbor`

   to

   `RemoveWallBetween`

---

### Connections recap

**Execution flow:**  
`Set ChosenNeighbor → RemoveWallBetween`

**Data flow:**

- `CurrentIndex` → current cell input
- `ChosenNeighbor.CellIndex` → neighbor cell input
- `ChosenNeighbor.DeltaX` → direction input
- `ChosenNeighbor.DeltaY` → direction input

---

## Why this matters

This is the moment where the maze path is physically carved into your data.

---

## Common mistakes

❌ Sending the wrong direction values  
✔️ Use the `DeltaX` and `DeltaY` stored in `ChosenNeighbor`

---

## Expected result

The wall between the current cell and the chosen neighbor is now removed.

---

### Step 5.12 — Mark the ChosenNeighbor as visited

#### Step 5.12.1 — Read the chosen cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Connect:

- `ChosenNeighbor.CellIndex` → `Index`

#### Step 5.12.2 — Set bVisited to True

6. Drag from the returned struct

7. Search for:

   `Set Members in S_MazeCell`

8. Click:

   `Set Members in S_MazeCell`

9. Enable only:

- `bVisited`

10. Set:

- `bVisited = True`

#### Step 5.12.3 — Write the updated cell back

11. Drag `MazeGrid` into the graph as **Get**

12. Drag from the `MazeGrid` pin

13. Search for:

`Set Array Elem`

14. Click:

`Set Array Elem`

15. Connect:

- `MazeGrid` → `Target Array`
- `ChosenNeighbor.CellIndex` → `Index`
- updated struct → `Item`

16. Connect the white execution pin from:

`RemoveWallBetween`

to

`Set Array Elem`

---

### Connections recap

**Execution flow:**  
`RemoveWallBetween → Set Array Elem`

**Data flow:**

- `ChosenNeighbor.CellIndex` → `MazeGrid.Get`
- returned cell → `Set Members in S_MazeCell`
- updated cell → `Set Array Elem`
- `ChosenNeighbor.CellIndex` → `Set Array Elem.Index`

---

## Why this matters

Once the algorithm enters a cell, that cell must be marked visited.

---

## Common mistakes

❌ Forgetting to update `bVisited`  
✔️ The algorithm depends on visited tracking to work correctly

---

## Expected result

The chosen neighbor is now marked as visited in `MazeGrid`.

---

### Step 5.13 — Push the ChosenNeighbor onto the Stack

#### Step 5.13.1 — Add the chosen neighbor to Stack

1. Drag `Stack` into the graph as **Get**

2. Drag from the `Stack` pin

3. Search for:

   `Add`

4. Click:

   `Add`

5. Connect the white execution pin from:

   `Set Array Elem`

   to

   `Add`

6. Connect:

- `ChosenNeighbor.CellIndex` → `Add.Item`

---

### Connections recap

**Execution flow:**  
`Set Array Elem → Stack.Add`

**Data flow:**

- `ChosenNeighbor.CellIndex` → `Stack.Add`

---

## Why this matters

This is what pushes the algorithm deeper into the maze path.

---

## Common mistakes

❌ Forgetting this step  
✔️ Without it, the algorithm will not continue correctly

---

## Expected result

The chosen neighbor is now the new top of the stack.

---

### Step 5.14 — If no neighbors exist, backtrack

#### Step 5.14.1 — Remove the top stack entry

From the **False** output of the Branch:

1. Drag `Stack` into the graph as **Get**

2. Drag from the `Stack` pin

3. Search for:

   `Remove Index`

4. Click:

   `Remove Index`

5. Connect:

- `StackTopIndex` → `Index`

6. Connect the white execution pin from:

   `Branch.False`

   to

   `Remove Index`

---

### Connections recap

**Execution flow:**  
`Branch.False → Stack.RemoveIndex`

**Data flow:**

- `StackTopIndex` → `Remove Index.Index`

---

## Why this matters

Backtracking is what lets the algorithm finish the maze instead of stopping at the first dead end.

---

## Common mistakes

❌ Removing the wrong index  
✔️ Remove `StackTopIndex`, which is the current top of the stack

---

## Expected result

When a dead end is reached, the current cell is removed from the stack so the algorithm can backtrack.

---

### Final Connections recap for `GenerateMaze`

**Execution flow:**  
`GenerateMaze → Set CurrentIndex → Mark Start Visited → Stack.Add(Start) → While Loop → Set StackTopIndex → Set CurrentIndex → Set Neighbors → Branch`

**If Branch is True:**  
`Branch.True → Set RandomNeighborIndex → Set ChosenNeighbor → RemoveWallBetween → Mark ChosenNeighbor Visited → Stack.Add(ChosenNeighbor)`

**If Branch is False:**  
`Branch.False → Stack.RemoveIndex(StackTopIndex)`

**Data flow:**

- `MazeWidth × MazeHeight - 1` → start-cell max index
- `RandomStream` → start-cell random selection
- random result → `CurrentIndex`
- `CurrentIndex` → `MazeGrid` lookup for start cell
- updated start cell → `Set Array Elem`
- `CurrentIndex` → `Stack.Add`
- `Stack.Length - 1` → `StackTopIndex`
- `Stack[StackTopIndex]` → `CurrentIndex`
- `CurrentIndex` → `GetUnvisitedNeighbors`
- returned array → `Neighbors`
- `Neighbors.Length - 1` → random neighbor max index
- `RandomStream` → random neighbor selection
- random result → `RandomNeighborIndex`
- `Neighbors[RandomNeighborIndex]` → `ChosenNeighbor`
- `ChosenNeighbor` fields → `RemoveWallBetween`
- `ChosenNeighbor.CellIndex` → visited update
- `ChosenNeighbor.CellIndex` → `Stack.Add`
- `StackTopIndex` → `Stack.RemoveIndex`

---

## Why this matters

This is the full maze generation algorithm.

It explores outward, carves passages, and backtracks when needed until the entire maze has been generated.

> This is the step that makes your maze real.

---

## Common mistakes

❌ Forgetting to mark the start cell visited  
✔️ Do this before the loop begins

---

❌ Forgetting to mark the chosen neighbor visited  
✔️ Do this right after removing the wall

---

❌ Forgetting to push the chosen neighbor onto the stack  
✔️ That is how the DFS continues

---

❌ Removing the wrong stack entry when backtracking  
✔️ Use `StackTopIndex`

---

## Expected result

Your `GenerateMaze` function now generates a full maze in memory using a stack-based depth-first search system.

---

### Screenshot Placeholder

**[Screenshot: Full GenerateMaze function showing start cell selection, visited update, stack setup, While Loop, neighbor selection, RemoveWallBetween call, and backtracking]**

---

# Step 6 — Call the functions in order

Now we connect the completed functions back into the Construction Script.

---

## What this step does

This puts the full maze setup in the correct order.

---

## Instructions

### Step 6.1 — Return to the Construction Script

#### Step 6.1.1 — Open the Construction Script again

Go back to your **Construction Script**.

---

### Step 6.2 — Connect the function calls

#### Step 6.2.1 — Add InitializeGrid and GenerateMaze

After `Set RandomStream`, add:

1. `InitializeGrid`

2. `GenerateMaze`

#### Step 6.2.2 — Connect execution flow

Connect the white execution pins in this order:

- `Set RandomStream` → `InitializeGrid`
- `InitializeGrid` → `GenerateMaze`

---

### Connections recap

**Execution flow:**  
`Construction Script → Clear Instances (FloorHISM) → Clear Instances (WallHISM) → Clear (MazeGrid) → Set RandomStream → InitializeGrid → GenerateMaze`

**Data flow:**

- `MazeSeed` → `RandomStream`
- `InitializeGrid` → fills `MazeGrid`
- `GenerateMaze` → modifies `MazeGrid` by marking cells visited and removing walls

---

## Why this matters

The order must be correct.

You cannot generate the maze until:

- old data is cleared
- the random stream is set
- the grid has been created

> If the order is wrong, the maze logic breaks.

---

## Common mistakes

❌ Calling `GenerateMaze` before `InitializeGrid`  
✔️ The grid must exist first

---

❌ Forgetting to connect one of the function calls into the white execution chain  
✔️ Blueprint functions only run when the execution wire reaches them

---

## Expected result

Your Construction Script now builds the full maze in memory every time the Blueprint runs.

---

### Screenshot Placeholder

**[Screenshot: Construction Script showing Set RandomStream connected to InitializeGrid, then GenerateMaze]**

---

<a href="{{ '/assets/images/blog/Part2-Step-6.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-6.png' | relative_url }}" alt="Construction Script calling InitializeGrid and GenerateMaze after clearing data and setting RandomStream" class="post-image">
</a>

---

# What You Have Built So Far

At this point, your system can now:

- create a full grid of maze cells
- calculate row and column positions
- find valid unvisited neighbors
- remove walls between connected cells
- generate a complete maze in memory using DFS with backtracking

> Your maze now exists completely in memory. It just is not visible yet.

---

## Up Next

In Part 3, we will:

- read the maze data
- convert grid coordinates into world positions
- place visible meshes into the level

👉 This is where the maze finally becomes visible.

---
