---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 2 (Maze Generation Logic)"
date: 2026-04-20
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
- `S_NeighbourInfo`

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

### Step 1 — Open the Construction Script

1. Open `BP_MazeGenerator`

2. In the left panel, click:

   `Construction Script`

---

### Step 2 — Clear old floor instances

1. Drag `FloorHISM` from the **Components** panel into the graph as **Get**

2. Drag from the `FloorHISM` pin

3. Search for:

   `Clear Instances`

4. Click:

   `Clear Instances`

---

### Step 3 — Clear old wall instances

1. Drag `WallHISM` from the **Components** panel into the graph as **Get**

2. Drag from the `WallHISM` pin

3. Search for:

   `Clear Instances`

4. Click:

   `Clear Instances`

5. Connect the white execution pin from:

   `Construction Script`

   to

   `Clear Instances` on `FloorHISM`

6. Connect the white execution pin from:

   `Clear Instances` on `FloorHISM`

   to

   `Clear Instances` on `WallHISM`

---

### Step 4 — Clear the MazeGrid array

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Clear`

4. Click:

   `Clear`

5. Connect the white execution pin from:

   `Clear Instances` on `WallHISM`

   to

   `Clear` on `MazeGrid`

---

### Step 5 — Create and store the RandomStream

1. Drag `MazeSeed` into the graph as **Get**

2. Drag from the `MazeSeed` pin

3. Search for:

   `Make Random Stream`

4. Click:

   `Make Random Stream`

5. Drag `RandomStream` into the graph as **Set**

6. Connect the output of `Make Random Stream` into the value pin on `Set RandomStream`

**_Pro tip: If you drag `Random Stream` and drop it on the `Return Value` pin, Blueprints wiil create the Set node automatically._**

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

### Step 1 — Create the function

1. In the **My Blueprint** panel, find **Functions**

2. Click the **+ Function** button

3. Name the function:

   `InitializeGrid`

4. Press **Enter**

---

### Step 2 — Clear the MazeGrid array inside the function

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Clear`

4. Click:

   `Clear`

5. Connect the white execution pin from:

   `InitializeGrid`

   to

   `Clear` on `MazeGrid`

---

### Step 3 — Add a For Loop

1. Right-click in empty graph space

2. Search for:

   `For Loop`

3. Click:

   `For Loop`

4. Connect the white execution pin from:

   `Clear` on `MazeGrid`

   to

   `For Loop`

---

### Step 4 — Calculate the Last Index

We want the loop to run once for every cell in the maze.

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

7. Drag from the result of the multiply node

8. Search for:

   `-`

9. Choose:

   `Integer - Integer`

10. Set the second input to:

`1`

11. Connect the result into:

`For Loop.Last Index`

12. Set:

`For Loop.First Index = 0`

---

### Step 5 — Calculate Row

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

### Step 6 — Calculate Col

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

### Step 7 — Create the MazeCell struct

1. Right-click in empty graph space

2. Search for:

   `Make S_MazeCell`

3. Click:

   `Make S_MazeCell`

4. Connect:

- the divide result → `Row`
- the modulo result → `Col`

5. Set:

- `bVisited = False`
- `bWallNorth = True`
- `bWallEast = True`
- `bWallSouth = True`
- `bWallWest = True`

---

### Step 8 — Add the cell to MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Add`

4. Click:

   `Add`

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

### Step 1 — Create the function

1. In the **Functions** section, click **+ Function**

2. Name it:

   `GetUnvisitedNeighbors`

---

### Step 2 — Add input and output

In the **Details** panel for the function:

#### Add input:

- `CurrentIndex` (Integer)

#### Add output:

- `Neighbors` (Array of `S_NeighborInfo`)

---

### Step 3 — Add local variables

In the function, create these **Local Variables**:

- `CurrentRow` (Integer)
- `CurrentCol` (Integer)
- `LocalNeighbors` (Array of `S_NeighborInfo`)
- `TestIndex` (Integer)

---

### Step 4 — Calculate CurrentRow

1. Drag `CurrentIndex` into the graph as **Get**

2. Drag `MazeWidth` into the graph as **Get**

3. Drag from `CurrentIndex`

4. Search for:

   `/`

5. Choose:

   `Integer / Integer`

6. Connect:

- `CurrentIndex` → first input
- `MazeWidth` → second input

