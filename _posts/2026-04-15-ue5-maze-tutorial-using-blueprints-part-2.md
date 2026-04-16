---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 2"
date: 2026-04-15
author: Roberta
categories: [Tutorials]
hidden: true
featured: false
excerpt: >
  In Part 1, we created the grid and valid neighbor system for our procedural maze generator. In this part, we will finally build the maze generation logic itself. We will choose a starting cell, mark it as visited, use valid neighbors to move through the grid, carve passages, and backtrack when we hit dead ends.
---

# Building a Procedural Maze Generator in UE5 Blueprints — Part 2

## Generating the Maze Path

In Part 1, we built the full foundation for our maze system.

At that point, the Blueprint could already:

- create a full grid of wall cells
- convert X/Y coordinates into array indices
- check all four directions
- return only valid, unvisited neighboring cells

Now it is time to make the maze actually generate.

In this part, we will build the logic that:

- picks a start tile
- tracks the current tile
- chooses a valid neighbor
- carves the path between them
- backtracks when there are no valid moves left

> This is the part that actually builds the maze.

---

## Before You Start

This tutorial assumes you already completed Part 1 and already have:

- `MazeCell`
- `BP_MazeGenerator`
- `InitializeGrid`
- `GetIndex`
- `GetValidNeighbors`

You should also already have these variables:

- `GridWidth`
- `GridHeight`
- `TileSize`
- `Grid`

And your `Grid` variable should still be:

- `MazeCell` **Array**

---

## Step 8 — Add the Generation Variables

Before we build the maze path, we need a few new variables to track the generation process.

---

### What this step does

This step creates the variables used to:

- track the current tile
- track the next tile
- store the backtracking path
- support seeded randomness

> These variables control the maze generation process itself.

---

### Instructions

#### Open your Blueprint

1. Open `BP_MazeGenerator`.

---

#### Add the index variables

2. In the **My Blueprint** panel, add the following variables:

- `CurrentIndex` — Integer
- `NextIndex` — Integer

---

#### Add the stack

3. Add another variable:

- `Stack` — Integer Array

Make sure this is an **Integer Array**, not a single Integer.

---

#### Add seed variables

4. Add the following variables:

- `MazeSeed` — Integer
- `RandomStream` — Random Stream

5. For `MazeSeed`:

- Enable **Instance Editable**

6. Suggested default:

- `MazeSeed = 12345`

---

### Connections recap

- `CurrentIndex` → Integer
- `NextIndex` → Integer
- `Stack` → Integer **Array**
- `MazeSeed` → Integer (**Instance Editable**)
- `RandomStream` → Random Stream

---

### Why this matters

These variables give the generator memory.

- `CurrentIndex` → the tile we are currently processing
- `NextIndex` → the tile we plan to move into next
- `Stack` → stores the generation path so we can backtrack
- `MazeSeed` / `RandomStream` → allow repeatable maze results

> Without these, the maze would not know where it is, where it is going, or how to recover from dead ends.

---

### Common mistakes

❌ Creating `Stack` as a single Integer  
✔️ It must be an **Integer Array**

---

❌ Making `RandomStream` Instance Editable  
✔️ Only `MazeSeed` should be editable

---

❌ Skipping `NextIndex`  
✔️ You need it to store the selected neighbor before carving

---

### Expected result

You now have all generation variables set up and ready to use.

---

<a href="{{ '/assets/images/blog/Part2-Step-8.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-8.png' | relative_url }}" alt="Screenshot showing generation variables CurrentIndex, NextIndex, Stack, MazeSeed, and RandomStream" class="post-image">
</a>

---

## Step 9 — Create the `CarvePassage` Function

Now we will create the function that opens the path between the current tile and the next tile.

Create a new function called:

`CarvePassage`

---

### What this function does

This function opens three tiles:

- the current tile
- the wall tile between them
- the next tile

It also marks the next tile as visited.

> This is the function that physically carves the maze path through the grid data.

---

### Inputs

Add the following inputs:

- `CurrentIndex` — Integer
- `NextIndex` — Integer

---

### Outputs

This function does **not** need an output.

It directly modifies the `Grid` array.

---

### Why this matters

The generator moves in steps of **2**, not **1**.

That means when you move from one path cell to the next, there is always a wall tile between them.

This function removes that wall and opens the path.

---

### Common mistakes

