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
- If anything is missing, go back to Part 1 before continuing.

---

# Step 1 — Build the Construction Script Setup

Before we create the maze functions, we need to prepare the Construction Script. At the top of the Blueprint editor, you will see tabs. Click the **Construction Script** tab. If you don't see it, look in the **My Blueprint** panel under Functions and double-click **Construction Script**.

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

1. Drag `FloorHISM` from the **Components** panel into the graph.

2. Drag from the `FloorHISM` pin

3. Search for:

   `Clear Instances`

4. Click:

   `Clear Instances`

---

### Step 1.3 — Clear old wall instances

#### Step 1.3.1 — Add the WallHISM clear node

1. Drag `WallHISM` from the **Components** panel

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

1. Drag `MazeGrid` into the graph. When dragging a variable into the graph, a small menu will appear asking Get or Set. Choose **Get** here.

2. Drag from the `MazeGrid` pin

3. Search for:

   `Clear`

4. Click:

   `Clear`

---

## Beginner note

Use plain `Clear` here because `MazeGrid` is an array.

Do NOT use `Clear Instances`.

- `Clear` removes all items from an array
- `Clear Instances` removes spawned mesh instances from an HISM component

So:

- `MazeGrid` → use `Clear`
- `FloorHISM` / `WallHISM` → use `Clear Instances`

---

#### Step 1.4.2 — Connect execution flow

5. Connect the white execution pin from:

   `Clear Instances` on `WallHISM`

   to

   `Clear` on `MazeGrid`

---

### Step 1.5 — Create and store the RandomStream

#### Step 1.5.1 — Create the stream

1. Drag `MazeSeed` into the graph. When dragging a variable into the graph, a small menu will appear asking Get or Set. Choose **Get** here.

2. Drag from the `MazeSeed` pin

3. Search for:

   `Make Random Stream`

4. Click:

   `Make Random Stream`

#### Step 1.5.2 — Store the stream

5. Drag `RandomStream` into the graph as **Set**

6. Connect the output of `Make Random Stream` into the value pin on `Set RandomStream`

> Pro tip: If you drag `RandomStream` and drop it on the `Return Value` pin, Blueprints will create the Set node automatically.

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

<a href="{{ '/assets/images/blog/Part2-Step-1.5.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-1.5.png' | relative_url }}" style="width:100%;" alt="Construction Script clearing FloorHISM, WallHISM, MazeGrid, and setting RandomStream from MazeSeed" class="post-image">
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

   `Subtract`

10. Set the second input to:

`1`

---

> ## Beginner note

> `MazeWidth × MazeHeight` gives the total number of cells in the maze.

> But arrays start counting at `0`.

> So if the maze has 100 cells, the indexes go from:

> `0` to `99`

> That means the last valid index is:

> `Total Cells - 1`

> This prevents the loop from trying to use an index that does not exist.

---

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

   `Divide`

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

> You can drag multiple connections from the same output pin, just drag from it again.

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

> Note: I did not need to drag in another MazeWidth. I could have used the one I dragged in earlier a second time. But I am adding another because it makes a cleaner screenshot when you don't have wires crossing all over the place.

---

> ## Beginner note

> The `%` (modulo) operator gives the remainder after division.

> This is how we convert a single index into a column.

> Example:

> If `MazeWidth = 10`:

> - Index 0 → `0 % 10 = 0`
> - Index 7 → `7 % 10 = 7`
> - Index 10 → `10 % 10 = 0` (new row starts)
> - Index 13 → `13 % 10 = 3`

> So `% MazeWidth` gives you the position across the row (the column).

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

5. Confirm the default values are already set correctly. These should match what you defined in S_MazeCell in Part 1:

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

❌ Picking `For Loop With Break` instead of `For Loop`  
✔️ Make sure you pick `For Loop`

---

## Expected result

Your `InitializeGrid` function now creates a full array of maze cells.

---

<a href="{{ '/assets/images/blog/Part2-Step-2.8.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-2.8.png' | relative_url }}" style="width:100%;" alt="InitializeGrid function with Clear MazeGrid, For Loop, row and column calculations, Make S_MazeCell, and Add to MazeGrid" class="post-image">
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

## Coordinate system used in this function

Before building this function, it helps to understand the direction convention:

| Direction | DeltaX | DeltaY | Index change |
| --------- | ------ | ------ | ------------ |
| North     | 0      | -1     | − MazeWidth  |
| East      | 1      | 0      | + 1          |
| South     | 0      | 1      | + MazeWidth  |
| West      | -1     | 0      | − 1          |

> You will use these values when creating `S_NeighborInfo` structs for each direction.

---

## Instructions

### Step 3.1 — Create the function

#### Step 3.1.1 — Add the function

1. In the **My Blueprint** panel, find **Functions**

2. Click the **+** button next to **Functions**

3. Name the function:

   `GetUnvisitedNeighbors`

4. Press **Enter**

---

### Step 3.2 — Add input and output

#### Step 3.2.1 — Add the input

1. In the **Details** panel for the function, find **Inputs**

2. Click the **+** button

3. Name it:

   `CurrentIndex`

4. Set the type to:

   **Integer**

#### Step 3.2.2 — Add the output

1. In the **Details** panel, find **Outputs**

2. Click the **+** button

3. Name it:

   `Neighbors`

4. Set the type to:

   **Array of S_NeighborInfo**

---

<a href="{{ '/assets/images/blog/Part2-Step-3.2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.2.png' | relative_url }}" style="width:100%;" alt="GetUnvisitedNeighbors function with input and output" class="post-image">
  </a>

---

### Step 3.3 — Add local variables

Local variables only exist inside this function. They are added differently from regular Blueprint variables.

#### Step 3.3.1 — Find the Local Variables section

1. Look in the **My Blueprint** panel

2. Find the section labeled:

   **Local Variables**

> This section only appears when you are inside a function graph. If you do not see it, make sure you have the `GetUnvisitedNeighbors` graph open.

#### Step 3.3.2 — Add the local variables

3. Click the **+** button next to **Local Variables**

4. Add the following one at a time:

- `CurrentRow` (Integer)
- `CurrentCol` (Integer)
- `LocalNeighbors` (Array of `S_NeighborInfo`)
- `TestIndex` (Integer)

> `TestIndex` will be reused for each direction. This is safe because each direction's logic completes fully before the next one begins.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.3.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.3.png' | relative_url }}" style="width:100%;" alt="GetUnvisitedNeighbors function with local variables" class="post-image">
  </a>

---

### Step 3.4 — Add comment boxes

Before placing any nodes, you will set up comment boxes to keep the graph organised.

Comment boxes let you label groups of nodes so you can always tell which direction you are working on.

#### Step 3.4.1 — Add the North comment box

1. Left-click and drag in empty graph space to select an area

2. Press **C**

3. A comment box will appear

4. Name it:

   `North`

#### Step 3.4.2 — Add the remaining comment boxes

5. Repeat this process three more times, placing each box to the right of the previous one

6. Name them:

- `East`
- `South`
- `West`

> You do not need to be precise yet. You can resize and reposition comment boxes at any time by dragging their edges or title bar.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.4.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.4.png' | relative_url }}" style="width:100%;" alt="Four comment boxes labeled North, East, South, and West arranged in a column in the Blueprint graph" class="post-image">
</a>

---

### Step 3.5 — Calculate CurrentRow and CurrentCol

#### Step 3.5.1 — Calculate CurrentRow

1. From the **function entry node**, drag from:

   `CurrentIndex`

2. Search for:

   `/`

3. Choose:

   `Divide`

4. Drag `MazeWidth` into the graph as **Get**

5. Connect:
   - `MazeWidth` → second input of `/`

6. Drag `CurrentRow` into the graph as **Set**

7. Connect the division result into `Set CurrentRow`

8. Connect the white execution pin from:

   `GetUnvisitedNeighbors` (function entry node)

   to

   `Set CurrentRow`

#### Step 3.5.2 — Calculate CurrentCol

1. From the **function entry node**, drag from:

   `CurrentIndex`

2. Search for:

   `%`

3. Choose:

   `Percent (Integer)`

4. Drag `MazeWidth` into the graph as **Get**

5. Connect:
   - `MazeWidth` → second input of `%`

6. Drag `CurrentCol` into the graph as **Set**

7. Connect the modulo result into `Set CurrentCol`

8. Connect the white execution pin from:

   `Set CurrentRow`

   to

   `Set CurrentCol`

---

<a href="{{ '/assets/images/blog/Part2-Step-3.5.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.5.png' | relative_url }}" style="width:100%;" alt="GetUnvisitedNeighbors function showing CurrentIndex divided by MazeWidth stored in CurrentRow and CurrentIndex modulo MazeWidth stored in CurrentCol" class="post-image">
</a>

---

### Step 3.6 — Check the North neighbor

Use this pattern for North:

```
CurrentRow > 0
→ TestIndex = CurrentIndex - MazeWidth
→ MazeGrid[TestIndex]
→ NOT bVisited
→ Make S_NeighborInfo (DeltaX=0, DeltaY=-1)
→ Add to LocalNeighbors
```

---

## What this step does

This section checks if there is a valid cell **above (North)** the current cell.

If that neighbor:

- exists inside the maze
- has NOT been visited

then it is added as a valid movement option.

---

## IMPORTANT — Execution Flow

This is the first direction check and establishes the pattern all other directions follow:

- DO NOT use a Sequence node
- execution must continue whether North is valid or not

---

Place all nodes for this section **inside the North comment box**.

#### Step 3.6.1 — Check north bounds

1. Drag `CurrentRow` into the graph as **Get**

2. Drag from the `CurrentRow` pin

3. Search for:

   `>`

4. Choose:

   `Greater`

5. Set the second input to:

   `0`

6. Right-click in empty graph space

7. Search for:

   `Branch`

8. Choose the plain:

   `Branch`

> Do not choose **Branch (Enum)** or any other variant.

9. Connect the white execution pin from:

   `Set CurrentCol`

   to

   `Branch` (North bounds check)

10. Connect:
    - `CurrentRow > 0` → `Branch.Condition`

---

#### Step 3.6.2 — Calculate TestIndex

1. From the **function entry node**, drag from:

   `CurrentIndex`

2. Search for:

   `-`

3. Choose:

   `Subtract`

4. Drag `MazeWidth` into the graph as **Get**

5. Connect:
   - `MazeWidth` → second input of `-`

6. Drag `TestIndex` into the graph as **Set**

7. Connect the subtraction result into `Set TestIndex`

8. Connect the white execution pin from:

   `Branch.True` (North bounds check)

   to

   `Set TestIndex`

---

#### Step 3.6.3 — Read the North cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Drag `TestIndex` into the graph as **Get**

6. Connect:
   - `TestIndex` → `Index` on `Get (a copy)`