7. Drag `CurrentRow` into the graph as **Set**

8. Connect the result into `Set CurrentRow`

9. Connect the white execution pin from:

   `GetUnvisitedNeighbours`

   to

   `Set CurrentRow`

---

### Step 5 — Calculate CurrentCol

1. Drag from `CurrentIndex`

2. Search for:

   `%`

3. Choose:

   `Percent (Integer)`

4. Drag `MazeWidth` into the graph as **Get**

5. Connect:

- `CurrentIndex` → first input
- `MazeWidth` → second input

6. Drag `CurrentCol` into the graph as **Set**

7. Connect the modulo result into `Set CurrentCol`

8. Connect the white execution pin from:

   `Set CurrentRow`

   to

   `Set CurrentCol`

---

## Step 3.1 — Check the North neighbor

CurrentRow > 0 → TestIndex = CurrentIndex - MazeWidth → MazeGrid[TestIndex] → NOT bVisited → Make S_NeighbourInfo (0, -1) → Add to LocalNeighbours

### Instructions

1. Drag `CurrentRow` into the graph as **Get**

2. Drag from the `CurrentRow` pin

3. Search for:

   `>`

4. Choose:

   `Integer > Integer`

5. Set the second input to:

   `0`

6. Right-click and add a:

   `Branch`

7. Connect the white execution pin from:

   `Set CurrentCol`

   to

   `Branch`

8. Connect:

- `CurrentRow > 0` → `Branch.Condition`

---

If the result is **True**, the north neighbor is inside bounds.

9. Drag `CurrentIndex` into the graph as **Get**

10. Drag `MazeWidth` into the graph as **Get**

11. Use:

`Integer - Integer`

12. Connect:

- `CurrentIndex` → first input
- `MazeWidth` → second input

13. Drag `TestIndex` into the graph as **Set**

14. Connect the result into `Set TestIndex`

15. Connect the white execution pin from:

`Branch.True`

to

`Set TestIndex`

---

Now read the north cell.

16. Drag `MazeGrid` into the graph as **Get**

17. Drag from `MazeGrid`

18. Search for:

`Get (a copy)`

19. Connect:

- `TestIndex` → `Index`

20. Drag from the output of `Get (a copy)`

21. Search for:

`Break S_MazeCell`

22. Click:

`Break S_MazeCell`

---

Now check if it is unvisited.

23. Drag from `bVisited`

24. Search for:

`NOT Boolean`

25. Click it

26. Add another:

`Branch`

27. Connect the white execution pin from:

`Set TestIndex`

to

this second `Branch`

28. Connect:

- `NOT bVisited` → `Branch.Condition`

---

If that second branch is **True**, add the neighbor.

29. Right-click and search for:

`Make S_NeighborInfo`

30. Set:

- `CellIndex = TestIndex`
- `DeltaX = 0`
- `DeltaY = -1`

31. Drag `LocalNeighbors` into the graph as **Get**

32. Drag from `LocalNeighbors`

33. Search for:

`Add`

34. Click:

`Add`

35. Connect the white execution pin from:

second `Branch.True`

to

`Add`

36. Connect:

- `Make S_NeighbourInfo` → `Add.Item`

---

You will repeat the pattern for each direction, the final output will look like this:

Set CurrentCol
↓
[Branch: CurrentRow > 0] (North Bounds)
├── True → (North Logic) →──────────┐
└── False →──────────────────────────┘
↓
[Branch: CurrentCol < MazeWidth - 1] (East Bounds)
├── True → (East Logic) →──────────┐
└── False →─────────────────────────┘
↓
[Branch: CurrentRow < MazeHeight - 1] (South Bounds)
├── True → (South Logic) →──────────┐
└── False →──────────────────────────┘
↓
[Branch: CurrentCol > 0] (West Bounds)
├── True → (West Logic) →──────────┐
└── False →─────────────────────────┘
↓
Return Node

---

## Step 3.2 — Check the East neighbor

Repeat the same pattern, but use these values:

- Bounds check: `CurrentCol < MazeWidth - 1`
- Index formula: `CurrentIndex + 1`
- `DeltaX = 1`
- `DeltaY = 0`

Connect the white execution pin from the north section into the east section so the function continues cleanly.

---

## Step 3.3 — Check the South neighbor