❌ Trying to carve directly inside `GenerateMaze`  
✔️ Keeping carving in its own function makes the logic much easier to read

---

❌ Expecting this function to return a value  
✔️ It updates the `Grid` directly

---

### Expected result

You now have a function ready to handle all passage carving.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.png' | relative_url }}" alt="Screenshot showing CarvePassage function with CurrentIndex and NextIndex inputs" class="post-image">
</a>

---

## Step 9.1 — Add Local Variables to `CarvePassage`

Before building the carving logic, we need a few local variables inside the function.

---

### What this step does

This step creates temporary variables used to:

- store the current cell
- store the next cell
- calculate the bridge tile between them

> These values are only needed while the function runs.

---

### Instructions

1. Open the `CarvePassage` function.

2. In the **Local Variables** section, add:

- `CurrentCell` — MazeCell
- `NextCell` — MazeCell
- `MidX` — Integer
- `MidY` — Integer
- `BridgeIndex` — Integer

---

### Connections recap

- `CurrentCell` → MazeCell
- `NextCell` → MazeCell
- `MidX` → Integer
- `MidY` → Integer
- `BridgeIndex` → Integer

---

### Why this matters

We need both end cells so we can calculate the tile in the middle.

> That middle tile is the wall that must be removed.

---

### Common mistakes

❌ Creating regular Blueprint variables instead of Local Variables  
✔️ These should stay local to `CarvePassage`

---

❌ Forgetting `BridgeIndex`  
✔️ You need it to access the wall tile between the two path tiles

---

### Expected result

You now have all the local variables needed for carving.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.1.png' | relative_url }}" alt="Screenshot showing local variables inside CarvePassage" class="post-image">
</a>

---

## Step 9.2 — Read the Current and Next Cells

Now we need to retrieve both tiles from the grid.

---

### What this step does

This step gets the `MazeCell` at `CurrentIndex` and the `MazeCell` at `NextIndex`.

> We need both cells so we can calculate the bridge tile between them.

---

### Instructions

#### Step 1 — Get the current cell

1. Drag `Grid` into the graph as **Get**.
2. Drag off `Grid` and create:
   `Get (a copy)`
3. Connect:
   - `CurrentIndex` → **Index**
4. From the output:
   - drag out and create:
     `Set CurrentCell`

---

#### Step 2 — Get the next cell

5. Drag `Grid` into the graph as **Get**
6. Drag off `Grid` and create:
   `Get (a copy)`
7. Connect:
   - `NextIndex` → **Index**
8. From the output:
   - drag out and create:
     `Set NextCell`

---

#### Step 3 — Connect execution

9. Connect the white execution wires:

- Function entry → `Set CurrentCell`
- `Set CurrentCell` → `Set NextCell`

---

### Connections recap

- `Grid` → `Get (a copy)` using `CurrentIndex`
- Output → `Set CurrentCell`
- `Grid` → `Get (a copy)` using `NextIndex`
- Output → `Set NextCell`

---

### Why this matters

These two cells define the start and end of the movement.

> Once we know those two positions, we can calculate the wall tile between them.

---

### Common mistakes

❌ Using the same index for both gets  
✔️ Use `CurrentIndex` for the first, `NextIndex` for the second

---

❌ Forgetting the execution wire into `Set NextCell`  
✔️ Make sure the logic runs in order

---

### Expected result

You now have both the current cell and the next cell stored locally.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.2.png' | relative_url }}" alt="Screenshot showing Grid Get (a copy) for CurrentIndex and NextIndex feeding Set CurrentCell and Set NextCell" class="post-image">
</a>

---

## Step 9.3 — Calculate the Bridge Tile

Now we will calculate the tile that sits between the current tile and the next tile.

---

### What this step does

This step finds the midpoint between the two cells.

> That midpoint is the wall tile that must be removed.

---

### Instructions

#### Step 1 — Break the structs

1. Drag off `CurrentCell` and create:
   `Break MazeCell`

2. Drag off `NextCell` and create:
   `Break MazeCell`

---

#### Step 2 — Calculate MidX

3. Take `CurrentCell.X`
4. Add `NextCell.X`
5. Divide the result by `2`
6. Drag off the result and create:
   `Set MidX`

---

#### Step 3 — Calculate MidY

7. Take `CurrentCell.Y`
8. Add `NextCell.Y`
9. Divide the result by `2`
10. Drag off the result and create:
    `Set MidY`

---