7. Drag from the output of `Get (a copy)`

8. Search for:

   `Break S_MazeCell`

9. Click:

   `Break S_MazeCell`

---

#### Step 3.6.4 — Check if North is unvisited

1. Drag from the `bVisited` pin on `Break S_MazeCell`

2. Search for:

   `NOT Boolean`

3. Click:

   `NOT Boolean`

4. Right-click in empty graph space

5. Search for:

   `Branch`

6. Choose the plain:

   `Branch`

7. Connect the white execution pin from:

   `Set TestIndex`

   to

   `Branch` (North visited check)

8. Connect:
   - `NOT Boolean` result → `Branch.Condition` (North visited check)

---

#### Step 3.6.5 — Add the North neighbor

1. Right-click in empty graph space

2. Search for:

   `Make S_NeighborInfo`

3. Click:

   `Make S_NeighborInfo`

4. Drag `TestIndex` into the graph as **Get**

5. Connect:
   - `TestIndex` → `CellIndex`

6. Set:
   - `DeltaX = 0`
   - `DeltaY = -1`

7. Drag `LocalNeighbors` into the graph as **Get**

8. Drag from the `LocalNeighbors` pin

9. Search for:

   `Add`

10. Click:

    `Add`

11. Connect the white execution pin from:

    `Branch.True` (North visited check)

    to

    `Add`

12. Connect:
    - `Make S_NeighborInfo` → `Add.Item`

---

> The North section is now complete. The outgoing execution wires from this
> section will be connected in the next step when the East bounds Branch
> node has been created.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.6.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.6.png' | relative_url }}" style="width:100%;" alt="North comment box containing bounds Branch, TestIndex calculation, MazeGrid Get, Break S_MazeCell, visited Branch, Make S_NeighborInfo, and Add to LocalNeighbors" class="post-image">
</a>

---

### Step 3.7 — Check the East neighbor

Use this pattern for East:

```
CurrentCol < MazeWidth - 1
→ TestIndex = CurrentIndex + 1
→ MazeGrid[TestIndex]
→ NOT bVisited
→ Make S_NeighborInfo (DeltaX=1, DeltaY=0)
→ Add to LocalNeighbors
```

---

## What this step does

This section checks if there is a valid cell to the **right (East)** of the current cell.

If that neighbor:

- exists inside the maze
- has NOT been visited

then it is added as a valid movement option.

---

Place all nodes for this section **inside the East comment box**.

#### Step 3.7.1 — Check east bounds

1. Right-click in empty graph space **inside the East comment box**

2. Search for:

   `Branch`

3. Choose the plain:

   `Branch`

4. Connect the white execution pin from:

   `Branch.False` (North **bounds** check, inside the **North** comment box)

   to

   `Branch` (inside the **East** comment box)

5. Connect the white execution pin from:

   `Branch.False` (North **visited** check, inside the **North** comment box)

   to

   `Branch` (inside the **East** comment box)

6. Connect the white execution pin from:

   `Add` exec output (inside the **North** comment box)

   to

   `Branch` (inside the **East** comment box)

7. Drag `CurrentCol` into the graph as **Get**

8. Drag from the `CurrentCol` pin

9. Search for:

   `<`

10. Choose:

    `Less`

11. Drag `MazeWidth` into the graph as **Get**

12. Drag from the `MazeWidth` pin

13. Search for:

    `-`

14. Choose:

    `Subtract`

15. Set the second input to:

    `1`

16. Connect:
    - `(MazeWidth - 1)` result → second input of `<`

17. Connect:
    - `CurrentCol < MazeWidth - 1` → `Branch.Condition` (East bounds check)

---

<a href="{{ '/assets/images/blog/Part2-Step-3.7.1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.7.1.png' | relative_url }}" style="width:100%;" alt="Showing Step 14, Step 15, and Step 16 connections to the first East branch" class="post-image">
</a>

---

#### Step 3.7.2 — Calculate TestIndex

1. From the **function entry node**, drag from:

   `CurrentIndex`

2. Search for:

   `+`

3. Choose:

   `Add`

4. Set the second input to:

   `1`

5. Drag `TestIndex` into the graph as **Set**

6. Connect the addition result into `Set TestIndex`

7. Connect the white execution pin from:

   `Branch.True` (East bounds check)

   to

   `Set TestIndex`

---

#### Step 3.7.3 — Read the East cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Drag `TestIndex` into the graph as **Get**

6. Connect:
   - `TestIndex` → `Index` on `Get (a copy)`

7. Drag from the output of `Get (a copy)`

8. Search for:

   `Break S_MazeCell`

9. Click:

   `Break S_MazeCell`

---

#### Step 3.7.4 — Check if East is unvisited

1. Drag from the `bVisited` pin on `Break S_MazeCell`

2. Search for:

   `NOT Boolean`

3. Click:

   `NOT Boolean`

4. Right-click in empty graph space

5. Search for:

   `Branch`

6. Choose the plain:

   `Branch`

7. Connect the white execution pin from:

   `Set TestIndex`

   to

   `Branch` (East visited check)

8. Connect:
   - `NOT Boolean` result → `Branch.Condition` (East visited check)

---

#### Step 3.7.5 — Add the East neighbor

1. Right-click in empty graph space

2. Search for:

   `Make S_NeighborInfo`

3. Click:

   `Make S_NeighborInfo`

4. Drag `TestIndex` into the graph as **Get**

5. Connect:
   - `TestIndex` → `CellIndex`

6. Set:
   - `DeltaX = 1`
   - `DeltaY = 0`

7. Drag `LocalNeighbors` into the graph as **Get**

8. Drag from the `LocalNeighbors` pin

9. Search for:

   `Add`

10. Click:

    `Add`

11. Connect the white execution pin from:

    `Branch.True` (East visited check)

    to

    `Add`

12. Connect:
    - `Make S_NeighborInfo` → `Add.Item`

> The East section is now complete. The outgoing execution wires from this
> section will be connected in the next step when the South bounds Branch
> node has been created.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.7.5.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.7.5.png' | relative_url }}" style="width:100%;" alt="East comment box containing the bounds Branch node with three incoming execution wires from the North section, TestIndex calculation, MazeGrid Get, Break S_MazeCell, visited Branch, Make S_NeighborInfo, and Add to LocalNeighbors" class="post-image">
</a>

---

### Step 3.8 — Check the South neighbor

Use this pattern for South:

---

CurrentRow < MazeHeight - 1
→ TestIndex = CurrentIndex + MazeWidth
→ MazeGrid[TestIndex]
→ NOT bVisited
→ Make S_NeighborInfo (DeltaX=0, DeltaY=1)
→ Add to LocalNeighbors

---

## What this step does

This section checks if there is a valid cell **below (South)** the current cell.

If that neighbor:

- exists inside the maze
- has NOT been visited

then it is added as a valid movement option.

---

Place all nodes for this section **inside the South comment box**.

#### Step 3.8.1 — Check south bounds

1. Right-click in empty graph space **inside the South comment box**

2. Search for:

   `Branch`

3. Choose the plain:

   `Branch`

4. Connect the white execution pin from:

   `Branch.False` (East **bounds** check, inside the **East** comment box)

   to

   `Branch` (inside the **South** comment box)

5. Connect the white execution pin from:

   `Branch.False` (East **visited** check, inside the **East** comment box)

   to

   `Branch` (inside the **South** comment box)

6. Connect the white execution pin from:

   `Add` exec output (inside the **East** comment box)

   to

   `Branch` (inside the **South** comment box)

7. Drag `CurrentRow` into the graph as **Get**

8. Drag from the `CurrentRow` pin

9. Search for:

   `<`

10. Choose:

    `Less`

11. Drag `MazeHeight` into the graph as **Get**

12. Drag from the `MazeHeight` pin

13. Search for:

    `-`

14. Choose:

    `Subtract`

15. Set the second input to:

    `1`

16. Connect:
    - `(MazeHeight - 1)` result → second input of `<`

17. Connect:
    - `CurrentRow < MazeHeight - 1` → `Branch.Condition` (South bounds check)

---

#### Step 3.8.2 — Calculate TestIndex

1. From the **function entry node**, drag from:

   `CurrentIndex`

2. Search for:

   `+`

3. Choose:

   `Add`

4. Drag `MazeWidth` into the graph as **Get**

5. Connect:
   - `MazeWidth` → second input of `+`

6. Drag `TestIndex` into the graph as **Set**

7. Connect the addition result into `Set TestIndex`

8. Connect the white execution pin from:

   `Branch.True` (South bounds check)

   to

   `Set TestIndex`

---

#### Step 3.8.3 — Read the South cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Drag `TestIndex` into the graph as **Get**

6. Connect:
   - `TestIndex` → `Index` on `Get (a copy)`

7. Drag from the output of `Get (a copy)`

8. Search for:

   `Break S_MazeCell`

9. Click:

   `Break S_MazeCell`

---

#### Step 3.8.4 — Check if South is unvisited

1. Drag from the `bVisited` pin on `Break S_MazeCell`

2. Search for:

   `NOT Boolean`

3. Click:

   `NOT Boolean`

4. Right-click in empty graph space

5. Search for:

   `Branch`

6. Choose the plain:

   `Branch`

7. Connect the white execution pin from:

   `Set TestIndex`

   to

   `Branch` (South visited check)

8. Connect:
   - `NOT Boolean` result → `Branch.Condition` (South visited check)

---

#### Step 3.8.5 — Add the South neighbor

1. Right-click in empty graph space

2. Search for:

   `Make S_NeighborInfo`

3. Click:

   `Make S_NeighborInfo`

4. Drag `TestIndex` into the graph as **Get**

5. Connect:
   - `TestIndex` → `CellIndex`

6. Set:
   - `DeltaX = 0`
   - `DeltaY = 1`

7. Drag `LocalNeighbors` into the graph as **Get**

8. Drag from the `LocalNeighbors` pin

9. Search for:

   `Add`

10. Click:

    `Add`

11. Connect the white execution pin from:

    `Branch.True` (South visited check)

    to

    `Add`

12. Connect:
    - `Make S_NeighborInfo` → `Add.Item`

> The South section is now complete. The outgoing execution wires from this
> section will be connected in the next step when the West bounds Branch
> node has been created.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.8.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.8.png' | relative_url }}" style="width:100%;" alt="South comment box containing the bounds Branch node with three incoming execution wires from the North section, TestIndex calculation, MazeGrid Get, Break S_MazeCell, visited Branch, Make S_NeighborInfo, and Add to LocalNeighbors" class="post-image">
</a>

---

### Step 3.9 — Check the West neighbor

Use this pattern for West:

```
CurrentCol > 0
→ TestIndex = CurrentIndex - 1
→ MazeGrid[TestIndex]
→ NOT bVisited
→ Make S_NeighborInfo (DeltaX=-1, DeltaY=0)
→ Add to LocalNeighbors
```

---

## What this step does

This section checks if there is a valid cell to the **left (West)** of the current cell.

If that neighbor:

- exists inside the maze
- has NOT been visited

then it is added as a valid movement option.

---

Place all nodes for this section **inside the West comment box**.

#### Step 3.9.1 — Check west bounds

1. Right-click in empty graph space **inside the West comment box**

2. Search for:

   `Branch`

3. Choose the plain:

   `Branch`

4. Connect the white execution pin from:

   `Branch.False` (South **bounds** check, inside the **South** comment box)

   to

   `Branch` (inside the **West** comment box)

5. Connect the white execution pin from:

   `Branch.False` (South **visited** check, inside the **South** comment box)

   to

   `Branch` (inside the **West** comment box)

6. Connect the white execution pin from:

   `Add` exec output (inside the **South** comment box)

   to

   `Branch` (inside the **West** comment box)

7. Drag `CurrentCol` into the graph as **Get**

8. Drag from the `CurrentCol` pin

9. Search for:

   `>`

10. Choose:

    `Greater`

11. Set the second input to:

    `0`

12. Connect:
    - `CurrentCol > 0` → `Branch.Condition` (West bounds check)

---

#### Step 3.9.2 — Calculate TestIndex

1. From the **function entry node**, drag from:

   `CurrentIndex`

2. Search for:

   `-`

3. Choose:

   `Subtract`

4. Set the second input to:

   `1`

5. Drag `TestIndex` into the graph as **Set**

6. Connect the subtraction result into `Set TestIndex`

7. Connect the white execution pin from:

   `Branch.True` (West bounds check)

   to

   `Set TestIndex`

---

#### Step 3.9.3 — Read the West cell

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Drag `TestIndex` into the graph as **Get**

6. Connect:
   - `TestIndex` → `Index` on `Get (a copy)`

7. Drag from the output of `Get (a copy)`

8. Search for:

   `Break S_MazeCell`

9. Click:

   `Break S_MazeCell`

---

#### Step 3.9.4 — Check if West is unvisited

1. Drag from the `bVisited` pin on `Break S_MazeCell`

2. Search for:

   `NOT Boolean`

3. Click:

   `NOT Boolean`

4. Right-click in empty graph space

5. Search for:

   `Branch`

6. Choose the plain:

   `Branch`

7. Connect the white execution pin from:

   `Set TestIndex`

   to

   `Branch` (West visited check)

8. Connect:
   - `NOT Boolean` result → `Branch.Condition` (West visited check)

---

#### Step 3.9.5 — Add the West neighbor

1. Right-click in empty graph space

2. Search for:

   `Make S_NeighborInfo`

3. Click:

   `Make S_NeighborInfo`

4. Drag `TestIndex` into the graph as **Get**

5. Connect:
   - `TestIndex` → `CellIndex`

6. Set:
   - `DeltaX = -1`
   - `DeltaY = 0`

7. Drag `LocalNeighbors` into the graph as **Get**

8. Drag from the `LocalNeighbors` pin

9. Search for:

   `Add`

10. Click:

    `Add`

11. Connect the white execution pin from:

    `Branch.True` (West visited check)

    to

    `Add`

12. Connect:
    - `Make S_NeighborInfo` → `Add.Item`

---

### Step 3.10 — Return the result

#### Step 3.10.1 — Connect LocalNeighbors to the Return Node

The **Return Node** is automatically placed at the end of the function graph. Scroll to find it. Do not add a new one.

1. Drag `LocalNeighbors` into the graph as **Get**

2. Connect:
   - `LocalNeighbors` → `Neighbors` on the Return Node

3. Connect the white execution pin from:

   `Branch.False` (West **bounds** check, inside the **West** comment box)

   to

   the **Return Node**

4. Connect the white execution pin from:

   `Branch.False` (West **visited** check, inside the **West** comment box)

   to

   the **Return Node**

5. Connect the white execution pin from:

   `Add` exec output (inside the **West** comment box)

   to

   the **Return Node**

---

<a href="{{ '/assets/images/blog/Part2-Step-3.9.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.9.png' | relative_url }}" style="width:100%;" alt="West comment box containing the bounds Branch node with three incoming execution wires from the South section, TestIndex calculation, MazeGrid Get, Break S_MazeCell, visited Branch, Make S_NeighborInfo, Add to LocalNeighbors and Return Node" class="post-image">
</a>

---

### Step 3.11 — Review the full execution flow

When all four directions are connected, the full function flows like this:

```
Set CurrentRow
→ Set CurrentCol
→ [North comment box] Branch: CurrentRow > 0
→ [East comment box]  Branch: CurrentCol < MazeWidth - 1
→ [South comment box] Branch: CurrentRow < MazeHeight - 1
→ [West comment box]  Branch: CurrentCol > 0
→ Return Node
```

Within each comment box, if the bounds check passes:

```
Branch.True → Set TestIndex → Branch: NOT bVisited → Add to LocalNeighbors → next section
Branch.False → next section
```

> Both paths from every Branch node must eventually reach the next section. If any wire is missing, the function will silently stop at that point.

---

<a href="{{ '/assets/images/blog/Part2-Step-3.11.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.11.png' | relative_url }}" style="width:100%;" alt="Full GetUnvisitedNeighbors graph showing all four comment boxes connected in sequence with execution flowing through North, East, South, and West into the Return Node" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`GetUnvisitedNeighbors → Set CurrentRow → Set CurrentCol → North → East → South → West → Return Node`

**Within each direction:**
`Bounds Branch.True → Set TestIndex → Visited Branch.True → Add to LocalNeighbors`

**Data flow:**

- `CurrentIndex / MazeWidth` → `CurrentRow`
- `CurrentIndex % MazeWidth` → `CurrentCol`
- Direction index formula → `TestIndex`
- `MazeGrid[TestIndex]` → `Break S_MazeCell`
- `NOT bVisited` → visited Branch condition
- `TestIndex` + direction deltas → `Make S_NeighborInfo`
- `Make S_NeighborInfo` → `LocalNeighbors.Add`
- `LocalNeighbors` → Return Node `Neighbors` output

---

## Why this matters

This function is how the maze generator finds possible next moves.

It prevents the algorithm from:

- going outside the maze
- revisiting already visited cells
- choosing invalid directions

> Without this function, the generator has no idea where it can go.

---

## Common mistakes

❌ Forgetting the bounds check  
✔️ Always check the neighbor is inside the maze before reading from `MazeGrid`

---

❌ Only connecting one wire into each direction's Branch node  
✔️ Both `Branch.False` and `Add` exec output must connect forward

---

❌ Reading the wrong cell  
✔️ Always use `TestIndex` to read the neighbor, not `CurrentIndex`

---

❌ Forgetting to negate `bVisited`  
✔️ You want `NOT bVisited` — unvisited neighbors only

---

❌ Adding a second Return Node  
✔️ The Return Node already exists — scroll right to find it

---

## Expected result

Your `GetUnvisitedNeighbors` function now:

- correctly calculates the position of each neighbor
- checks all four directions
- filters out out-of-bounds and already visited cells
- returns a clean array of valid next moves

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

## How this function works

When the maze algorithm moves from one cell to a neighbor, a wall exists between them on both sides. Both cells must agree the wall is gone:

| Direction           | Current Cell loses | Neighbor Cell loses |
| ------------------- | ------------------ | ------------------- |
| North (DeltaY = -1) | bWallNorth         | bWallSouth          |
| East (DeltaX = 1)   | bWallEast          | bWallWest           |
| South (DeltaY = 1)  | bWallSouth         | bWallNorth          |
| West (DeltaX = -1)  | bWallWest          | bWallEast           |

> Because `MazeGrid` stores structs by value, any changes must be written back into the array explicitly. This function handles that.

---

## Instructions

### Step 4.1 — Create the function

#### Step 4.1.1 — Add the function

1. In the **My Blueprint** panel, find **Functions**

2. Click the **+** button next to **Functions**

3. Name the function:

   `RemoveWallBetween`

4. Press **Enter**

---

### Step 4.2 — Add inputs

#### Step 4.2.1 — Add function inputs

1. In the **Details** panel for the function, find **Inputs**

2. Click the **+** button and add the following one at a time:

- `CurrentIndex` (Integer)
- `NeighborIndex` (Integer)
- `DeltaX` (Integer)
- `DeltaY` (Integer)

---

<a href="{{ '/assets/images/blog/Part2-Step-4.2.1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.2.1.png' | relative_url }}" style="width:100%;" alt="RemoveWallBetween function Details panel showing four inputs: CurrentIndex, NeighborIndex, DeltaX, and DeltaY all typed as Integer" class="post-image">
</a>

---

### Step 4.3 — Add local variables

Local variables only exist inside this function. They are added differently from regular Blueprint variables.

#### Step 4.3.1 — Find the Local Variables section

1. Look in the **My Blueprint** panel

2. Find the section labeled:

   **Local Variables**

> This section only appears when you are inside a function graph. If you do not see it, make sure you have the `RemoveWallBetween` graph open.

#### Step 4.3.2 — Add the local variables

3. Click the **+** button next to **Local Variables**

4. Add the following one at a time:

- `CurrentCell` (`S_MazeCell`)
- `NeighborCell` (`S_MazeCell`)

---

<a href="{{ '/assets/images/blog/Part2-Step-4.3.2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.3.2.png' | relative_url }}" style="width:100%;" alt="RemoveWallBetween Local Variables section showing CurrentCell and NeighborCell both typed as S_MazeCell" class="post-image">
</a>

---

### Step 4.4 — Read the current cell from MazeGrid

#### Step 4.4.1 — Get the cell at CurrentIndex

1. From the **function entry node**, drag from the input pin:

   `CurrentIndex`

2. Search for:

   `Get (a copy)`

3. Click:

   `Get (a copy)`

4. Drag `MazeGrid` into the graph as **Get**

5. Connect:
   - `MazeGrid` → **Target Array** on `Get (a copy)`

#### Step 4.4.2 — Store the result in CurrentCell

6. Drag `CurrentCell` into the graph as **Set**

7. Connect:
   - output of `Get (a copy)` → value input on `Set CurrentCell`

8. Connect the white execution pin from:

   `RemoveWallBetween` (function entry node)

   to

   `Set CurrentCell`

---

<a href="{{ '/assets/images/blog/Part2-Step-4.4.2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.4.2.png' | relative_url }}" style="width:100%;" alt="MazeGrid Get (a copy) node using CurrentIndex connected into Set CurrentCell, wired from the RemoveWallBetween entry node" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`RemoveWallBetween → Set CurrentCell`