Repeat the same pattern, but use these values:

- Bounds check: `CurrentRow < MazeHeight - 1`
- Index formula: `CurrentIndex + MazeWidth`
- `DeltaX = 0`
- `DeltaY = 1`

Connect the white execution pin from the east section into the south section.

---

## Step 3.4 — Check the West neighbor

Repeat the same pattern, but use these values:

- Bounds check: `CurrentCol > 0`
- Index formula: `CurrentIndex - 1`
- `DeltaX = -1`
- `DeltaY = 0`

Connect the white execution pin from the south section into the west section.

---

## Step 3.5 — Return the LocalNeighbours array

1. Drag your **Return Node** into view

2. Drag `LocalNeighbors` into the graph as **Get**

3. Connect:

- `LocalNeighbors` → `Neighbors` on the Return Node

4. Connect the white execution pin from the final west section into the Return Node

---

### Connections recap

**Execution flow:**  
`GetUnvisitedNeighbours → Set CurrentRow → Set CurrentCol → Check North → Check East → Check South → Check West → Return`

**Data flow:**

- `CurrentIndex / MazeWidth` → `CurrentRow`
- `CurrentIndex % MazeWidth` → `CurrentCol`
- Neighbor index formulas → `TestIndex`
- `MazeGrid[TestIndex]` → `Break S_MazeCell`
- Valid unvisited neighbor data → `Make S_NeighbourInfo`
- `Make S_NeighbourInfo` → `LocalNeighbours.Add`
- `LocalNeighbours` → Return value `Neighbours`

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
✔️ `LocalNeighbours` must connect into the Return Node

---

## Expected result

Your `GetUnvisitedNeighbours` function now returns all valid unvisited neighbors for any current cell.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}" alt="GetUnvisitedNeighbours function checking north east south and west neighbors and returning valid S_NeighbourInfo entries" class="post-image">
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

### Step 1 — Create the function

1. Create a new function named:

   `RemoveWallBetween`

---

### Step 2 — Add inputs

Add these inputs:

- `CurrentIndex` (Integer)
- `NeighbourIndex` (Integer)
- `DeltaX` (Integer)
- `DeltaY` (Integer)

---

### Step 3 — Add local variables

Create these **Local Variables**:

- `CurrentCell` (`S_MazeCell`)
- `NeighbourCell` (`S_MazeCell`)

---

### Step 4 — Read the current cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from `MazeGrid`

3. Search for:

   `Get (a copy)`

4. Connect:

- `CurrentIndex` → `Index`

5. Drag `CurrentCell` into the graph as **Set**

6. Connect the output into `Set CurrentCell`

7. Connect the white execution pin from:

   `RemoveWallBetween`

   to

   `Set CurrentCell`

---

### Step 5 — Read the neighbor cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from `MazeGrid`

3. Search for:

   `Get (a copy)`

4. Connect:

- `NeighbourIndex` → `Index`

5. Drag `NeighbourCell` into the graph as **Set**

6. Connect the output into `Set NeighbourCell`

7. Connect the white execution pin from:

   `Set CurrentCell`

   to

   `Set NeighbourCell`

---

### Step 6 — Check direction: North

If `DeltaY == -1`, then:

- current cell loses its north wall
- neighbor cell loses its south wall

1. Drag `DeltaY` into the graph as **Get**

2. Drag from `DeltaY`

3. Search for:

   `==`

4. Choose:

   `Integer == Integer`

5. Set the second value to:

   `-1`

6. Add a `Branch`

7. Connect the white execution pin from:

   `Set NeighbourCell`

   to

   `Branch`

8. Connect:

- `DeltaY == -1` → `Branch.Condition`

---

If True:

9. Drag `CurrentCell` into the graph as **Set Members in S_MazeCell**

10. Enable only:

- `bWallNorth`

11. Set:

- `bWallNorth = False`

12. Connect the white execution pin from:

`Branch.True`

to

`Set Members in S_MazeCell` for `CurrentCell`

---

13. Drag `NeighbourCell` into the graph as **Set Members in S_MazeCell**

14. Enable only:

- `bWallSouth`

15. Set:

- `bWallSouth = False`

16. Connect the white execution pin from:

`Set Members in S_MazeCell` for `CurrentCell`

to

`Set Members in S_MazeCell` for `NeighbourCell`