#### Step 4 — Convert midpoint to BridgeIndex

11. Call `GetIndex`
12. Connect:
    - `MidX` → `X`
    - `MidY` → `Y`

13. From the return value:
    - create:
      `Set BridgeIndex`

14. Connect the execution flow:

- `Set NextCell` → `Set MidX`
- `Set MidX` → `Set MidY`
- `Set MidY` → `GetIndex`
- `GetIndex` → `Set BridgeIndex`

---

### Connections recap

- `Break CurrentCell` + `Break NextCell`
- `(CurrentX + NextX) / 2` → `MidX`
- `(CurrentY + NextY) / 2` → `MidY`
- `GetIndex(MidX, MidY)` → `BridgeIndex`

---

### Why this matters

If the current tile is at `(1,1)` and the next tile is at `(3,1)`, the bridge tile is `(2,1)`.

> That bridge tile is the wall between the two cells.

---

### Common mistakes

❌ Forgetting to divide by `2`  
✔️ You must average the coordinates

---

❌ Trying to guess the bridge tile manually  
✔️ Always calculate the midpoint

---

### Expected result

You now know which wall tile sits between the current and next path tiles.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.3.png' | relative_url }}" alt="Screenshot showing midpoint calculation and BridgeIndex setup" class="post-image">
</a>

---

## Step 9.4 — Open the Current Tile

Now we will mark the current tile as open.

---

### What this step does

This step sets the current tile’s `IsWall` value to `false`.

> This ensures the current tile is part of the carved path.

---

### Instructions

#### Step 1 — Get the current cell again

1. Drag `Grid` into the graph as **Get**
2. Drag off `Grid` and create:
   `Get (a copy)`
3. Connect:
   - `CurrentIndex` → **Index**

---

#### Step 2 — Modify the struct

4. Drag off the result and create:
   `Set Members in MazeCell`

5. In the node details, expose:
   - `IsWall`

6. Set:

- `IsWall = false`

---

#### Step 3 — Write it back into the Grid

7. Drag `Grid` into the graph as **Get**
8. Drag off it and create:
   `Set Array Elem`

9. Connect:

- `Grid` → **Target Array**
- `CurrentIndex` → **Index**
- modified MazeCell → **Item**

10. Continue execution from `Set BridgeIndex` into this section.

---

### Connections recap

- `Grid` → `Get (a copy)` using `CurrentIndex`
- `Set Members in MazeCell` → `IsWall = false`
- `Set Array Elem` writes the modified cell back to `Grid`

---

### Why this matters

The current tile should always be open if the generator is standing on it.

> This keeps the carving logic consistent.

---

### Common mistakes

❌ Changing the struct but not writing it back  
✔️ Always use `Set Array Elem`

---

❌ Forgetting to expose `IsWall` on `Set Members in MazeCell`  
✔️ You must expose the field before editing it

---

### Expected result

The current tile is now marked as open.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.4.png' | relative_url }}" alt="Screenshot showing current cell opened with Set Members in MazeCell and Set Array Elem" class="post-image">
</a>

---

## Step 9.5 — Open the Bridge Tile

Now we will remove the wall between the current tile and the next tile.

---

### What this step does

This step sets the bridge tile’s `IsWall` value to `false`.

> This is what actually opens the passage between the two cells.

---

### Instructions

#### Step 1 — Get the bridge cell

1. Drag `Grid` into the graph as **Get**
2. Drag off it and create:
   `Get (a copy)`
3. Connect:
   - `BridgeIndex` → **Index**

---

#### Step 2 — Modify the struct

4. Drag off the result and create:
   `Set Members in MazeCell`

5. Expose:

- `IsWall`

6. Set:

- `IsWall = false`

---

#### Step 3 — Write it back into the Grid

7. Drag `Grid` into the graph as **Get**
8. Drag off it and create:
   `Set Array Elem`

9. Connect:

- `Grid` → **Target Array**
- `BridgeIndex` → **Index**
- modified MazeCell → **Item**

10. Continue execution from the previous section into this section.

---

### Connections recap

- `Grid` → `Get (a copy)` using `BridgeIndex`
- `Set Members in MazeCell` → `IsWall = false`
- `Set Array Elem` writes the modified bridge tile back to `Grid`

---

### Why this matters

Without this step, the generator would move into the next tile but leave the wall between them intact.

> This is the step that actually cuts the passage through the wall.