**Data flow:**

- `CurrentIndex` → `Get (a copy).Index`
- `MazeGrid` → `Get (a copy).Target Array`
- `Get (a copy)` output → `Set CurrentCell`

---

### Step 4.5 — Read the neighbor cell from MazeGrid

#### Step 4.5.1 — Get the cell at NeighborIndex

1. From the **function entry node**, drag from the input pin:

   `NeighborIndex`

2. Search for:

   `Get (a copy)`

3. Click:

   `Get (a copy)`

4. Drag `MazeGrid` into the graph as **Get** (it's fine to use the `MazeGrid` form the last step)

5. Connect:
   - `MazeGrid` → **Target Array** on `Get (a copy)`

#### Step 4.5.2 — Store the result in NeighborCell

6. Drag `NeighborCell` into the graph as **Set**

7. Connect:
   - output of `Get (a copy)` → value input on `Set NeighborCell`

8. Connect the white execution pin from:

   `Set CurrentCell`

   to

   `Set NeighborCell`

---

<a href="{{ '/assets/images/blog/Part2-Step-4.5.2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.5.2.png' | relative_url }}" style="width:100%;" alt="MazeGrid Get (a copy) node using NeighborIndex connected into Set NeighborCell, chained after Set CurrentCell" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Set CurrentCell → Set NeighborCell`

**Data flow:**

- `NeighborIndex` → `Get (a copy).Index`
- `MazeGrid` → `Get (a copy).Target Array`
- `Get (a copy)` output → `Set NeighborCell`

---

### Step 4.6 — Add the Sequence node

The Sequence node lets each direction check run independently from its own output pin, rather than chaining them together.

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

The Sequence node starts with two outputs: `Then 0` and `Then 1`.

You need five outputs total. Add three more:

5. Click **Add pin +** on the Sequence node three times

You should now have:

- `Then 0` → North check
- `Then 1` → East check
- `Then 2` → South check
- `Then 3` → West check
- `Then 4` → Write-back to MazeGrid

---

<a href="{{ '/assets/images/blog/Part2-Step-4.6.1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.6.1.png' | relative_url }}" style="width:100%;" alt="Sequence node connected after Set NeighborCell showing five outputs: Then 0 through Then 4" class="post-image">
</a>

---

## Why this matters

Using a Sequence node means:

- each direction gets its own clean execution path
- no direction needs to chain into the next
- the write-back in `Then 4` always runs after all direction checks are complete

> This is much easier to manage than forcing all direction checks into one long branch chain.

---

### Step 4.7 — Add comment boxes

Before placing any direction nodes, set up comment boxes to keep the graph organized.

#### Step 4.7.1 — Add the direction comment boxes

1. Left-click and drag in empty graph space to select an area

2. Press **C**

3. A comment box will appear

4. Name it:

   `North (DeltaY = -1)`

5. Repeat this process four more times, placing each box to the right of or below the previous one

6. Name them:

- `East (DeltaX = 1)`
- `South (DeltaY = 1)`
- `West (DeltaX = -1)`
- `Write-back to MazeGrid`

> The delta values in the label make it easy to verify at a glance that each direction block uses the correct comparison value.

---

### Step 4.8 — Check direction: North

This check runs from `Sequence → Then 0`.

If `DeltaY == -1`:

- the current cell loses its **North** wall
- the neighbor cell loses its **South** wall

Place all nodes for this section **inside the `North (DeltaY = -1)` comment box**.

#### Step 4.8.1 — Check if the direction is North

1. From the **function entry node**, drag from the input pin:

   `DeltaY`

2. Search for:

   `==`

3. Choose:

   `Equal (==)`

4. Set the second input to:

   `-1`

5. Right-click in empty graph space

6. Search for:

   `Branch`

7. Click:

   `Branch`

8. Connect the white execution pin from:

   `Sequence → Then 0`

   to

   `Branch` (inside the **North** comment box)

9. Connect:
   - `DeltaY == -1` → `Branch.Condition`

---

#### Step 4.8.2 — Remove the North wall from CurrentCell

10. Right-click in empty graph space

11. Search for:

    `Set Members in S_MazeCell`

12. Click:

    `Set Members in S_MazeCell`

13. Drag `CurrentCell` into the graph as **Get**

14. Connect:
    - `CurrentCell` → struct input (left side of `Set Members in S_MazeCell`)

15. Click on `Set Members in S_MazeCell`. In the **Details** panel, enable **only**:

    ✔️ `bWallNorth`

    > Leave all other checkboxes unchecked. Enabled fields are the only ones this node will modify.

16. Set:
    - `bWallNorth = False` (unchecked)

17. Connect the white execution pin from:

    `Branch.True` (North bounds check)

    to

    `Set Members in S_MazeCell` (CurrentCell North)

18. Drag `CurrentCell` into the graph as **Set**

19. Connect:
    - output struct pin of `Set Members in S_MazeCell` → value input on `Set CurrentCell`

> This writes the modified struct back into the local variable. Without this connection the change is lost.

---

#### Step 4.8.3 — Remove the South wall from NeighborCell

20. Right-click in empty graph space

21. Search for:

    `Set Members in S_MazeCell`

22. Click:

    `Set Members in S_MazeCell`

23. Drag `NeighborCell` into the graph as **Get**

24. Connect:
    - `NeighborCell` → struct input (left side of `Set Members in S_MazeCell`)

25. In the **Details** panel, enable **only**:

    ✔️ `bWallSouth`

26. Set:
    - `bWallSouth = False` (unchecked)

27. Connect the white execution pin from:

    `Set CurrentCell` (inside the **North** comment box)

    to

    `Set Members in S_MazeCell` (NeighborCell South)

28. Drag `NeighborCell` into the graph as **Set**

29. Connect:
    - output struct pin of `Set Members in S_MazeCell` → value input on `Set NeighborCell`

---

<a href="{{ '/assets/images/blog/Part2-Step-4.8.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.8.png' | relative_url }}" style="width:100%;" alt="North comment box showing DeltaY == -1 Branch, Set Members removing bWallNorth from CurrentCell written back via Set CurrentCell, then Set Members removing bWallSouth from NeighborCell written back via Set NeighborCell" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Sequence → Then 0 → Branch → Set Members (CurrentCell North) → Set CurrentCell → Set Members (NeighborCell South) → Set NeighborCell`

**Data flow:**

- `DeltaY == -1` → `Branch.Condition`
- `CurrentCell` → `Set Members` → `Set CurrentCell`
- `NeighborCell` → `Set Members` → `Set NeighborCell`

---

### Step 4.9 — Check direction: East

This check runs from `Sequence → Then 1`.

If `DeltaX == 1`:

- the current cell loses its **East** wall
- the neighbor cell loses its **West** wall

Place all nodes for this section **inside the `East (DeltaX = 1)` comment box**.

#### Step 4.9.1 — Check if the direction is East

1. From the **function entry node**, drag from the input pin:

   `DeltaX`

2. Search for:

   `==`

3. Choose:

   `Equal (==)`

4. Set the second input to:

   `1`

5. Right-click in empty graph space

6. Search for:

   `Branch`

7. Click:

   `Branch`

8. Connect the white execution pin from:

   `Sequence → Then 1`

   to

   `Branch` (inside the **East** comment box)

9. Connect:
   - `DeltaX == 1` → `Branch.Condition`

---

#### Step 4.9.2 — Remove the East wall from CurrentCell

10. Right-click in empty graph space

11. Search for:

    `Set Members in S_MazeCell`

12. Click:

    `Set Members in S_MazeCell`

13. Drag `CurrentCell` into the graph as **Get**

14. Connect:
    - `CurrentCell` → struct input (left side of `Set Members in S_MazeCell`)

15. In the **Details** panel, enable **only**:

    ✔️ `bWallEast`

16. Set:
    - `bWallEast = False` (unchecked)

17. Connect the white execution pin from:

    `Branch.True` (East bounds check)

    to

    `Set Members in S_MazeCell` (CurrentCell East)

18. Drag `CurrentCell` into the graph as **Set**

19. Connect:
    - output struct pin of `Set Members in S_MazeCell` → value input on `Set CurrentCell`

---

#### Step 4.9.3 — Remove the West wall from NeighborCell

20. Right-click in empty graph space

21. Search for:

    `Set Members in S_MazeCell`

22. Click:

    `Set Members in S_MazeCell`

23. Drag `NeighborCell` into the graph as **Get**

24. Connect:
    - `NeighborCell` → struct input (left side of `Set Members in S_MazeCell`)

25. In the **Details** panel, enable **only**:

    ✔️ `bWallWest`

26. Set:
    - `bWallWest = False` (unchecked)

27. Connect the white execution pin from:

    `Set CurrentCell` (inside the **East** comment box)

    to

    `Set Members in S_MazeCell` (NeighborCell West)

28. Drag `NeighborCell` into the graph as **Set**

29. Connect:
    - output struct pin of `Set Members in S_MazeCell` → value input on `Set NeighborCell`

---

<a href="{{ '/assets/images/blog/Part2-Step-4.9.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.9.png' | relative_url }}" style="width:100%;" alt="East comment box showing DeltaX == 1 Branch, Set Members removing bWallEast from CurrentCell written back via Set CurrentCell, then Set Members removing bWallWest from NeighborCell written back via Set NeighborCell" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Sequence → Then 1 → Branch → Set Members (CurrentCell East) → Set CurrentCell → Set Members (NeighborCell West) → Set NeighborCell`

**Data flow:**

- `DeltaX == 1` → `Branch.Condition`
- `CurrentCell` → `Set Members` → `Set CurrentCell`
- `NeighborCell` → `Set Members` → `Set NeighborCell`

---

### Step 4.10 — Check direction: South

This check runs from `Sequence → Then 2`.

If `DeltaY == 1`:

- the current cell loses its **South** wall
- the neighbor cell loses its **North** wall

Place all nodes for this section **inside the `South (DeltaY = 1)` comment box**.

#### Step 4.10.1 — Check if the direction is South

1. From the **function entry node**, drag from the input pin:

   `DeltaY`

2. Search for:

   `==`

3. Choose:

   `Equal (==)`

4. Set the second input to:

   `1`

5. Right-click in empty graph space

6. Search for:

   `Branch`

7. Click:

   `Branch`

8. Connect the white execution pin from:

   `Sequence → Then 2`

   to

   `Branch` (inside the **South** comment box)

9. Connect:
   - `DeltaY == 1` → `Branch.Condition`

---

#### Step 4.10.2 — Remove the South wall from CurrentCell

10. Right-click in empty graph space

11. Search for:

    `Set Members in S_MazeCell`

12. Click:

    `Set Members in S_MazeCell`

13. Drag `CurrentCell` into the graph as **Get**

14. Connect:
    - `CurrentCell` → struct input (left side of `Set Members in S_MazeCell`)

15. In the **Details** panel, enable **only**:

    ✔️ `bWallSouth`

16. Set:
    - `bWallSouth = False` (unchecked)

17. Connect the white execution pin from:

    `Branch.True` (South bounds check)

    to

    `Set Members in S_MazeCell` (CurrentCell South)

18. Drag `CurrentCell` into the graph as **Set**

19. Connect:
    - output struct pin of `Set Members in S_MazeCell` → value input on `Set CurrentCell`

---

#### Step 4.10.3 — Remove the North wall from NeighborCell

20. Right-click in empty graph space

21. Search for:

    `Set Members in S_MazeCell`

22. Click:

    `Set Members in S_MazeCell`

23. Drag `NeighborCell` into the graph as **Get**

24. Connect:
    - `NeighborCell` → struct input (left side of `Set Members in S_MazeCell`)

25. In the **Details** panel, enable **only**:

    ✔️ `bWallNorth`

26. Set:
    - `bWallNorth = False` (unchecked)

27. Connect the white execution pin from:

    `Set CurrentCell` (inside the **South** comment box)

    to

    `Set Members in S_MazeCell` (NeighborCell North)

28. Drag `NeighborCell` into the graph as **Set**

29. Connect:
    - output struct pin of `Set Members in S_MazeCell` → value input on `Set NeighborCell`

---

<a href="{{ '/assets/images/blog/Part2-Step-4.10.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.10.png' | relative_url }}" style="width:100%;" alt="South comment box showing DeltaY == 1 Branch, Set Members removing bWallSouth from CurrentCell written back via Set CurrentCell, then Set Members removing bWallNorth from NeighborCell written back via Set NeighborCell" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Sequence → Then 2 → Branch → Set Members (CurrentCell South) → Set CurrentCell → Set Members (NeighborCell North) → Set NeighborCell`

**Data flow:**

- `DeltaY == 1` → `Branch.Condition`
- `CurrentCell` → `Set Members` → `Set CurrentCell`
- `NeighborCell` → `Set Members` → `Set NeighborCell`

---

### Step 4.11 — Check direction: West

This check runs from `Sequence → Then 3`.

If `DeltaX == -1`:

- the current cell loses its **West** wall
- the neighbor cell loses its **East** wall

Place all nodes for this section **inside the `West (DeltaX = -1)` comment box**.

#### Step 4.11.1 — Check if the direction is West

1. From the **function entry node**, drag from the input pin:

   `DeltaX`

2. Search for:

   `==`

3. Choose:

   `Equals (==)`

4. Set the second input to:

   `-1`

5. Right-click in empty graph space

6. Search for:

   `Branch`

7. Click:

   `Branch`

8. Connect the white execution pin from:

   `Sequence → Then 3`

   to

   `Branch` (inside the **West** comment box)

9. Connect:
   - `DeltaX == -1` → `Branch.Condition`

---

#### Step 4.11.2 — Remove the West wall from CurrentCell

10. Right-click in empty graph space

11. Search for:

    `Set Members in S_MazeCell`

12. Click:

    `Set Members in S_MazeCell`

13. Drag `CurrentCell` into the graph as **Get**

14. Connect:
    - `CurrentCell` → struct input (left side of `Set Members in S_MazeCell`)

15. In the **Details** panel, enable **only**:

    ✔️ `bWallWest`

16. Set:
    - `bWallWest = False` (unchecked)

17. Connect the white execution pin from:

    `Branch.True` (West bounds check)

    to

    `Set Members in S_MazeCell` (CurrentCell West)

18. Drag `CurrentCell` into the graph as **Set**

19. Connect:
    - output struct pin of `Set Members in S_MazeCell` → value input on `Set CurrentCell`

---

#### Step 4.11.3 — Remove the East wall from NeighborCell

20. Right-click in empty graph space

21. Search for:

    `Set Members in S_MazeCell`

22. Click:

    `Set Members in S_MazeCell`

23. Drag `NeighborCell` into the graph as **Get**

24. Connect:
    - `NeighborCell` → struct input (left side of `Set Members in S_MazeCell`)

25. In the **Details** panel, enable **only**:

    ✔️ `bWallEast`

26. Set:
    - `bWallEast = False` (unchecked)

27. Connect the white execution pin from:

    `Set CurrentCell` (inside the **West** comment box)

    to

    `Set Members in S_MazeCell` (NeighborCell East)

28. Drag `NeighborCell` into the graph as **Set**

29. Connect:
    - output struct pin of `Set Members in S_MazeCell` → value input on `Set NeighborCell`

---

<a href="{{ '/assets/images/blog/Part2-Step-4.11.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.11.png' | relative_url }}" style="width:100%;" alt="West comment box showing DeltaX == -1 Branch, Set Members removing bWallWest from CurrentCell written back via Set CurrentCell, then Set Members removing bWallEast from NeighborCell written back via Set NeighborCell" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Sequence → Then 3 → Branch → Set Members (CurrentCell West) → Set CurrentCell → Set Members (NeighborCell East) → Set NeighborCell`

**Data flow:**

- `DeltaX == -1` → `Branch.Condition`
- `CurrentCell` → `Set Members` → `Set CurrentCell`
- `NeighborCell` → `Set Members` → `Set NeighborCell`

---

### Step 4.12 — Write updated cells back into MazeGrid

This runs from `Sequence → Then 4`.

Place all nodes for this section **inside the `Write-back to MazeGrid` comment box**.

The local `CurrentCell` and `NeighborCell` variables now hold the correct wall states. This step writes them permanently back into `MazeGrid`.

#### Step 4.12.1 — Add Set Array Elem for CurrentCell

1. Right-click in empty graph space

2. Search for:

   `Set Array Elem`

3. Click:

   `Set Array Elem`

4. Drag `MazeGrid` into the graph as **Get**

5. Connect:
   - `MazeGrid` → **Target Array** on `Set Array Elem`

6. Drag `CurrentCell` into the graph as **Get**

7. Connect:
   - `CurrentCell` → **Item** on `Set Array Elem`

8. From the **function entry node**, drag from the input pin:

   `CurrentIndex`

9. Connect:
   - `CurrentIndex` → **Index** on `Set Array Elem`

10. Connect the white execution pin from:

    `Sequence → Then 4`

    to

    `Set Array Elem` (CurrentCell)

11. In the **Details** panel for `Set Array Elem`, confirm:

    ☐ **Size to Fit** is **unchecked**

> **Size to Fit** would expand the array automatically if the index is out of range. Since `MazeGrid` is already fully populated, leave this unchecked to avoid unintended array growth.

---

#### Step 4.12.2 — Add Set Array Elem for NeighborCell

1. Right-click in empty graph space

2. Search for:

   `Set Array Elem`

3. Click:

   `Set Array Elem`

4. Drag `MazeGrid` into the graph as **Get**

5. Connect:
   - `MazeGrid` → **Target Array** on `Set Array Elem`

6. Drag `NeighborCell` into the graph as **Get**

7. Connect:
   - `NeighborCell` → **Item** on `Set Array Elem`

8. From the **function entry node**, drag from the input pin:

   `NeighborIndex`

9. Connect:
   - `NeighborIndex` → **Index** on `Set Array Elem`

10. Connect the white execution pin from:

    `Set Array Elem` (CurrentCell)

    to

    `Set Array Elem` (NeighborCell)

11. Confirm **Size to Fit** is **unchecked**

---

<a href="{{ '/assets/images/blog/Part2-Step-4.12.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.12.png' | relative_url }}" style="width:100%;" alt="Write-back to MazeGrid comment box showing two Set Array Elem nodes, the first using CurrentCell and CurrentIndex, the second using NeighborCell and NeighborIndex, chained from Sequence Then 4" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Sequence → Then 4 → Set Array Elem (CurrentCell) → Set Array Elem (NeighborCell)`

**Data flow:**

- `MazeGrid` → Target Array (both nodes)
- `CurrentCell` + `CurrentIndex` → `Set Array Elem` (CurrentCell)
- `NeighborCell` + `NeighborIndex` → `Set Array Elem` (NeighborCell)

---

### Step 4.13 — Full function overview

Your `RemoveWallBetween` function is now complete.

The full execution flow is:

```
RemoveWallBetween
→ Set CurrentCell
→ Set NeighborCell
→ Sequence
   → Then 0: DeltaY == -1 → remove North/South walls
   → Then 1: DeltaX == 1  → remove East/West walls
   → Then 2: DeltaY == 1  → remove South/North walls
   → Then 3: DeltaX == -1 → remove West/East walls
   → Then 4: write CurrentCell and NeighborCell back into MazeGrid
```

Only one direction branch will fire per call — whichever matches the actual `DeltaX` / `DeltaY` values passed in. The write-back in `Then 4` always runs regardless of which direction fired.

---

<a href="{{ '/assets/images/blog/Part2-Step-4.13.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-4.13.png' | relative_url }}" style="width:100%;" alt="Complete RemoveWallBetween function showing all four direction checks branching from the Sequence node and the write-back path in Then 4" class="post-image">
</a>

---

## Why this matters

In Unreal Engine, array elements that are structs are always returned as copies. Any changes made to a local struct variable are not automatically saved back to the array. The write-back steps in `Then 4` ensure that the wall changes are permanently stored in `MazeGrid`.

Without the write-back:

- the walls would appear to change locally
- but `MazeGrid` would still show all walls intact
- the maze would never actually be carved

---

## Common mistakes

❌ Forgetting to connect the `Set Members` output back into `Set CurrentCell` or `Set NeighborCell`
✔️ The output struct pin must feed back into the local variable or the change is lost

---

❌ Not clicking **Add pin +** on the Sequence node  
✔️ You need five outputs — `Then 0` through `Then 4`

---

❌ Enabling multiple checkboxes in `Set Members in S_MazeCell`  
✔️ Enable only the one wall being removed — other enabled fields will overwrite data unexpectedly

---

❌ Leaving **Size to Fit** checked on `Set Array Elem`  
✔️ This can cause unintended array growth if an index is ever out of range

---

❌ Forgetting the write-back entirely  
✔️ `MazeGrid` stores structs by value — local changes must be explicitly written back with `Set Array Elem`

---

## Expected result

Your `RemoveWallBetween` function now:

- reads the current and neighbor cells from `MazeGrid`
- determines which walls to remove based on the direction
- updates both local cell variables correctly
- writes both cells back into `MazeGrid`

When called by the maze algorithm, this function permanently carves a passage between any two adjacent cells.

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

## How this function works

This function uses a **stack-based depth-first search**. Unlike true recursion, a stack array never overflows — it is safe to use in Unreal Engine Blueprints regardless of maze size.

The algorithm works like this:

1. Pick a random starting cell and mark it visited
2. Push it onto the stack
3. While the stack is not empty:
   - Look at the top of the stack (the current cell)
   - If it has unvisited neighbors → choose one randomly, remove the wall, mark it visited, push it onto the stack
   - If it has no unvisited neighbors → remove it from the stack (backtrack)

> Backtracking is what allows the algorithm to finish the maze instead of stopping at the first dead end.

---

## Instructions

### Step 5.1 — Create the function

#### Step 5.1.1 — Add the function

1. In the **My Blueprint** panel, find **Functions**

2. Click the **+** button next to **Functions**

3. Name the function:

   `GenerateMaze`

4. Press **Enter**

---

### Step 5.2 — Add local variables

Local variables only exist inside this function.

#### Step 5.2.1 — Find the Local Variables section

1. Look in the **My Blueprint** panel

2. Find the section labeled:

   **Local Variables**

> This section only appears when you are inside a function graph. If you do not see it, make sure you have the `GenerateMaze` graph open.

#### Step 5.2.2 — Add the local variables

3. Click the **+** button next to **Local Variables**

4. Add the following one at a time:

- `Stack` (Array of Integer)
- `CurrentIndex` (Integer)
- `Neighbors` (Array of `S_NeighborInfo`)
- `ChosenNeighbor` (`S_NeighborInfo`)
- `StackTopIndex` (Integer)
- `RandomNeighborIndex` (Integer)

---

<div>
<a href="{{ '/assets/images/blog/Part2-Step-5.2.1a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.2.1a.png' | relative_url }}" style="width:100%;" alt="Local Variables panel showing Stack as an Array of Integer" class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-5.2.1b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.2.1b.png' | relative_url }}" style="width:100%;" alt="Local Variables panel showing CurrentIndex as an Integer" class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-5.2.1c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.2.1c.png' | relative_url }}" style="width:100%;" alt="Local Variables panel showing Neighbors as an Array of S_NeighborInfo" class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-5.2.1d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.2.1d.png' | relative_url }}" style="width:100%;" alt="Local Variables panel showing ChosenNeighbor as S_NeighborInfo" class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-5.2.1e.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.2.1e.png' | relative_url }}" style="width:100%;" alt="Local Variables panel showing StackTopIndex as an Integer" class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-5.2.1f.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.2.1f.png' | relative_url }}" style="width:100%;" alt="Local Variables panel showing RandomNeighborIndex as an Integer" class="post-image">
</a>
</div>