---

### Step 7 — Check direction: East

Repeat the same pattern using:

- `DeltaX == 1`
- Current cell: `bWallEast = False`
- Neighbor cell: `bWallWest = False`

---

### Step 8 — Check direction: South

Repeat the same pattern using:

- `DeltaY == 1`
- Current cell: `bWallSouth = False`
- Neighbor cell: `bWallNorth = False`

---

### Step 9 — Check direction: West

Repeat the same pattern using:

- `DeltaX == -1`
- Current cell: `bWallWest = False`
- Neighbor cell: `bWallEast = False`

---

### Step 10 — Write the updated current cell back into MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from `MazeGrid`

3. Search for:

   `Set Array Elem`

4. Click:

   `Set Array Elem`

5. Connect:

- `CurrentIndex` → `Index`
- updated `CurrentCell` → `Item`

---

### Step 11 — Write the updated neighbor cell back into MazeGrid

1. Add another:

   `Set Array Elem`

2. Connect:

- `MazeGrid` → Target Array
- `NeighbourIndex` → `Index`
- updated `NeighbourCell` → `Item`

3. Connect the white execution pin from the first `Set Array Elem` into the second one

---

### Connections recap

**Execution flow:**  
`RemoveWallBetween → Set CurrentCell → Set NeighbourCell → Direction Checks → Set Array Elem (CurrentCell) → Set Array Elem (NeighbourCell)`

**Data flow:**

- `MazeGrid[CurrentIndex]` → `CurrentCell`
- `MazeGrid[NeighbourIndex]` → `NeighbourCell`
- `DeltaX` and `DeltaY` → direction checks
- Updated `CurrentCell` → `Set Array Elem` at `CurrentIndex`
- Updated `NeighbourCell` → `Set Array Elem` at `NeighbourIndex`

---

## Why this matters

The maze generator works by removing walls between connected cells.

This function makes sure both cells are updated correctly.

If only one side changes, the maze data becomes inconsistent.

> Both cells must agree that the wall is gone.

---

## Common mistakes

❌ Changing only one cell  
✔️ Update both the current cell and the neighbor cell

---

❌ Forgetting to write the updated structs back into `MazeGrid`  
✔️ Use `Set Array Elem`

---

❌ Setting the wrong wall to False  
✔️ Make sure the wall removed matches the direction

---

## Expected result

Your `RemoveWallBetween` function now correctly carves a path between two adjacent cells.

---

<a href="{{ '/assets/images/blog/Part2-Step-4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-4.png' | relative_url }}" alt="RemoveWallBetween function updating both current and neighbor cells and writing them back to MazeGrid" class="post-image">
</a>

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

### Step 1 — Create the function

1. Create a new function named:

   `GenerateMaze`

---

### Step 2 — Add local variables

Create these **Local Variables**:

- `Stack` (Integer Array)
- `CurrentIndex` (Integer)
- `Neighbours` (Array of `S_NeighbourInfo`)
- `ChosenNeighbour` (`S_NeighbourInfo`)
- `StackTopIndex` (Integer)
- `RandomNeighbourIndex` (Integer)

---

### Step 3 — Choose the starting cell

1. Drag `MazeWidth` into the graph as **Get**

2. Drag `MazeHeight` into the graph as **Get**

3. Multiply them using:

   `Integer * Integer`

4. Subtract `1` using:

   `Integer - Integer`

5. Drag `RandomStream` into the graph as **Get**

6. Right-click and search for:

   `Random Integer in Range from Stream`

7. Connect:

- `Min = 0`
- `Max = MazeWidth * MazeHeight - 1`
- `Stream = RandomStream`

8. Drag `CurrentIndex` into the graph as **Set**

9. Connect the random result into `Set CurrentIndex`

10. Connect the white execution pin from:

`GenerateMaze`

to

`Set CurrentIndex`

---

### Step 4 — Mark the starting cell visited

1. Drag `MazeGrid` into the graph as **Get**

2. From `MazeGrid`, add:

   `Get (a copy)`

3. Connect:

- `CurrentIndex` → `Index`

4. Drag from the returned struct

5. Search for:

   `Set Members in S_MazeCell`

6. Enable only:

- `bVisited`

7. Set:

- `bVisited = True`

8. Add a `Set Array Elem` node