---

### Common mistakes

❌ Using `CurrentIndex` instead of `BridgeIndex`  
✔️ Make sure this step edits the bridge tile

---

❌ Forgetting to write the modified struct back into the array  
✔️ Always use `Set Array Elem`

---

### Expected result

The bridge tile is now open.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.5.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.5.png' | relative_url }}" alt="Screenshot showing bridge cell opened with Set Members in MazeCell and Set Array Elem" class="post-image">
</a>

---

## Step 9.6 — Open and Visit the Next Tile

Now we will mark the destination tile as both open and visited.

---

### What this step does

This step prepares the next tile to become part of the maze path.

> It becomes open floor and is marked as already used.

---

### Instructions

#### Step 1 — Get the next cell

1. Drag `Grid` into the graph as **Get**
2. Drag off it and create:
   `Get (a copy)`
3. Connect:

- `NextIndex` → **Index**

---

#### Step 2 — Modify the struct

4. Drag off the result and create:
   `Set Members in MazeCell`

5. Expose:

- `Visited`
- `IsWall`

6. Set:

- `Visited = true`
- `IsWall = false`

---

#### Step 3 — Write it back into the Grid

7. Drag `Grid` into the graph as **Get**
8. Drag off it and create:
   `Set Array Elem`

9. Connect:

- `Grid` → **Target Array**
- `NextIndex` → **Index**
- modified MazeCell → **Item**

---

### Connections recap

- `Grid` → `Get (a copy)` using `NextIndex`
- `Set Members in MazeCell` → `Visited = true`, `IsWall = false`
- `Set Array Elem` writes the modified next tile back into `Grid`

---

### Why this matters

The next tile is now officially part of the maze.

> It is open and will no longer be treated as an unvisited neighbor later.

---

### Common mistakes

❌ Setting only `Visited` and forgetting `IsWall`  
✔️ The next tile must be both visited and open

---

❌ Using the wrong index  
✔️ This step uses `NextIndex`

---

### Expected result

At the end of `CarvePassage`, the current tile, bridge tile, and next tile are all correctly opened, and the next tile is marked visited.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.6.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.6.png' | relative_url }}" alt="Screenshot showing next cell marked visited and opened" class="post-image">
</a>

---

## Step 10 — Create the `GenerateMaze` Function

Now that we can carve passages, we can build the full generation loop.

Create a new function called:

`GenerateMaze`

---

### What this function does

This function:

- picks a starting tile
- marks it as visited
- pushes it onto the stack
- loops until the stack is empty
- moves forward when neighbors exist
- backtracks when they do not

> This is the recursive backtracking maze generator.

---

### Inputs

This function does **not** need inputs.

---

### Outputs

This function does **not** need outputs.

It directly updates the maze data stored in `Grid`.

---

### Expected result

You now have a function ready to contain the full generation loop.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.png' | relative_url }}" alt="Screenshot showing GenerateMaze function created" class="post-image">
</a>

---

## Step 10.1 — Clear the Stack

Before generating a new maze, we need to make sure the stack is empty.

---

### What this step does

This step resets the backtracking stack before generation begins.

> It prevents old data from previous runs from interfering with the new maze.

---

### Instructions

1. Open the `GenerateMaze` function.
2. Drag `Stack` into the graph as **Get**
3. Drag off it and create:
   `Clear`

4. Make this the first executable node in the function.

---

### Connections recap

- Function entry → `Clear`
- `Stack` → **Target Array**

---

### Why this matters

If the stack is not cleared first:

- old indices can remain in memory
- generation will behave unpredictably
- backtracking may break immediately

---

### Common mistakes

❌ Forgetting to clear the stack  
✔️ Always clear it before generation

---

### Expected result

The stack is now empty and ready for a new maze path.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.1.png' | relative_url }}" alt="Screenshot showing Clear Stack at the start of GenerateMaze" class="post-image">
</a>

---

## Step 10.2 — Initialize the Random Stream

Now we will set up the random stream using `MazeSeed`.

This step is optional if you do not care about repeatable mazes, but it is recommended.

---

### What this step does

This step creates a seeded random stream.

> The same seed will always generate the same maze.

---

### Instructions

1. Drag `MazeSeed` into the graph as **Get**
2. Drag off it and create:
   `Make Random Stream`
3. From the result:
   - create:
     `Set RandomStream`

4. Connect execution:

- `Clear Stack` → `Set RandomStream`

---

### Connections recap

- `MazeSeed` → `Make Random Stream`
- `Make Random Stream` → `Set RandomStream`

---

### Why this matters

This makes the generator repeatable.

> If you use the same seed, you get the same maze.

That is extremely helpful for testing.

---

### Common mistakes

❌ Using `RandomStream` without initializing it  
✔️ Set it first from `MazeSeed`

---

### Expected result

`RandomStream` is now ready to be used for neighbor selection.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.2.png' | relative_url }}" alt="Screenshot showing MazeSeed feeding Make Random Stream and Set RandomStream" class="post-image">
</a>

---

## Step 10.3 — Choose the Start Tile

We now need a valid starting cell inside the maze.

We will use:

- `X = 1`
- `Y = 1`

---

### What this step does

This step chooses the starting tile by converting `(1,1)` into a grid index.

> This keeps the generator off the outer border.

---

### Instructions

1. From the previous execution wire, call:
   `GetIndex`

2. Set:

- `X = 1`
- `Y = 1`

3. From the return value:
   - create:
     `Set CurrentIndex`

---

### Connections recap

- `GetIndex(X=1, Y=1)` → `Set CurrentIndex`

---

### Why this matters

`(1,1)` is a valid interior tile.

> Starting at array index `0` would place the generator on a corner border tile, which is not what we want.

---

### Common mistakes

❌ Starting at array index `0`  
✔️ Use `GetIndex(1,1)`

---

### Expected result

`CurrentIndex` now points to the start tile.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.3.png' | relative_url }}" alt="Screenshot showing GetIndex with X=1 and Y=1 feeding Set CurrentIndex" class="post-image">
</a>

---

## Step 10.4 — Mark the Start Tile

Now we will mark the start tile as open and visited.

---

### What this step does

This step turns the starting tile into the first path tile in the maze.

> The generator is now officially standing on a valid carved tile.

---

### Instructions

#### Step 1 — Get the start tile

1. Drag `Grid` into the graph as **Get**
2. Drag off it and create:
   `Get (a copy)`
3. Connect:

- `CurrentIndex` → **Index**

---

#### Step 2 — Modify the tile

4. Drag off the result and create:
   `Set Members in MazeCell`

5. Expose:

- `Visited`
- `IsWall`

6. Set:

- `Visited = true`
- `IsWall = false`

---

#### Step 3 — Write it back

7. Drag `Grid` into the graph as **Get**
8. Drag off it and create:
   `Set Array Elem`

9. Connect:

- `Grid` → **Target Array**
- `CurrentIndex` → **Index**
- modified MazeCell → **Item**

---

### Connections recap

- Start tile → `Visited = true`
- Start tile → `IsWall = false`
- modified tile → `Set Array Elem`

---

### Why this matters

The first tile must already belong to the maze.

> Otherwise the generator would begin on a wall tile that was never carved.

---

### Common mistakes

❌ Marking the tile visited but leaving it as a wall  
✔️ Set both values

---

### Expected result

The start tile is now open and visited.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.4.png' | relative_url }}" alt="Screenshot showing start tile marked visited and open" class="post-image">
</a>

---

## Step 10.5 — Push the Start Tile onto the Stack

Now that the start tile is ready, we need to store it in the stack.

---

### What this step does

This step adds the start tile to the stack so the generator has a path history to work from.

> This is the beginning of the backtracking path.

---

### Instructions

1. Drag `Stack` into the graph as **Get**
2. Drag off it and create:
   `Add`

3. Connect:

- `Stack` → **Target Array**
- `CurrentIndex` → **Item**

---

### Connections recap

- `Stack` → `Add`
- `CurrentIndex` → **Item**

---

### Why this matters

The stack remembers where the generator has been.

> The last item in the stack is always the tile we are currently exploring from.

---

### Common mistakes

❌ Forgetting to add the start tile to the stack  
✔️ The maze loop depends on the stack

---

### Expected result

The stack now contains the starting tile.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.5.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.5.png' | relative_url }}" alt="Screenshot showing CurrentIndex being added to Stack" class="post-image">
</a>

---

## Step 10.6 — Add the While Loop

Now we will build the main loop that continues until the stack is empty.

---

### What this step does

This step keeps generation running while there are still tiles left to explore or backtrack to.

> When the stack becomes empty, the maze is finished.

---

### Instructions