---

### Step 5.3 — Add comment boxes

Before placing any nodes, set up comment boxes to keep the graph organised.

#### Step 5.3.1 — Add the comment boxes

1. Left-click and drag in empty graph space to select an area

2. Press **C**

3. A comment box will appear

4. Name it:

   `Setup`

5. Repeat this process three more times

6. Name them:

- `Loop Body`
- `Has Neighbors`
- `Backtrack`

> You can resize and reposition comment boxes at any time by dragging their edges or title bar.

---

<a href="{{ '/assets/images/blog/Part2-Step-5.3.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.3.png' | relative_url }}" style="width:100%;" alt="Four comment boxes labeled Setup, Loop Body, Has Neighbors, and Backtrack arranged in the Blueprint graph" class="post-image">
</a>

---

### Step 5.4 — Choose the starting cell

Place all nodes for this section **inside the `Setup` comment box**.

#### Step 5.4.1 — Calculate the max valid index

1. Drag `MazeWidth` into the graph as **Get**

2. Drag from the `MazeWidth` pin

3. Search for:

   `*`

4. Choose:

   `Multiply`

5. Drag `MazeHeight` into the graph as **Get**

6. Connect:
   - `MazeHeight` → second input of `*`

7. Drag from the multiply result

8. Search for:

   `-`