9. Connect:

- `MazeGrid` → Target Array
- `CurrentIndex` → `Index`
- updated cell → `Item`

10. Connect the white execution pin from:

`Set CurrentIndex`

to

`Set Array Elem`

---

### Step 5 — Add the starting cell to Stack

1. Drag `Stack` into the graph as **Get**

2. Drag from `Stack`

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

### Step 6 — Begin the main loop

This loop continues until the stack is empty.

1. Right-click in empty graph space

2. Search for:

   `While Loop`

3. Click:

   `While Loop`

4. Connect the white execution pin from:

   `Add` on `Stack`

   to

   `While Loop`

---

### Step 7 — Set the loop condition

1. Drag `Stack` into the graph as **Get**

2. Drag from `Stack`

3. Search for:

   `Length`

4. Drag from the Length result

5. Search for:

   `>`

6. Choose:

   `Integer > Integer`

7. Set the second value to:

   `0`

8. Connect the result into:

   `While Loop.Condition`

---

### Step 8 — Get the top of the stack

1. Drag `Stack` into the graph as **Get**

2. Drag from `Stack`

3. Search for:

   `Length`

4. Drag from the Length result

5. Search for:

   `-`

6. Choose:

   `Integer - Integer`

7. Set the second input to:

   `1`

8. Drag `StackTopIndex` into the graph as **Set**

9. Connect the subtraction result into `Set StackTopIndex`

10. Connect the white execution pin from:

`While Loop.Loop Body`

to

`Set StackTopIndex`

---

11. Drag `Stack` into the graph as **Get**

12. Drag from `Stack`

13. Search for:

`Get (a copy)`

14. Connect:

- `StackTopIndex` → `Index`

15. Drag `CurrentIndex` into the graph as **Set**

16. Connect the stack value into `Set CurrentIndex`

17. Connect the white execution pin from:

`Set StackTopIndex`

to

`Set CurrentIndex`

---

### Step 9 — Get unvisited neighbors

1. Drag in the function:

   `GetUnvisitedNeighbours`

2. Connect:

- `CurrentIndex` → `CurrentIndex` input

3. Drag `Neighbours` into the graph as **Set**

4. Connect the return value into `Set Neighbours`

5. Connect the white execution pin from:

   `Set CurrentIndex`

   to

   `Set Neighbours`

---

### Step 10 — Check whether any neighbors exist

1. Drag `Neighbours` into the graph as **Get**

2. Drag from `Neighbours`

3. Search for:

   `Length`

4. Drag from the Length result

5. Search for:

   `>`

6. Choose:

   `Integer > Integer`

7. Set the second value to:

   `0`

8. Add a `Branch`

9. Connect the white execution pin from:

   `Set Neighbours`

   to

   `Branch`

10. Connect:

- `Length(Neighbours) > 0` → `Branch.Condition`

---

## Step 5.1 — If neighbors exist, choose one randomly

### Instructions

1. Drag `Neighbours` into the graph as **Get**

2. Drag from `Neighbours`

3. Search for:

   `Length`

4. Drag from the Length result

5. Search for:

   `-`

6. Choose:

   `Integer - Integer`

7. Set the second input to:

   `1`

8. Drag `RandomStream` into the graph as **Get**

9. Add:

   `Random Integer in Range from Stream`

10. Connect:

- `Min = 0`
- `Max = Length(Neighbours) - 1`
- `Stream = RandomStream`

11. Drag `RandomNeighbourIndex` into the graph as **Set**

12. Connect the random result into `Set RandomNeighbourIndex`

13. Connect the white execution pin from:

`Branch.True`

to

`Set RandomNeighbourIndex`

---

14. Drag `Neighbours` into the graph as **Get**

15. Drag from `Neighbours`

16. Search for:

`Get (a copy)`

17. Connect:

- `RandomNeighbourIndex` → `Index`

18. Drag `ChosenNeighbour` into the graph as **Set**

19. Connect the result into `Set ChosenNeighbour`

20. Connect the white execution pin from:

`Set RandomNeighbourIndex`

to

`Set ChosenNeighbour`

---

### Step 5.2 — Remove the wall to the chosen neighbor

1. Add the function:

   `RemoveWallBetween`

2. Connect:

- `CurrentIndex` → `CurrentIndex`
- `ChosenNeighbour.CellIndex` → `NeighbourIndex`
- `ChosenNeighbour.DeltaX` → `DeltaX`
- `ChosenNeighbour.DeltaY` → `DeltaY`

3. Connect the white execution pin from:

   `Set ChosenNeighbour`

   to

   `RemoveWallBetween`

---

### Step 5.3 — Mark the chosen neighbor visited

1. Drag `MazeGrid` into the graph as **Get**

2. Add:

   `Get (a copy)`

3. Connect:

- `ChosenNeighbour.CellIndex` → `Index`

4. Add:

   `Set Members in S_MazeCell`

5. Enable only:

- `bVisited`

6. Set:

- `bVisited = True`

7. Add:

   `Set Array Elem`

8. Connect:

- `MazeGrid` → Target Array
- `ChosenNeighbour.CellIndex` → `Index`
- updated cell → `Item`

9. Connect the white execution pin from:

   `RemoveWallBetween`

   to

   `Set Array Elem`

---

### Step 5.4 — Push the chosen neighbor onto Stack

1. Drag `Stack` into the graph as **Get**

2. Drag from `Stack`

3. Search for:

   `Add`

4. Click:

   `Add`

5. Connect the white execution pin from:

   `Set Array Elem`

   to

   `Add`

6. Connect:

- `ChosenNeighbour.CellIndex` → `Add.Item`

---

## Step 5.5 — If no neighbors exist, backtrack

From the **False** output of the Branch:

1. Drag `Stack` into the graph as **Get**

2. Drag from `Stack`

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
`GenerateMaze → Set CurrentIndex → Mark Start Visited → Stack.Add(Start) → While Loop → Set StackTopIndex → Set CurrentIndex → Set Neighbours → Branch`

**If True:**  
`Branch.True → Set RandomNeighbourIndex → Set ChosenNeighbour → RemoveWallBetween → Mark Chosen Neighbour Visited → Stack.Add(ChosenNeighbour)`

**If False:**  
`Branch.False → Stack.RemoveIndex(StackTopIndex)`

**Data flow:**

- `MazeWidth × MazeHeight - 1` → random max start index
- `RandomStream` → starting cell selection
- `CurrentIndex` → `MazeGrid` lookup
- `Stack.Length - 1` → `StackTopIndex`
- `Stack[StackTopIndex]` → `CurrentIndex`
- `CurrentIndex` → `GetUnvisitedNeighbours`
- `GetUnvisitedNeighbours` return value → `Neighbours`
- `Length(Neighbours) - 1` → random neighbor max index
- `RandomStream` → random neighbor selection
- `Neighbours[RandomNeighbourIndex]` → `ChosenNeighbour`
- `ChosenNeighbour` fields → `RemoveWallBetween`
- `ChosenNeighbour.CellIndex` → visited update
- `ChosenNeighbour.CellIndex` → `Stack.Add`

---

## Why this matters

This is the actual maze-generation algorithm.

It keeps moving forward while valid neighbors exist.  
When it hits a dead end, it backtracks.  
That is exactly how the stack-based depth-first search maze algorithm works.

> This is what turns a full grid of walls into a real maze.

---

## Common mistakes

❌ Forgetting to mark the starting cell visited  
✔️ The start cell must be marked before the loop begins

---

❌ Forgetting to push the chosen neighbor onto the stack  
✔️ That is what moves the algorithm deeper into the maze

---

❌ Removing the wrong stack index  
✔️ Use `StackTopIndex`

---

❌ Forgetting to update the chosen neighbor’s `bVisited` flag  
✔️ Otherwise the algorithm may revisit cells incorrectly

---

## Expected result

Your `GenerateMaze` function now creates a full maze in memory using a stack-based depth-first search system.

---

<a href="{{ '/assets/images/blog/Part2-Step-5.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-5.png' | relative_url }}" alt="GenerateMaze function using stack-based depth-first search with current index, neighbours, chosen neighbour, and backtracking logic" class="post-image">
</a>

---

# Step 6 — Call the Functions in Order

Now we connect the completed functions back into the Construction Script.

---

## What this step does

This puts the full maze setup in the correct order.

---

## Instructions

Go back to your **Construction Script**.

After `Set RandomStream`, add:

1. `InitializeGrid`

2. `GenerateMaze`

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