1. Add a `WhileLoop` node.
2. Drag `Stack` into the graph as **Get**
3. Drag off it and create:
   `Length`
4. Compare:
   `Length > 0`
5. Connect that result into the `Condition` pin of the `WhileLoop`

6. Connect execution:

- previous step → `WhileLoop`

---

### Connections recap

- `Stack Length > 0` → `WhileLoop Condition`

---

### Why this matters

As long as the stack still has items, the generator still has somewhere to continue or backtrack to.

> This loop is the heart of the maze generation algorithm.

---

### Common mistakes

❌ Using `>= 0`  
✔️ Use `> 0`

---

### Expected result

The maze loop will continue running until the stack is empty.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.6.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.6.png' | relative_url }}" alt="Screenshot showing WhileLoop with Stack Length greater than 0" class="post-image">
</a>

---

## Step 10.7 — Get the Current Tile from the Stack

Inside the loop, we need to get the tile at the top of the stack.

---

### What this step does

This step sets `CurrentIndex` to the last item in the stack.

> That last item is the tile we are currently exploring from.

---

### Instructions

#### Step 1 — Get the last stack index

1. Drag `Stack` into the graph as **Get**
2. Drag off it and create:
   `Last Index`

#### Step 2 — Get the stack item

3. Drag `Stack` into the graph again as **Get**
4. Drag off it and create:
   `Get (a copy)`

5. Connect:

- `Last Index` → **Index**

#### Step 3 — Store it

6. Drag off the result and create:
   `Set CurrentIndex`

7. Connect execution:

- `WhileLoop Loop Body` → `Set CurrentIndex`

---

### Connections recap

- `Stack` → `Last Index`
- `Stack` → `Get (a copy)` using Last Index
- output → `Set CurrentIndex`

---

### Why this matters

The stack controls where the generator is.

> The last tile in the stack is always the active tile.

---

### Common mistakes

❌ Using the first element in the stack  
✔️ Use the last element

---

### Expected result

`CurrentIndex` now matches the tile at the top of the stack.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.7.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.7.png' | relative_url }}" alt="Screenshot showing Stack Last Index feeding Get a copy then Set CurrentIndex" class="post-image">
</a>

---

## Step 10.8 — Get the Valid Neighbors

Now we ask the system which neighbors are valid from the current tile.

---

### What this step does

This step calls `GetValidNeighbors` using the current tile and returns an array of unvisited, in-bounds neighbors.

> These are the only tiles the maze is allowed to move into next.

---

### Instructions

1. From `Set CurrentIndex`, call:
   `GetValidNeighbors`

2. Connect:

- `CurrentIndex` → `CurrentIndex`

3. Create a local variable inside `GenerateMaze`:

- `ValidNeighbors` — Integer Array

4. Store the output of `GetValidNeighbors` in:

- `Set ValidNeighbors`

---

### Connections recap

- `CurrentIndex` → `GetValidNeighbors`
- returned array → `Set ValidNeighbors`

---

### Why this matters

This gives the generator a list of all possible next moves.

> Without this, the maze would not know where it can go next.

---

### Common mistakes

❌ Forgetting to store the result  
✔️ Save it in `ValidNeighbors`

---

### Expected result

You now have an array containing all valid next moves.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.8.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.8.png' | relative_url }}" alt="Screenshot showing GetValidNeighbors called using CurrentIndex and stored in ValidNeighbors" class="post-image">
</a>

---

## Step 10.9 — Check if Any Neighbors Exist

Now we need to decide whether to move forward or backtrack.

---

### What this step does

This step checks whether `ValidNeighbors` contains any items.

> If the array is empty, the generator has hit a dead end.

---

### Instructions

1. Drag `ValidNeighbors` into the graph as **Get**
2. Drag off it and create:
   `Length`
3. Compare:
   `Length > 0`
4. Add a `Branch`
5. Connect:

- result of `Length > 0` → `Branch Condition`

6. Connect execution:

- `Set ValidNeighbors` → `Branch`

---

### Connections recap

- `ValidNeighbors Length > 0` → `Branch Condition`

---

### Why this matters

This is the decision point of the maze algorithm.

> If valid neighbors exist, move forward. If not, backtrack.

---

### Common mistakes

❌ Skipping the Branch and choosing a random index anyway  
✔️ Only choose a random neighbor if the array is not empty

---

### Expected result

The loop now splits into two paths:

- True = move forward
- False = backtrack

---

<a href="{{ '/assets/images/blog/Part2-Step-10.9.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.9.png' | relative_url }}" alt="Screenshot showing ValidNeighbors Length greater than 0 feeding a Branch" class="post-image">
</a>

---

## Step 10.10 — Pick a Random Neighbor

If neighbors exist, we now choose one at random.

---

### What this step does

This step selects one valid neighbor from the `ValidNeighbors` array.

> This becomes the next tile the maze will carve into.

---

### Instructions

#### Step 1 — Build the random range

1. Drag `ValidNeighbors` into the graph as **Get**
2. Drag off it and create:
   `Length`
3. Subtract:
   `1`

This gives the maximum valid array index.

---

#### Step 2 — Pick the random index

4. From the **True** pin of the Branch, create either:

- `Random Integer in Range from Stream`  
  or
- `Random Integer in Range`

5. Set:

- Min = `0`
- Max = `ValidNeighbors Length - 1`

If using the stream version:

- connect `RandomStream`

---

#### Step 3 — Read the selected neighbor

6. Drag `ValidNeighbors` into the graph as **Get**
7. Drag off it and create:
   `Get (a copy)`
8. Connect the random result into the **Index**
9. From the result:
   - create:
     `Set NextIndex`

---

### Connections recap

- `ValidNeighbors Length - 1` → random Max
- random result → `Get (a copy)` on `ValidNeighbors`
- selected value → `Set NextIndex`

---

### Why this matters

This is the step that gives the maze its shape.

> The chosen neighbor becomes the next tile the maze will move into.

---

### Common mistakes

❌ Using `Length` directly as Max  
✔️ Use `Length - 1`

---

❌ Choosing a random value from an empty array  
✔️ Always do this only on the Branch True path

---

### Expected result

`NextIndex` now stores the chosen next tile.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.10.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.10.png' | relative_url }}" alt="Screenshot showing random neighbor selection from ValidNeighbors and Set NextIndex" class="post-image">
</a>

---

## Step 10.11 — Carve the Passage

Now we connect the current tile to the next tile.

---

### What this step does

This step calls `CarvePassage` so the maze opens:

- current tile
- bridge tile
- next tile

> This is the moment the maze actually expands.

---

### Instructions

1. Call:
   `CarvePassage`

2. Connect:

- `CurrentIndex` → `CurrentIndex`
- `NextIndex` → `NextIndex`

3. Connect execution:

- `Set NextIndex` → `CarvePassage`

---

### Connections recap

- `CurrentIndex` + `NextIndex` → `CarvePassage`

---

### Why this matters

Without this step, the generator would select a next tile but never actually carve the path to it.

> This is what turns the grid data into an actual maze structure.

---

### Common mistakes

❌ Marking the next tile visited without carving the bridge  
✔️ Always call `CarvePassage`

---

### Expected result

The path between the current tile and the chosen neighbor is now opened.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.11.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.11.png' | relative_url }}" alt="Screenshot showing CarvePassage called with CurrentIndex and NextIndex" class="post-image">
</a>

---

## Step 10.12 — Push the Next Tile onto the Stack

After carving into the next tile, add it to the stack.

---

### What this step does

This step stores the new tile at the top of the stack.

> On the next loop, this becomes the current tile.

---

### Instructions

1. Drag `Stack` into the graph as **Get**
2. Drag off it and create:
   `Add`
3. Connect:

- `Stack` → **Target Array**
- `NextIndex` → **Item**

4. Connect execution:

- `CarvePassage` → `Add`

---

### Connections recap

- `Stack` → `Add`
- `NextIndex` → **Item**

---

### Why this matters

This continues the path forward.

> The stack always grows when the maze successfully moves into a new tile.

---

### Common mistakes

❌ Forgetting to push `NextIndex`  
✔️ Add it to the stack after carving

---

### Expected result

The newly carved tile is now on the stack and ready to become the next active tile.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.12.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.12.png' | relative_url }}" alt="Screenshot showing NextIndex added to Stack" class="post-image">
</a>

---

## Step 10.13 — Backtrack When No Neighbors Exist

If no neighbors are available, we need to remove the current tile from the stack.

---

### What this step does

This step removes the dead-end tile from the stack.

> That causes the next loop to fall back to the previous tile automatically.

---

### Instructions