9. Choose:

   `Subtract`

10. Set the second input to:

    `1`

#### Step 5.4.2 — Pick a random starting index

11. Drag `RandomStream` into the graph as **Get**

12. Drag from the subtract result

13. Search for:

    `Random Integer in Range from Stream`

14. Click:

    `Random Integer in Range from Stream`

15. Connect:
    - subtract result → `Max`
    - `RandomStream` → `Stream`

16. Set:
    - `Min = 0`

#### Step 5.4.3 — Store the starting index

17. Drag `CurrentIndex` into the graph as **Set**

18. Connect:
    - random result → value input on `Set CurrentIndex`

19. Connect the white execution pin from:

    `GenerateMaze` (function entry node)

    to

    `Set CurrentIndex`

---

### Connections recap

**Execution flow:**
`GenerateMaze → Set CurrentIndex`

**Data flow:**

- `MazeWidth × MazeHeight - 1` → `Max`
- `RandomStream` → `Stream`
- random result → `CurrentIndex`

---

### Step 5.5 — Mark the starting cell as visited

Still inside the **`Setup`** comment box.

#### Step 5.5.1 — Read the starting cell from MazeGrid

1. Drag `CurrentIndex` into the graph as **Get**

2. Drag from the `CurrentIndex` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Drag `MazeGrid` into the graph as **Get**

6. Connect:
   - `MazeGrid` → **Target Array** on `Get (a copy)`

#### Step 5.5.2 — Set bVisited to True

7. Drag from the output of `Get (a copy)`

8. Search for:

   `Set Members in S_MazeCell`

9. Click:

   `Set Members in S_MazeCell`

10. In the **Details** panel, enable **only**:

    ✔️ `bVisited`

11. Set:
    - `bVisited = True` (checked)

#### Step 5.5.3 — Write the updated cell back into MazeGrid

12. Right-click in empty graph space

13. Search for:

    `Set Array Elem`

14. Click:

    `Set Array Elem`

15. Drag `MazeGrid` into the graph as **Get**

16. Connect:
    - `MazeGrid` → **Target Array** on `Set Array Elem`
    - output of `Set Members in S_MazeCell` → **Item** on `Set Array Elem`
    - `CurrentIndex` → **Index** on `Set Array Elem`

17. Confirm **Size to Fit** is **unchecked**

18. Connect the white execution pin from:

    `Set CurrentIndex`

    to

    `Set Members in S_MazeCell`

19. Connect the white execution pin from:

    `Set Members in S_MazeCell`

    to

    `Set Array Elem`

---

### Connections recap

**Execution flow:**
`Set CurrentIndex → Set Members in S_MazeCell → Set Array Elem`

**Data flow:**

- `CurrentIndex` → `Get (a copy).Index`
- `MazeGrid` → `Get (a copy).Target Array`
- `Get (a copy)` output → `Set Members in S_MazeCell`
- `Set Members` output → `Set Array Elem.Item`
- `CurrentIndex` → `Set Array Elem.Index`
- `MazeGrid` → `Set Array Elem.Target Array`

---

### Step 5.6 — Add the starting cell to the Stack

Still inside the **`Setup`** comment box.

#### Step 5.6.1 — Push the starting index onto the Stack

1. Drag `Stack` into the graph as **Get**

2. Drag from the `Stack` pin

3. Search for:

   `Add`

4. Click:

   `Add`

5. Drag `CurrentIndex` into the graph as **Get**

6. Connect:
   - `CurrentIndex` → **Item** on `Add`

7. Connect the white execution pin from:

   `Set Array Elem`

   to

   `Add`

---

### Connections recap

**Execution flow:**
`Set Array Elem → Stack.Add`

**Data flow:**

- `CurrentIndex` → `Stack.Add.Item`

---

## Why this matters

The stack is what allows the algorithm to move forward and backtrack correctly. Without the starting cell on the stack, the While Loop has nothing to work with and will never run.

---

### Step 5.7 — Add the While Loop

The While Loop is the heart of the maze algorithm. It runs once per cell visit or backtrack until the entire maze has been carved.

Place the While Loop **between the `Setup` comment box and the `Loop Body` comment box** so it is clearly visible as the entry point to the loop.

#### Step 5.7.1 — Add the While Loop node

1. Right-click in empty graph space

2. Search for:

   `While Loop`

3. Click:

   `While Loop`

4. Connect the white execution pin from:

   `Stack.Add`

   to

   `While Loop`

#### Step 5.7.2 — Set the loop condition

5. Drag `Stack` into the graph as **Get**

6. Drag from the `Stack` pin

7. Search for:

   `Length`

8. Click:

   `Array Length`

9. Drag from the `Length` result

10. Search for:

    `>`

11. Choose:

    `Greater`

12. Set the second input to:

    `0`

13. Connect:
    - `Stack.Length > 0` → `While Loop.Condition`

---

<a href="{{ '/assets/images/blog/Part2-Step-5.7.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.7.png' | relative_url }}" style="width:100%;" alt="Full Setup comment box" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Stack.Add → While Loop`

**Data flow:**

- `Stack.Length > 0` → `While Loop.Condition`

---

## Why this matters

The loop continues as long as there are cells on the stack. When the stack empties, every reachable cell has been visited and the maze is complete.

---

## Common mistakes

❌ Using `>= 0` instead of `> 0`
✔️ A length of 0 means the stack is empty — the loop must stop

---

❌ Leaving the condition disconnected
✔️ The While Loop must know when to stop or it will run forever

> **Warning:** If the editor freezes when you first test this function, the most likely cause is that `bVisited` is not being written back to `MazeGrid` correctly. Go back and verify Steps 5.5 and 5.12.

---

### Step 5.8 — Find the top of the Stack

Place all nodes for this section **inside the `Loop Body` comment box**.

Each time the loop runs, we need to know which cell we are currently working on. The top of the stack is always the current cell.

#### Step 5.8.1 — Calculate StackTopIndex

1. Drag `Stack` into the graph as **Get**

2. Drag from the `Stack` pin

3. Search for:

   `Length`

4. Click:

   `Array Length`

5. Drag from the `Length` result

6. Search for:

   `-`

7. Choose:

   `Subtract`

8. Set the second input to:

   `1`

9. Drag `StackTopIndex` into the graph as **Set**

10. Connect:
    - subtraction result → value input on `Set StackTopIndex`

11. Connect the white execution pin from:

    `While Loop.Loop Body`

    to

    `Set StackTopIndex`

---

#### Step 5.8.2 — Read the current cell index from the Stack

12. Drag `Stack` into the graph as **Get**

13. Drag from the `Stack` pin

14. Search for:

    `Get (a copy)`

15. Click:

    `Get (a copy)`

16. Drag `StackTopIndex` into the graph as **Get**

17. Connect:
    - `StackTopIndex` → **Index** on `Get (a copy)`

18. Drag `CurrentIndex` into the graph as **Set**

19. Connect:
    - result of `Get (a copy)` → value input on `Set CurrentIndex`

20. Connect the white execution pin from:

    `Set StackTopIndex`

    to

    `Set CurrentIndex`

> This does not remove the entry from the stack — it only reads it. The stack entry is only removed during backtracking in Step 5.14. This is intentional: the current cell stays on the stack until it becomes a dead end.

---

<a href="{{ '/assets/images/blog/Part2-Step-5.8.2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.8.2.png' | relative_url }}" style="width:100%;" alt="Loop Body comment box showing Stack Length minus one stored in StackTopIndex then Stack Get a copy at StackTopIndex stored in CurrentIndex" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`While Loop.Loop Body → Set StackTopIndex → Set CurrentIndex`

**Data flow:**

- `Stack.Length - 1` → `StackTopIndex`
- `Stack[StackTopIndex]` → `CurrentIndex`

---

## Common mistakes

❌ Using index `0` instead of `StackTopIndex`
✔️ The top of the stack is always the last entry, not the first

---

### Step 5.9 — Get unvisited neighbors for the current cell

Still inside the **`Loop Body`** comment box.

#### Step 5.9.1 — Call GetUnvisitedNeighbors

1. Right-click in empty graph space

2. Search for:

   `GetUnvisitedNeighbors`

3. Click:

   `GetUnvisitedNeighbors`

4. Drag `CurrentIndex` into the graph as **Get**

5. Connect:
   - `CurrentIndex` → `CurrentIndex` input on `GetUnvisitedNeighbors`

6. Connect the white execution pin from:

   `Set CurrentIndex`

   to

   `GetUnvisitedNeighbors`

#### Step 5.9.2 — Store the result

7. Drag `Neighbors` into the graph as **Set**

8. Connect:
   - return value of `GetUnvisitedNeighbors` → value input on `Set Neighbors`

9. Connect the white execution pin from:

   `GetUnvisitedNeighbors`

   to

   `Set Neighbors`

---

### Connections recap

**Execution flow:**
`Set CurrentIndex → GetUnvisitedNeighbors → Set Neighbors`

**Data flow:**

- `CurrentIndex` → `GetUnvisitedNeighbors.CurrentIndex`
- returned array → `Neighbors`

---

### Step 5.10 — Check whether any neighbors exist

Still inside the **`Loop Body`** comment box.

This is the main decision point of the algorithm:

- **True** → move forward into a neighbor
- **False** → backtrack by removing the top stack entry

#### Step 5.10.1 — Check the neighbor count

1. Drag `Neighbors` into the graph as **Get**

2. Drag from the `Neighbors` pin

3. Search for:

   `Length`

4. Click:

   `Array Length`

5. Drag from the `Length` result

6. Search for:

   `>`

7. Choose:

   `Greater`

8. Set the second input to:

   `0`

#### Step 5.10.2 — Add the Branch node

9. Right-click in empty graph space

10. Search for:

    `Branch`

11. Click:

    `Branch`

12. Connect the white execution pin from:

    `Set Neighbors`

    to

    `Branch`

13. Connect:
    - `Neighbors.Length > 0` → `Branch.Condition`

---

<a href="{{ '/assets/images/blog/Part2-Step-5.10.2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.10.2.png' | relative_url }}" style="width:100%;" alt="Full loop boidy comment box" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Set Neighbors → Branch`

**Data flow:**

- `Neighbors.Length > 0` → `Branch.Condition`

---

## Why this matters

This is the main decision point in the algorithm.

- **True** = at least one unvisited neighbor exists → move forward
- **False** = no unvisited neighbors → backtrack

---

### Step 5.11 — If neighbors exist, choose one randomly

Place all nodes for this section **inside the `Has Neighbors` comment box**.

#### Step 5.11.1 — Calculate the max neighbor index

1. Drag `Neighbors` into the graph as **Get**

2. Drag from the `Neighbors` pin

3. Search for:

   `Length`

4. Click:

   `Array Length`

5. Drag from the `Length` result

6. Search for:

   `-`

7. Choose:

   `Subtract`

8. Set the second input to:

   `1`

#### Step 5.11.2 — Pick a random neighbor index

9. Drag `RandomStream` into the graph as **Get**

10. Drag from the subtract result

11. Search for:

    `Random Integer in Range from Stream`

12. Click:

    `Random Integer in Range from Stream`

13. Connect:
    - subtract result → `Max`
    - `RandomStream` → `Stream`

14. Set:
    - `Min = 0`

15. Drag `RandomNeighborIndex` into the graph as **Set**

16. Connect:
    - random result → value input on `Set RandomNeighborIndex`

17. Connect the white execution pin from:

    `Branch.True` (at the end of the loop body comment box)

    to

    `Set RandomNeighborIndex`

#### Step 5.11.3 — Read the chosen neighbor

18. Drag `Neighbors` into the graph as **Get**

19. Drag from the `Neighbors` pin

20. Search for:

    `Get (a copy)`

21. Click:

    `Get (a copy)`

22. Drag `RandomNeighborIndex` into the graph as **Get**

23. Connect:
    - `RandomNeighborIndex` → **Index** on `Get (a copy)`

24. Drag `ChosenNeighbor` into the graph as **Set**

25. Connect:
    - result of `Get (a copy)` → value input on `Set ChosenNeighbor`

26. Connect the white execution pin from:

    `Set RandomNeighborIndex`

    to

    `Set ChosenNeighbor`

---

### Connections recap

**Execution flow:**
`Branch.True → Set RandomNeighborIndex → Set ChosenNeighbor`

**Data flow:**

- `Neighbors.Length - 1` → `Max`
- `RandomStream` → `Stream`
- random result → `RandomNeighborIndex`
- `Neighbors[RandomNeighborIndex]` → `ChosenNeighbor`

---

## Common mistakes

❌ Using `Neighbors.Length` as the Max value
✔️ Use `Neighbors.Length - 1` — arrays are zero-based

---

### Step 5.12 — Remove the wall between the current cell and the chosen neighbor

Still inside the **`Has Neighbors`** comment box.

#### Step 5.12.1 — Break the ChosenNeighbor struct

Before calling `RemoveWallBetween`, you need to extract the values stored inside `ChosenNeighbor`. You will reuse this Break node's outputs in Steps 5.12, 5.13, and 5.14, so place it in a clear position.

1. Drag `ChosenNeighbor` into the graph as **Get**

2. Drag from the `ChosenNeighbor` pin

3. Search for:

   `Break S_NeighborInfo`

4. Click:

   `Break S_NeighborInfo`

This gives you three output pins:

- `CellIndex` — the array index of the neighbor cell
- `DeltaX` — the horizontal direction
- `DeltaY` — the vertical direction

> You will use all three of these outputs across the next three steps. Do not create additional Break nodes — reuse the output pins from this one.

#### Step 5.12.2 — Call RemoveWallBetween

5. Right-click in empty graph space

6. Search for:

   `RemoveWallBetween`

7. Click:

   `RemoveWallBetween`

8. Drag `CurrentIndex` into the graph as **Get**

9. Connect:
   - `CurrentIndex` → `CurrentIndex` on `RemoveWallBetween`
   - `CellIndex` (from `Break S_NeighborInfo`) → `NeighborIndex` on `RemoveWallBetween`
   - `DeltaX` (from `Break S_NeighborInfo`) → `DeltaX` on `RemoveWallBetween`
   - `DeltaY` (from `Break S_NeighborInfo`) → `DeltaY` on `RemoveWallBetween`

10. Connect the white execution pin from:

    `Set ChosenNeighbor`

    to

    `RemoveWallBetween`

---

<a href="{{ '/assets/images/blog/Part2-Step-5.12.2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.12.2.png' | relative_url }}" style="width:100%;" alt="Break S_NeighborInfo node splitting ChosenNeighbor into CellIndex DeltaX and DeltaY with all three connected into RemoveWallBetween alongside CurrentIndex" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Set ChosenNeighbor → RemoveWallBetween`

**Data flow:**

- `CurrentIndex` → `RemoveWallBetween.CurrentIndex`
- `Break S_NeighborInfo.CellIndex` → `RemoveWallBetween.NeighborIndex`
- `Break S_NeighborInfo.DeltaX` → `RemoveWallBetween.DeltaX`
- `Break S_NeighborInfo.DeltaY` → `RemoveWallBetween.DeltaY`

---

### Step 5.13 — Mark the chosen neighbor as visited

Still inside the **`Has Neighbors`** comment box.

#### Step 5.13.1 — Read the neighbor cell from MazeGrid

1. Drag `MazeGrid` into the graph as **Get**

2. Drag from the `MazeGrid` pin

3. Search for:

   `Get (a copy)`

4. Click:

   `Get (a copy)`

5. Connect:
   - `CellIndex` (from `Break S_NeighborInfo` in Step 5.12.1) → **Index** on `Get (a copy)`

#### Step 5.13.2 — Set bVisited to True

6. Drag from the output of `Get (a copy)`

7. Search for:

   `Set Members in S_MazeCell`

8. Click:

   `Set Members in S_MazeCell`

9. In the **Details** panel, enable **only**:

   ✔️ `bVisited`

10. Set:
    - `bVisited = True` (checked)

#### Step 5.13.3 — Write the updated cell back into MazeGrid

11. Right-click in empty graph space

12. Search for:

    `Set Array Elem`

13. Click:

    `Set Array Elem`

14. Drag `MazeGrid` into the graph as **Get**

15. Connect:
    - `MazeGrid` → **Target Array** on `Set Array Elem`
    - output of `Set Members in S_MazeCell` → **Item** on `Set Array Elem`
    - `CellIndex` (from `Break S_NeighborInfo` in Step 5.12.1) → **Index** on `Set Array Elem`

16. Confirm **Size to Fit** is **unchecked**

17. Connect the white execution pin from:

    `RemoveWallBetween`

    to

    `Set Members in S_MazeCell`

18. Connect the white execution pin from:

    `Set Members in S_MazeCell`

    to

    `Set Array Elem`

---

<a href="{{ '/assets/images/blog/Part2-Step-5.13.3.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.13.3.png' | relative_url }}" style="width:100%;" alt="MazeGrid Get a copy using CellIndex from Break S_NeighborInfo feeding into Set Members with bVisited True then into Set Array Elem writing back to MazeGrid at CellIndex" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`RemoveWallBetween → Set Members in S_MazeCell → Set Array Elem`

**Data flow:**

- `CellIndex` (reused from Break in Step 5.12.1) → `Get (a copy).Index`
- `MazeGrid` → `Get (a copy).Target Array`
- `Get (a copy)` output → `Set Members in S_MazeCell`
- `Set Members` output → `Set Array Elem.Item`
- `CellIndex` (reused from Break in Step 5.12.1) → `Set Array Elem.Index`
- `MazeGrid` → `Set Array Elem.Target Array`

---

## Why this matters

Once the algorithm enters a cell, that cell must be marked visited immediately. If it is not, `GetUnvisitedNeighbors` will return it as a valid option again and the maze logic will break.

---

### Step 5.14 — Push the chosen neighbor onto the Stack

Still inside the **`Has Neighbors`** comment box.

#### Step 5.14.1 — Add the neighbor to the Stack

1. Drag `Stack` into the graph as **Get**

2. Drag from the `Stack` pin

3. Search for:

   `Add`

4. Click:

   `Add`

5. Connect:
   - `CellIndex` (reused from `Break S_NeighborInfo` in Step 5.12.1) → **Item** on `Add`

6. Connect the white execution pin from:

   `Set Array Elem`

   to

   `Add`

---

<a href="{{ '/assets/images/blog/Part2-Step-5.14.1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.14.1.png' | relative_url }}" style="width:100%;" alt="Full HasNeighbors comment block" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Set Array Elem → Stack.Add`