1. From the **False** pin of the neighbor Branch:
   - drag `Stack` into the graph as **Get**
   - drag off it and create:
     `Last Index`

2. Drag `Stack` into the graph again as **Get**
3. Drag off it and create:
   `Remove Index`

4. Connect:

- `Stack` → **Target Array**
- `Last Index` → **Index**

---

### Connections recap

- Branch False → `Remove Index`
- `Stack Last Index` → `Remove Index Index`

---

### Why this matters

This is the backtracking part of the algorithm.

> When the maze hits a dead end, it goes backward until it finds another tile with unused neighbors.

---

### Common mistakes

❌ Removing the wrong stack index  
✔️ Remove the last index

---

❌ Clearing the whole stack instead of removing one item  
✔️ Only remove the current dead-end tile

---

### Expected result

If the current tile has no valid neighbors, it is removed from the stack and the generator backs up automatically.

---

<a href="{{ '/assets/images/blog/Part2-Step-10.13.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-10.13.png' | relative_url }}" alt="Screenshot showing Remove Index used to backtrack from the Stack" class="post-image">
</a>

---

## Step 11 — Call the Functions in Order

Now that the maze logic is built, you need to call the functions in the correct order.

---

### What this step does

This step ensures the maze is built from a clean grid before generation starts.

> Maze generation only works correctly if the grid exists first.

---

### Instructions

At minimum, your main execution flow should be:

1. `InitializeGrid`
2. `GenerateMaze`

If you already have a function that builds the visible wall meshes, call it after generation.

So the final order becomes:

- `InitializeGrid`
- `GenerateMaze`
- `BuildMazeMeshes` _(if already created)_

---

### Connections recap

- `InitializeGrid` → `GenerateMaze`
- `GenerateMaze` → `BuildMazeMeshes` _(optional if built already)_

---

### Why this matters

The maze cannot be generated before the grid exists.

> The order matters.

---

### Common mistakes

❌ Calling `GenerateMaze` before `InitializeGrid`  
✔️ Always initialize the grid first

---

### Expected result

The maze generation system now runs in the correct order.

---

<a href="{{ '/assets/images/blog/Part2-Step-11.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-11.png' | relative_url }}" alt="Screenshot showing InitializeGrid, GenerateMaze, and optionally BuildMazeMeshes in order" class="post-image">
</a>

---

# Final Maze Generation Flow

Your maze generator should now work like this:

    InitializeGrid
      → GenerateMaze

Inside `GenerateMaze`:

- clear the stack
- initialize the random stream
- choose the start tile
- mark the start tile visited
- add the start tile to the stack
- while the stack is not empty:
  - set `CurrentIndex` from the top of the stack
  - get valid neighbors
  - if neighbors exist:
    - choose one randomly
    - set `NextIndex`
    - call `CarvePassage`
    - add `NextIndex` to the stack
  - if no neighbors exist:
    - remove the current tile from the stack

> That is the full maze generation loop.

---

# What You Have Built So Far

At this point, your system can now:

- create a full grid of wall cells
- locate cells using X/Y conversion
- find valid neighboring cells
- choose a start tile
- carve through wall tiles
- mark visited cells
- move forward through the maze
- backtrack when stuck

That is the full maze generation logic.

In the next part, we can render the maze visually using Instanced Static Meshes so it actually appears in the world.

---

## Beginner Notes

If you are new to Blueprints, here are a few helpful reminders:

---

### `Get (a copy)`

When you need one item from an array, Unreal often uses:

`Get (a copy)`

That means:

> retrieve one array element using an index

---

### `Set Members in MazeCell`

This node lets you change only specific fields inside the struct.

That is useful because:

- you can set `Visited`
- or set `IsWall`
- without rebuilding the whole struct manually

---

### `Set Array Elem`

Changing a struct is not enough by itself.

After editing a struct, you must write it back into the array using:

`Set Array Elem`

Otherwise the grid will not update.

---

### The stack

The stack is what makes backtracking work.

- moving forward → add to stack
- dead end → remove from stack

That is what allows the generator to explore the entire maze.

---

## Suggested Defaults

For a simple test maze, try:

- `GridWidth = 21`
- `GridHeight = 21`
- `TileSize = 100`
- `MazeSeed = 12345`

Odd grid sizes work best for this style of maze generator.

---

## Up Next

Part 3 will render the maze visually using Instanced Static Meshes so the generated data becomes a visible maze in the level.