**Data flow:**

- `CellIndex` (reused from Break in Step 5.12.1) → `Stack.Add.Item`

---

## Why this matters

Pushing the chosen neighbor onto the stack is what drives the depth-first search forward. On the next loop pass, this cell becomes the new current cell.

---

### Step 5.15 — If no neighbors exist, backtrack

Place all nodes for this section **inside the `Backtrack` comment box**.

When the current cell has no unvisited neighbors it is a dead end. The algorithm backtracks by removing the current cell from the top of the stack. On the next loop pass, the previous cell becomes current again.

#### Step 5.15.1 — Remove the top stack entry

1. Drag `Stack` into the graph as **Get**

2. Drag from the `Stack` pin

3. Search for:

   `Remove Index`

4. Click:

   `Remove Index`

5. Drag `StackTopIndex` into the graph as **Get**

6. Connect:
   - `StackTopIndex` → **Index** on `Remove Index`

7. Connect the white execution pin from:

   `Branch.False`

   to

   `Remove Index`

---

<a href="{{ '/assets/images/blog/Part2-Step-5.15.1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.15.1.png' | relative_url }}" style="width:100%;" alt="Backtrack comment box showing Stack Remove Index node using StackTopIndex connected from Branch False" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
`Branch.False → Stack.Remove Index`

**Data flow:**

- `StackTopIndex` → `Remove Index.Index`

---

## Why this matters

Removing the top stack entry forces the algorithm to return to the previous cell and try a different direction. This is what allows the maze to be fully explored rather than stopping at the first dead end.

---

## Common mistakes

❌ Removing index `0` instead of `StackTopIndex`
✔️ Always remove the top entry — the last item in the array

---

### Step 5.16 — Full function overview

Your `GenerateMaze` function is now complete.

The full execution flow is:

```
GenerateMaze
→ Set CurrentIndex (random start)
→ Mark start cell visited → Write back to MazeGrid
→ Push start onto Stack
→ While Loop (Stack.Length > 0)
   Loop Body:
   → Set StackTopIndex
   → Set CurrentIndex from Stack top
   → GetUnvisitedNeighbors
   → Set Neighbors
   → Branch (Neighbors.Length > 0)
      True → Has Neighbors:
         → Set RandomNeighborIndex
         → Set ChosenNeighbor
         → Break S_NeighborInfo (reused through Steps 5.12–5.14)
         → RemoveWallBetween
         → Mark ChosenNeighbor visited → Write back to MazeGrid
         → Push ChosenNeighbor.CellIndex onto Stack
      False → Backtrack:
         → Stack.Remove Index at StackTopIndex
```

---

<div>
<a href="{{ '/assets/images/blog/Part2-Step-5.16A.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.16.png' | relative_url }}" style="width:100%;" alt="Full GenerateMaze function showing Setup comment box with start cell selection and stack push, While Loop, Loop Body comment box with stack top calculation and neighbor check, Has Neighbors comment box with random selection RemoveWallBetween and visited update, and Backtrack comment box with stack removal" class="post-image">
</a>

<a href="{{ '/assets/images/blog/Part2-Step-5.16B.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-5.16.png' | relative_url }}" style="width:100%;" alt="Full GenerateMaze function showing Setup comment box with start cell selection and stack push, While Loop, Loop Body comment box with stack top calculation and neighbor check, Has Neighbors comment box with random selection RemoveWallBetween and visited update, and Backtrack comment box with stack removal" class="post-image">
</a>
</div>

---

### Final Connections recap

**Execution flow:**
`GenerateMaze → Set CurrentIndex → Set Members → Set Array Elem → Stack.Add → While Loop`

**Loop Body:**
`While Loop.Loop Body → Set StackTopIndex → Set CurrentIndex → GetUnvisitedNeighbors → Set Neighbors → Branch`

**Has Neighbors path:**
`Branch.True → Set RandomNeighborIndex → Set ChosenNeighbor → RemoveWallBetween → Set Members → Set Array Elem → Stack.Add`

**Backtrack path:**
`Branch.False → Stack.Remove Index`

**Data flow:**

- `MazeWidth × MazeHeight - 1` → start cell Max index
- `RandomStream` → start cell random selection
- random result → `CurrentIndex`
- `CurrentIndex` → `MazeGrid` lookup for start cell
- updated start cell → `Set Array Elem`
- `CurrentIndex` → `Stack.Add`
- `Stack.Length - 1` → `StackTopIndex`
- `Stack[StackTopIndex]` → `CurrentIndex`
- `CurrentIndex` → `GetUnvisitedNeighbors`
- returned array → `Neighbors`
- `Neighbors.Length - 1` → random neighbor Max index
- `RandomStream` → random neighbor selection
- random result → `RandomNeighborIndex`
- `Neighbors[RandomNeighborIndex]` → `ChosenNeighbor`
- `Break S_NeighborInfo` outputs → `RemoveWallBetween` inputs
- `CellIndex` → visited update and `Stack.Add`
- `StackTopIndex` → `Stack.Remove Index`

---

## Why this matters

This function is the entire brain of the maze generator. Everything built in Parts 1 and 2 exists to support what happens here.

> When this function finishes, every cell in `MazeGrid` has been visited and the correct walls have been removed to form a perfect maze with no loops and no isolated areas.

---

## Common mistakes

❌ Forgetting to mark the start cell visited before the loop
✔️ Do this in the Setup section before the While Loop begins

---

❌ Creating multiple Break S_NeighborInfo nodes for the same ChosenNeighbor
✔️ Place one Break node and reuse its output pins across Steps 5.12 through 5.14

---

❌ Forgetting to mark the chosen neighbor visited after removing the wall
✔️ If this is skipped the algorithm will revisit cells and the maze will break

---

❌ Forgetting to push the chosen neighbor onto the stack
✔️ Without this the depth-first search cannot continue forward

---

❌ Removing the wrong stack entry when backtracking
✔️ Always remove at `StackTopIndex` — the last entry in the array

---

❌ Forgetting to connect the While Loop condition
✔️ An unconnected condition will freeze the editor

---

## Expected result

Your `GenerateMaze` function now:

- selects a random starting cell
- explores the grid using depth-first search
- carves passages by removing walls between cells
- backtracks when dead ends are reached
- terminates cleanly when every cell has been visited

The complete maze now exists in memory inside `MazeGrid`.

---

# Step 6 — Call the Functions in Order

Now we connect the completed functions back into the Construction Script.

---

## What this step does

This step adds the two remaining function calls to the Construction Script and connects them in the correct order so the full maze is built every time the Blueprint runs.

---

## Instructions

### Step 6.1 — Return to the Construction Script

#### Step 6.1.1 — Open the Construction Script

1. At the top of the Blueprint editor, click the:

   **Construction Script** tab

> If you do not see the tab, look in the **My Blueprint** panel under **Functions** and double-click **Construction Script**.

---

### Step 6.2 — Add the function call nodes

#### Step 6.2.1 — Add InitializeGrid

1. Right-click in empty graph space

2. Search for:

   `InitializeGrid`

3. Click:

   `InitializeGrid`

#### Step 6.2.2 — Add GenerateMaze

4. Right-click in empty graph space

5. Search for:

   `GenerateMaze`

6. Click:

   `GenerateMaze`

---

### Step 6.3 — Connect execution flow

#### Step 6.3.1 — Chain the function calls

Connect the white execution pins in this order:

1. Connect the white execution pin from:

   `Set RandomStream`

   to

   `InitializeGrid`

2. Connect the white execution pin from:

   `InitializeGrid`

   to

   `GenerateMaze`

---

<a href="{{ '/assets/images/blog/Part2-Step-6.png' | relative_url }}" style="flex:1;">
  <img src="{{ '/assets/images/blog/Part2-Step-6.png' | relative_url }}" style="width:100%;" alt="Construction Script showing Set RandomStream connected to InitializeGrid then GenerateMaze completing the full execution chain" class="post-image">
</a>

---

### Connections recap

This is the complete Construction Script execution chain from start to finish:

`Construction Script → Clear Instances (FloorHISM) → Clear Instances (WallHISM) → Clear (MazeGrid) → Set RandomStream → InitializeGrid → GenerateMaze`

> Verify that every node in this chain has a connected white execution wire with no gaps. A single missing connection will silently prevent the maze from generating.

**Data flow:**

- `MazeSeed` → `Make Random Stream` → `Set RandomStream`
- `InitializeGrid` → fills `MazeGrid` with empty cells
- `GenerateMaze` → marks cells visited and removes walls

---

## Why this matters

The order must be correct. Each step depends on the previous one:

- old data must be cleared before new data is written
- the random stream must be set before `GenerateMaze` uses it
- `InitializeGrid` must run before `GenerateMaze` so the grid exists to be modified

> If the order is wrong, the maze logic breaks silently — no errors will appear, but the maze will not generate correctly.

---

## Common mistakes

❌ Calling `GenerateMaze` before `InitializeGrid`
✔️ The grid must exist before it can be modified

---

❌ Forgetting to connect one of the function calls into the execution chain
✔️ Blueprint functions only run when the white execution wire reaches them

---

❌ Adding the function calls to a function graph instead of the Construction Script
✔️ Make sure you are in the **Construction Script** tab, not one of the function graphs

---

## Expected result

Your Construction Script now builds the full maze in memory every time the Blueprint is compiled or a property is changed in the level.

---

# What You Have Built So Far

At this point, your system can now:

- clear old data on every rebuild
- create a seeded random stream
- create a full grid of maze cells
- find valid unvisited neighbors
- remove walls between connected cells
- generate a complete maze in memory using depth-first search with backtracking

> Your maze now exists completely in memory. It is not visible yet — that happens in Part 3.

---

## Up Next

In Part 3, we will:

- read the maze data from `MazeGrid`
- convert grid coordinates into world positions
- place floor and wall meshes using the HISM components

This is where the maze finally becomes visible.
