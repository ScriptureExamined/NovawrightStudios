---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 2"
date: 2026-04-15
author: Roberta
categories: [Tutorials]
published: false
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
     (this pin may be labeled **Index** or **Dimension 1 Integer**)
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
     (this pin may be labeled **Index** or **Dimension 1 Integer**)
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

Now we need to find the wall tile that sits between the current tile and the next tile.

Because our maze moves **2 cells at a time**, there is always **1 cell in the middle**. That middle cell is the wall we need to remove.

---

### What this step does

This step calculates the midpoint between:

- `CurrentCell`
- `NextCell`

That midpoint becomes the bridge tile.

> This is the wall tile that will be turned into an open passage.

---

### Instructions

#### Step 1 — Break the `CurrentCell` struct

1. In the `CarvePassage` function, locate your local variable:
   `CurrentCell`

2. Drag `CurrentCell` into the graph as **Get**

3. Drag off the `CurrentCell` pin and search for:
   `Break MazeCell`

4. Click `Break MazeCell`

You should now see the outputs:

- `X`
- `Y`
- `Visited`
- `IsWall`

We only need `X` and `Y` here.

---

#### Step 2 — Break the `NextCell` struct

5. Locate your local variable:
   `NextCell`

6. Drag `NextCell` into the graph as **Get**

7. Drag off the `NextCell` pin and search for:
   `Break MazeCell`

8. Click `Break MazeCell`

Again, we only need:

- `X`
- `Y`

---

#### Step 3 — Calculate `MidX`

Now we will calculate the X coordinate of the bridge tile.

9. From `Break CurrentCell`, drag off the `X` pin

10. Search for:
    `+`

11. Choose the integer **Add** node

12. From `Break NextCell`, connect:
    - `X` → second input of the **Add** node

You now have:

`CurrentCell.X + NextCell.X`

13. Drag off the output of the **Add** node

14. Search for:
    `/`

15. Choose the integer **Divide** node

16. Set the second input of the Divide node to:
    `2`

You now have:

`(CurrentCell.X + NextCell.X) / 2`

17. Drag off the output of the Divide node

18. Search for:
    `Set MidX`

19. Click `Set MidX`

20. Connect the Divide result into the value pin of `Set MidX`

---

#### Step 4 — Calculate `MidY`

Now we do the same thing for the Y coordinate.

21. From `Break CurrentCell`, drag off the `Y` pin

22. Search for:
    `+`

23. Choose the integer **Add** node

24. From `Break NextCell`, connect:
    - `Y` → second input of the **Add** node

You now have:

`CurrentCell.Y + NextCell.Y`

25. Drag off the output of that **Add** node

26. Search for:
    `/`

27. Choose the integer **Divide** node

28. Set the second input of the Divide node to:
    `2`

You now have:

`(CurrentCell.Y + NextCell.Y) / 2`

29. Drag off the output of the Divide node

30. Search for:
    `Set MidY`

31. Click `Set MidY`

32. Connect the Divide result into the value pin of `Set MidY`

---

#### Step 5 — Connect the execution wires

Now wire the white execution pins so the steps run in order.

33. Connect:

- `Set NextCell` → `Set MidX`
- `Set MidX` → `Set MidY`

At this point, your flow should move in this order:

- get current cell
- get next cell
- calculate MidX
- calculate MidY

---

### Connections recap

#### MidX

- `CurrentCell.X` → Add
- `NextCell.X` → Add
- Add result → Divide
- `2` → Divide
- Divide result → `Set MidX`

#### MidY

- `CurrentCell.Y` → Add
- `NextCell.Y` → Add
- Add result → Divide
- `2` → Divide
- Divide result → `Set MidY`

#### Execution

- `Set NextCell` → `Set MidX`
- `Set MidX` → `Set MidY`

---

### Why this matters

We are finding the tile directly between the current tile and the next tile.

For example:

- Current tile = `(1,1)`
- Next tile = `(3,1)`

Then:

- `MidX = (1 + 3) / 2 = 2`
- `MidY = (1 + 1) / 2 = 1`

So the bridge tile is:

`(2,1)`

> That is the wall tile we need to remove to connect the two path tiles.

---

### Common mistakes

❌ Forgetting to break the structs
✔️ Use `Break MazeCell` on both `CurrentCell` and `NextCell`

---

❌ Using `Visited` or `IsWall` pins by mistake
✔️ Only use `X` and `Y`

---

❌ Forgetting to divide by `2`
✔️ You must average the two coordinates

---

❌ Using float division nodes
✔️ Use integer math here

---

❌ Forgetting the white execution wires
✔️ `Set NextCell → Set MidX → Set MidY`

---

### Expected result

After this step:

- `MidX` contains the X coordinate of the wall tile between the two cells
- `MidY` contains the Y coordinate of the wall tile between the two cells

In the next step, we will convert `(MidX, MidY)` into `BridgeIndex`.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.3.png' | relative_url }}" alt="Screenshot showing midpoint calculation and BridgeIndex setup" class="post-image">
</a>

---

## Step 9.4 — Convert Midpoint to BridgeIndex

Before we can open the bridge tile, we need to convert the midpoint coordinates (`MidX`, `MidY`) into an array index.

---

### What this step does

This step takes the midpoint position:

- `MidX`
- `MidY`

and converts it into a usable array index using the `GetIndex` function.

> This index represents the wall tile between the current tile and the next tile.

---

### Instructions

#### Step 1 — Locate MidX and MidY

1. Make sure you already created:
   - `MidX`
   - `MidY`

These should have been set in the previous step using the midpoint calculation.

---

#### Step 2 — Add the GetIndex node

2. Right-click in the graph

3. Search for:
   `GetIndex`

4. Click the function:
   `GetIndex`

---

#### Step 3 — Connect MidX and MidY

5. Drag `MidX` into the graph as **Get**

6. Connect:
   - `MidX` → `X` input on `GetIndex`

7. Drag `MidY` into the graph as **Get**

8. Connect:
   - `MidY` → `Y` input on `GetIndex`

---

#### Step 4 — Store the result

9. Drag off the return value of `GetIndex`

10. Search for:
    `Set BridgeIndex`

11. Click:
    `Set BridgeIndex`

12. Connect:
    - `GetIndex Return Value` → `BridgeIndex`

---

#### Step 5 — Connect execution flow

13. Connect the white execution wires:

- `Set MidY` → `GetIndex`
- `GetIndex` → `Set BridgeIndex`

---

### Connections recap

- `MidX` → `GetIndex.X`
- `MidY` → `GetIndex.Y`
- `GetIndex Return` → `Set BridgeIndex`

Execution:

```text
Set MidX
→ Set MidY
→ GetIndex
→ Set BridgeIndex
```

---

### Why this matters

The Grid is a **1D array**, not a 2D grid.

So even though we calculated `(MidX, MidY)`, we **cannot use that directly**.

> We must convert it into a single index before accessing the Grid.

---

### Common mistakes

❌ Trying to use `MidX` or `MidY` directly in `Get (a copy)`
✔️ Always convert to an index first

---

❌ Forgetting to store the result
✔️ You must use `Set BridgeIndex`

---

❌ Not connecting execution wires
✔️ The node must execute after MidX and MidY are set

---

### Expected result

You now have:

- `BridgeIndex` correctly set to the wall tile between the current and next tiles

This value will be used in the next step to open the bridge tile.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.4.png' | relative_url }}" alt="Screenshot showing midpoint calculation and BridgeIndex setup" class="post-image">
</a>

---

## Step 9.5 — Open the Current Tile

Now we will mark the current tile as open.

---

### What this step does

This step sets the current tile’s `IsWall` value to `false`.

> This ensures the current tile is part of the carved path.

---

### Instructions

#### Step 1 — Get the current cell again

1. In the `CarvePassage` function, locate your variable:
   `Grid`

2. Drag `Grid` into the graph as **Get**

3. Drag off the `Grid` pin and search for:
   `Get (a copy)`

4. Click:
   `Get (a copy)`

5. Locate your variable:
   `CurrentIndex`

6. Drag `CurrentIndex` into the graph as **Get**

7. Connect:
   - `CurrentIndex` → **Index** on `Get (a copy)`
     (this pin may be labeled **Index** or **Dimension 1 Integer**)

You are now retrieving the current MazeCell from the Grid.

---

#### Step 2 — Modify the struct

8. Drag off the output of `Get (a copy)`

9. Search for:
   `Set Members in MazeCell`

10. Click:
    `Set Members in MazeCell`

---

#### Step 2.1 — Expose IsWall

11. Click on the `Set Members in MazeCell` node

12. In the **Details panel**, look for the list of variables

13. Check the box for:

- `IsWall`

This will make the `IsWall` pin appear on the node.

---

#### Step 2.2 — Set the value

14. On the `IsWall` pin:

- set the value to `false` (unchecked)

---

#### Step 3 — Write it back into the Grid

15. Drag `Grid` into the graph again as **Get**

16. Drag off it and search for:
    `Set Array Elem`

17. Click:
    `Set Array Elem`

---

#### Step 3.1 — Connect the array

18. Connect:

- `Grid` → **Target Array**

---

#### Step 3.2 — Connect the index

19. Drag `CurrentIndex` into the graph again as **Get**

20. Connect:

- `CurrentIndex` → **Index**

---

#### Step 3.3 — Connect the modified struct

20. Connect:

- output of `Set Members in MazeCell` → `Set Array Elem` **Item**

---

#### Step 4 — Connect execution flow

21. Connect the white execution wires:

- Previous step (`Set BridgeIndex`) → `Set Members in MazeCell`
- `Set Members in MazeCell` → `Set Array Elem`

---

### Connections recap

- `Grid` → `Get (a copy)` using `CurrentIndex`
- Output → `Set Members in MazeCell`
- `IsWall = false`
- Output → `Set Array Elem`
- `CurrentIndex` → Index

---

### Why this matters

Even though the generator is already on this tile, we explicitly set it to open.

> This keeps the carving logic consistent and prevents edge-case errors.

---

### Common mistakes

❌ Forgetting to expose `IsWall`
✔️ You must check it in the node details

---

❌ Setting `IsWall` but not writing back to the array
✔️ Always use `Set Array Elem`

---

❌ Wiring execution incorrectly
✔️ Execution must flow through both nodes

---

### Expected result

The current tile is now marked as open (`IsWall = false`) inside the Grid.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.5.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.5.png' | relative_url }}" alt="Screenshot showing current cell opened with Set Members in MazeCell and Set Array Elem" class="post-image">
</a>

---

## Step 9.6 — Open the Bridge Tile

Now we will remove the wall between the current tile and the next tile.

---

### What this step does

This step sets the bridge tile’s `IsWall` value to `false`.

> This is what actually opens the passage between the two cells.

---

### Instructions

#### Step 1 — Get the bridge cell

1. Locate your variable:
   `Grid`

2. Drag `Grid` into the graph as **Get**

3. Drag off the `Grid` pin and search for:
   `Get (a copy)`

4. Click:
   `Get (a copy)`

5. Locate your variable:
   `BridgeIndex`

6. Drag `BridgeIndex` into the graph as **Get**

7. Connect:
   - `BridgeIndex` → **Index**
     (this pin may be labeled **Index** or **Dimension 1 Integer**)

---

#### Step 2 — Modify the struct

8. Drag off the output of `Get (a copy)`

9. Search for:
   `Set Members in MazeCell`

10. Click:
    `Set Members in MazeCell`

---

#### Step 2.1 — Expose IsWall

11. Select the node

12. In the Details panel, check:

- `IsWall`

---

#### Step 2.2 — Set the value

13. Set:

- `IsWall = false` (unchecked)

---

#### Step 3 — Write it back into the Grid

14. Drag `Grid` into the graph as **Get**

15. Drag off it and search for:
    `Set Array Elem`

16. Click:
    `Set Array Elem`

---

#### Step 3.1 — Connect the array

17. Connect:

- `Grid` → **Target Array**

---

#### Step 3.2 — Connect the index

18. Drag `BridgeIndex` into the graph as **Get**

- Connect `BridgeIndex` → **Index**

---

#### Step 3.3 — Connect the modified struct

19. Connect:

- output of `Set Members in MazeCell` → **Item**

---

#### Step 4 — Connect execution flow

20. Connect:

- previous step (`Set Array Elem` from Step 9.4) → `Set Members in MazeCell`
- `Set Members in MazeCell` → `Set Array Elem`

---

### Connections recap

- `Grid` → `Get (a copy)` using `BridgeIndex`
- Output → `Set Members in MazeCell`
- `IsWall = false`
- Output → `Set Array Elem`
- `BridgeIndex` → Index

---

### Why this matters

This is the **most important carving step**.

> Without this, the maze would move forward but never break walls.

---

### Common mistakes

❌ Using `CurrentIndex` instead of `BridgeIndex`
✔️ This step must use the bridge tile

---

❌ Forgetting to expose `IsWall`
✔️ Must be enabled in node details

---

❌ Not chaining execution correctly
✔️ This must run after opening the current tile

---

### Expected result

The wall between the current tile and the next tile is now open.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.6.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.6.png' | relative_url }}" alt="Screenshot showing bridge cell opened with Set Members in MazeCell and Set Array Elem" class="post-image">
</a>

---

## Step 9.7 — Open and Visit the Next Tile

Now we will mark the destination tile as both open and visited.

---

### What this step does

This step prepares the next tile to become part of the maze path.

> It becomes open floor and is marked as already used.

---

### Instructions

#### Step 1 — Get the next cell

1. Locate your variable:
   `Grid`

2. Drag `Grid` into the graph as **Get**

3. Drag off the `Grid` pin and search for:
   `Get (a copy)`

4. Click:
   `Get (a copy)`

---

#### Step 1.1 — Connect the index

5. Locate your variable:
   `NextIndex`

6. Drag `NextIndex` into the graph as **Get**

7. Connect:

- `NextIndex` → **Index** on `Get (a copy)`
  (this pin may be labeled **Index** or **Dimension 1 Integer**)

You are now retrieving the next MazeCell from the Grid.

---

#### Step 2 — Modify the struct

8. Drag off the output of `Get (a copy)`

9. Search for:
   `Set Members in MazeCell`

10. Click:
    `Set Members in MazeCell`

---

#### Step 2.1 — Expose the variables

11. Select the `Set Members in MazeCell` node

12. In the **Details panel**, check:

- `Visited`
- `IsWall`

---

#### Step 2.2 — Set the values

13. Set:

- `Visited = true` (checked)
- `IsWall = false` (unchecked)

---

#### Step 3 — Write it back into the Grid

14. Drag `Grid` into the graph as **Get**

15. Drag off it and search for:
    `Set Array Elem`

16. Click:
    `Set Array Elem`

---

#### Step 3.1 — Connect the array

17. Connect:

- `Grid` → **Target Array**

---

#### Step 3.2 — Connect the index

18. Drag `NextIndex` into the graph as **Get**

19. Connect:

- `NextIndex` → `Set Array Elem` **Index**

---

#### Step 3.3 — Connect the modified struct

20. Connect:

- output of `Set Members in MazeCell` → `Set Array Elem` **Item**

---

#### Step 4 — Connect execution flow

21. Connect the white execution wires:

- Previous step (`Set Array Elem` from Bridge tile) → `Set Members in MazeCell`
- `Set Members in MazeCell` → `Set Array Elem`

---

### Connections recap

- `Grid` → `Get (a copy)` using `NextIndex`
- `NextIndex` → Index
- `Set Members in MazeCell` → `Visited = true`, `IsWall = false`
- Output → `Set Array Elem`
- `NextIndex` → Index

---

### Why this matters

The next tile is now officially part of the maze.

> It is open and will no longer be treated as an unvisited neighbor later.

---

### Common mistakes

❌ Forgetting to drag `NextIndex` into the graph as **Get**
✔️ Always place variables explicitly before connecting

---

❌ Setting values but not writing back to the array
✔️ Always use `Set Array Elem`

---

❌ Breaking execution flow
✔️ This step must run after the bridge tile is opened

---

### Expected result

At the end of `CarvePassage`, the current tile, bridge tile, and next tile are all correctly opened, and the next tile is marked visited.

---

<a href="{{ '/assets/images/blog/Part2-Step-9.7.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part2-Step-9.7.png' | relative_url }}" alt="Screenshot showing next cell marked visited and opened" class="post-image">
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

1. Locate your variable:
   `Grid`

2. Drag `Grid` into the graph as **Get**

3. Drag off the `Grid` pin and search for:
   `Get (a copy)`

4. Click:
   `Get (a copy)`

---

#### Step 1.1 — Connect the index

5. Locate your variable:
   `CurrentIndex`

6. Drag `CurrentIndex` into the graph as **Get**

7. Connect:

- `CurrentIndex` → **Index** on `Get (a copy)`
  (this pin may be labeled **Index** or **Dimension 1 Integer**)

You are now retrieving the start MazeCell from the Grid.

---

#### Step 2 — Modify the tile

8. Drag off the output of `Get (a copy)`

9. Search for:
   `Set Members in MazeCell`

10. Click:
    `Set Members in MazeCell`

---

#### Step 2.1 — Expose the variables

11. Select the node

12. In the **Details panel**, check:

- `Visited`
- `IsWall`

---

#### Step 2.2 — Set the values

13. Set:

- `Visited = true` (checked)
- `IsWall = false` (unchecked)

---

#### Step 3 — Write it back

14. Drag `Grid` into the graph as **Get**

15. Drag off it and search for:
    `Set Array Elem`

16. Click:
    `Set Array Elem`

---

#### Step 3.1 — Connect the array

17. Connect:

- `Grid` → **Target Array**

---

#### Step 3.2 — Connect the index

18. Drag `CurrentIndex` into the graph as **Get**

19. Connect:

- `CurrentIndex` → `Set Array Elem` **Index**

---

#### Step 3.3 — Connect the modified struct

20. Connect:

- output of `Set Members in MazeCell` → `Set Array Elem` **Item**

---

#### Step 4 — Connect execution flow

21. Connect the white execution wires:

- Previous step (`Set CurrentIndex`) → `Set Members in MazeCell`
- `Set Members in MazeCell` → `Set Array Elem`

---

### Connections recap

- `Grid` → `Get (a copy)` using `CurrentIndex`
- `CurrentIndex` → Index
- `Set Members in MazeCell` → `Visited = true`, `IsWall = false`
- Output → `Set Array Elem`

Execution:

```text
Set CurrentIndex
→ Set Members in MazeCell
→ Set Array Elem
```

---

### Why this matters

The first tile must already belong to the maze.

> Otherwise the generator would begin on a wall tile that was never carved.

---

### Common mistakes

❌ Forgetting to drag `CurrentIndex` into the graph as **Get**
✔️ Always place variables explicitly

---

❌ Setting values but not writing back to the array
✔️ Always use `Set Array Elem`

---

❌ Forgetting execution wires
✔️ The nodes must be connected to run

---

❌ Connecting execution from the wrong place
✔️ This step should come directly after `Set CurrentIndex`

---

### Expected result

The start tile is now open and visited, and correctly stored back into the Grid.

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

#### Step 1 — Add to the Stack

1. Locate your variable:
   `Stack`

2. Drag `Stack` into the graph as **Get**

3. Drag off the `Stack` pin and search for:
   `Add`

4. Click:
   `Add`

---

#### Step 2 — Connect the item

5. Locate your variable:
   `CurrentIndex`

6. Drag `CurrentIndex` into the graph as **Get**

7. Connect:

- `CurrentIndex` → **Item**

---

#### Step 3 — Connect the array

8. Connect:

- `Stack` → **Target Array**

---

#### Step 4 — Connect execution flow (IMPORTANT)

9. Connect the white execution wires:

- Previous step (`Set Array Elem` from Step 10.4) → `Add`
- `Add` → next step (While Loop)

---

### Connections recap

- `Stack` → `Add`
- `CurrentIndex` → **Item**

Execution:

Set Array Elem (Start Tile)
→ Add (Stack)
→ While Loop

---

### Why this matters

If the start tile is not added to the stack:

- the stack will be empty
- the While Loop condition (`Length > 0`) will fail immediately
- the maze will never generate

> This single step is what actually starts the maze algorithm.

---

### Common mistakes

❌ Forgetting to drag `CurrentIndex` into the graph as **Get**
✔️ Always place variables explicitly

---

❌ Not connecting execution wires
✔️ Without execution, nothing runs

---

❌ Adding the wrong value (like `NextIndex`)
✔️ This step must use `CurrentIndex`

---

❌ Connecting the While Loop before the Add node
✔️ The stack must have at least one item before the loop starts

---

### Expected result

The stack now contains the starting tile, and the maze generation loop is ready to begin.

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

#### Step 1 — Add the WhileLoop node

1. Right-click in the graph

2. Search for:
   `WhileLoop`

3. Click:
   `WhileLoop`

---

#### Step 2 — Get the Stack length

4. Locate your variable:
   `Stack`

5. Drag `Stack` into the graph as **Get**

6. Drag off the `Stack` pin and search for:
   `Length`

7. Click:
   `Length`

---

#### Step 3 — Compare Length > 0

8. Drag off the output of the `Length` node

9. Search for:
   `>`

10. Click the **Integer > Integer** node

11. Set the second value to:
    `0`

You now have:

`Stack Length > 0`

---

#### Step 4 — Connect the Condition

12. Connect:

- result of `Length > 0` → **Condition** pin on the `WhileLoop`

---

#### Step 5 — Connect execution (IMPORTANT)

13. Connect the white execution wires:

- Previous step (`Add` from Step 10.5) → `WhileLoop`

---

### Connections recap

- `Stack` → `Length`
- `Length` → `>` (Greater Than)
- `0` → second input
- result → `WhileLoop Condition`

Execution:

```
Add (Stack)
→ WhileLoop
```

---

### Why this matters

As long as the stack still has items, the generator still has somewhere to continue or backtrack to.

> This loop is the heart of the maze generation algorithm.

---

### Common mistakes

❌ Forgetting to add the WhileLoop node
✔️ You must create it manually

---

❌ Using `>= 0`
✔️ Use `> 0`

---

❌ Not connecting execution wires
✔️ The loop will never run without execution

---

❌ Connecting Condition incorrectly
✔️ Condition must come from `Length > 0`

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
(this pin may be labeled **Index** or **Dimension 1 Integer**)

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

#### Step 1 — Call the GetValidNeighbors function

1. From the execution output of `Set CurrentIndex`, drag out a wire

2. Search for:
   `GetValidNeighbors`

3. Click:
   `GetValidNeighbors`

---

#### Step 2 — Connect the input

4. Locate your variable:
   `CurrentIndex`

5. Drag `CurrentIndex` into the graph as **Get**

6. Connect:

* `CurrentIndex` → `CurrentIndex` input on the function

---

#### Step 3 — Create the local variable

7. In the **My Blueprint** panel, under **Local Variables**:

8. Click:
   `+`

9. Name it:
   `ValidNeighbors`

10. Set the type to:

* Integer

11. Click the array icon to make it an **Array**

---

#### Step 4 — Store the result

12. Drag off the output of `GetValidNeighbors`

13. Search for:
    `Set ValidNeighbors`

14. Click:
    `Set ValidNeighbors`

15. Connect:

* output of `GetValidNeighbors` → `ValidNeighbors`

---

#### Step 5 — Connect execution flow

16. Connect the white execution wires:

* `Set CurrentIndex` → `GetValidNeighbors`
* `GetValidNeighbors` → `Set ValidNeighbors`

---

### Connections recap

* `CurrentIndex` → `GetValidNeighbors`
* output → `Set ValidNeighbors`

Execution:

```
WhileLoop (Loop Body)
→ Set CurrentIndex
→ GetValidNeighbors
→ Set ValidNeighbors
```

---

### Why this matters

This gives the generator a list of all possible next moves.

> Without this, the maze would not know where it can go next.

---

### Common mistakes

❌ Forgetting to drag `CurrentIndex` into the graph as **Get**
✔️ Always place variables explicitly

---

❌ Not creating `ValidNeighbors` as an array
✔️ It must be an Integer Array

---

❌ Not connecting execution wires
✔️ The function must execute to return results

---

❌ Trying to use the function output directly without storing it
✔️ Store it for clarity and reuse

---

### Expected result

You now have an array containing all valid next moves stored in `ValidNeighbors`.


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

#### Step 1 — Get the length of ValidNeighbors

1. Locate your variable:
   `ValidNeighbors`

2. Drag `ValidNeighbors` into the graph as **Get**

3. Drag off the `ValidNeighbors` pin and search for:
   `Length`

4. Click:
   `Length`

---

#### Step 2 — Compare Length > 0

5. Drag off the output of the `Length` node

6. Search for:
   `>`

7. Click the **Integer > Integer** node

8. Set the second value to:
   `0`

You now have:

`ValidNeighbors Length > 0`

---

#### Step 3 — Add the Branch node

9. Right-click in the graph

10. Search for:
    `Branch`

11. Click:
    `Branch`

---

#### Step 4 — Connect the condition

12. Connect:

* result of `Length > 0` → **Condition** pin on the Branch

---

#### Step 5 — Connect execution flow

13. Connect the white execution wires:

* `Set ValidNeighbors` → `Branch`

---

### Connections recap

* `ValidNeighbors` → `Length`
* `Length` → `>` (Greater Than)
* `0` → second input
* result → `Branch Condition`

Execution:

```
Set ValidNeighbors
→ Branch
```

---

### Why this matters

This is the decision point of the maze algorithm.

> If valid neighbors exist, move forward. If not, backtrack.

---

### Common mistakes

❌ Forgetting to create the `>` node
✔️ You must compare `Length > 0`

---

❌ Forgetting to add the Branch node
✔️ The logic must split here

---

❌ Not connecting execution wires
✔️ The Branch will never run without execution

---

❌ Plugging `Length` directly into the Branch
✔️ You must compare it to `0`

---

### Expected result

The loop now splits into two paths:

* **True** → move forward to a new tile
* **False** → backtrack to a previous tile


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

1. Locate your variable:
   `ValidNeighbors`

2. Drag `ValidNeighbors` into the graph as **Get**

3. Drag off the `ValidNeighbors` pin and search for:
   `Length`

4. Click:
   `Length`

5. Drag off the output of the `Length` node

6. Search for:
   `-`

7. Click the **Integer - Integer** node

8. Set the second value to:
   `1`

You now have:

`ValidNeighbors Length - 1`

This gives the maximum valid array index.

---

#### Step 2 — Create the random node

You have two options here. This tutorial will follow Option A for beginners. Afterwards, I will post a short tutorial switching from Option A to Option B.

#### Choosing a Random Method (Optional)

At this step, you have two options:

* `Random Integer in Range`
* `Random Integer in Range from Stream`

---

### What’s the difference?

#### Option A `Random Integer in Range`

* Uses Unreal’s default random system
* Produces different results every time you run the game

> Use this if you just want a random maze each time.

---

#### Option B `Random Integer in Range from Stream`

* Uses your `RandomStream` variable
* Produces the same results when using the same `MazeSeed`

> Use this if you want repeatable mazes (useful for testing or level design).

---

### Recommendation

If you are following this tutorial for the first time:

> Start with Option A `Random Integer in Range`

Once everything is working, you can switch to the stream version for more control.

---

### Option A — Simple random (Recommended for beginners)

9. Right-click in the graph

10. Search for:

* `Random Integer in Range`

11. Click `Random Integer in Range` (proceed to step 15.)

### Option B — Seeded random (Advanced)

If you want repeatable mazes, use the stream version.

9. Right-click in the graph

10. Search for:
    `Random Integer in Range from Stream`

11. Click:
    `Random Integer in Range from Stream`

12. Locate your variable:
    `RandomStream`

13. Drag `RandomStream` into the graph as **Get**

14. Connect:

* `RandomStream` → `Stream`

> If you cannot find the stream version, use the simple random version for now.

---

#### Step 3 — Set Min and Max

15. Set:

* `Min = 0`

16. Connect:

* `ValidNeighbors Length - 1` → `Max`

---

#### Step 4 — Get the selected neighbor

Now we will use the random number to pick one item from the `ValidNeighbors` array.

---

### What this step does

This step takes the random number we generated and uses it to select a specific neighbor from the array.

> The result will be one randomly chosen valid neighbor.

---

### Instructions

17. Locate your variable:
    `ValidNeighbors`

18. Drag `ValidNeighbors` into the graph as **Get**

19. Drag off the `ValidNeighbors` pin and search for:
    `Get (a copy)`

20. Click:
    `Get (a copy)`

---

#### Step 4.1 — Use the random number as the index

21. Locate the output pin on your Random Integer node
    (this is the number it generates)

22. Click and drag from that output pin

23. Connect it to the **Index** input on the `Get (a copy)` node
(this pin may be labeled **Index** or **Dimension 1 Integer**)

---

### What this means

* The Random Integer node gives you a number (for example: `2`)
* That number is used as the position inside the `ValidNeighbors` array

Example:

```
ValidNeighbors = [5, 12, 8, 3]
```

If the random number is:

```
2
```

Then the selected value will be:

```
8
```

---

### Result

The `Get (a copy)` node now returns:

> one randomly selected neighbor from the array

This value will be used in the next step as `NextIndex`.


---

#### Step 5 — Store the result

21. Drag off the output of `Get (a copy)`

22. Search for:
    `Set NextIndex`

23. Click:
    `Set NextIndex`

24. Connect:

* output → `NextIndex`

---

#### Step 6 — Connect execution flow

25. Connect the white execution wires:

* `Branch (True)` → `Set NextIndex`

---

### Connections recap

* `ValidNeighbors` → `Length`
* `Length - 1` → random `Max`
* random result → `Get (a copy)` on `ValidNeighbors`
* selected value → `Set NextIndex`

Execution:

```
Branch (True)
→ Set NextIndex
```

If using the stream version:

* `RandomStream` → `Stream`

---

### Why this matters

This is the step that gives the maze its shape.

> The chosen neighbor becomes the next tile the maze will move into.

Because the choice is random, the same system can generate many different mazes.

---

### Common mistakes

❌ Trying to drag from the Branch pin to find the random node
✔️ Right-click in the graph and search for it instead

---

❌ Using `Length` directly as `Max`
✔️ Use `Length - 1`

---

❌ Forgetting to connect `RandomStream` when using the stream version
✔️ Drag `RandomStream` into the graph as **Get** and connect it

---

❌ Forgetting to store the result
✔️ Always set `NextIndex`

---

❌ Running this from the Branch False pin
✔️ This only runs when neighbors exist

---

### Expected result

`NextIndex` now stores the randomly selected next tile.

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

* current tile
* bridge tile
* next tile

> This is the moment the maze actually expands.

---

### Instructions

#### Step 1 — Add the CarvePassage function call

1. From the white execution output of `Set NextIndex`, drag out a wire

2. Search for:
   `CarvePassage`

3. Click:
   `CarvePassage`

---

#### Step 2 — Connect CurrentIndex

4. Locate your variable:
   `CurrentIndex`

5. Drag `CurrentIndex` into the graph as **Get**

6. Connect:

* `CurrentIndex` → `CurrentIndex` input on `CarvePassage`

---

#### Step 3 — Connect NextIndex

7. Locate your variable:
   `NextIndex`

8. Drag `NextIndex` into the graph as **Get**

9. Connect:

* `NextIndex` → `NextIndex` input on `CarvePassage`

---

#### Step 4 — Connect execution flow

10. Connect the white execution wire:

* `Set NextIndex` → `CarvePassage`

---

### Connections recap

* `Set NextIndex` → `CarvePassage`
* `CurrentIndex` → `CurrentIndex`
* `NextIndex` → `NextIndex`

Execution:

```
Set NextIndex
→ CarvePassage
```

---

### Why this matters

Without this step, the generator would successfully choose a next tile, but the maze would never actually open the path to reach it.

> This is what turns the grid data into an actual maze structure.

---

### Common mistakes

❌ Forgetting to drag `CurrentIndex` into the graph as **Get**
✔️ Always place variables explicitly before connecting them

---

❌ Forgetting to drag `NextIndex` into the graph as **Get**
✔️ Both inputs must be connected

---

❌ Connecting execution from the wrong node
✔️ `CarvePassage` should run after `Set NextIndex`

---

❌ Skipping this step entirely
✔️ Choosing a neighbor is not enough — you must carve the path

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

#### Step 1 — Add to the Stack

1. Locate your variable:
   `Stack`

2. Drag `Stack` into the graph as **Get**

3. Drag off the `Stack` pin and search for:
   `Add`

4. Click:
   `Add`

---

#### Step 2 — Connect the item

5. Locate your variable:
   `NextIndex`

6. Drag `NextIndex` into the graph as **Get**

7. Connect:

* `NextIndex` → **New Item** (ADD Node)

---

#### Step 3 — Connect the array

8. Connect:

* `Stack` → **Target Array**

---

#### Step 4 — Connect execution flow

9. Connect the white execution wires:

* `CarvePassage` → `Add`
* `Add` → next step in the loop (continue execution)

---

### Connections recap

* `Stack` → `Add`
* `NextIndex` → **Item**

Execution:

```
CarvePassage
→ Add (Stack)
→ (continues loop)
```

---

### Why this matters

This continues the path forward.

> The stack always grows when the maze successfully moves into a new tile.

Without this step, the algorithm would move forward once and then lose its path history.

---

### Common mistakes

❌ Forgetting to drag `NextIndex` into the graph as **Get**
✔️ Always place variables explicitly before connecting

---

❌ Adding the wrong value
✔️ This step must use `NextIndex`

---

❌ Forgetting execution wires
✔️ The Add node must execute to update the stack

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

#### Step 1 — Get the last index of the stack

1. Locate your variable:
   `Stack`

2. Drag `Stack` into the graph as **Get**

3. Drag off the `Stack` pin and search for:
   `Last Index`

4. Click:
   `Last Index`

This gives you the index of the last item in the stack.

---

#### Step 2 — Create the Remove Index node

5. Drag `Stack` into the graph again as **Get**

6. Drag off the `Stack` pin and search for:
   `Remove Index`

7. Click:
   `Remove Index`

---

#### Step 3 — Connect the array

8. Connect:

* `Stack` → **Target Array**

---

#### Step 4 — Connect the index

9. Connect:

* output of `Last Index` → **Index to Remove Integer**

---

#### Step 5 — Connect execution flow

10. From the **False** pin of the Branch (from Step 10.9), drag a white execution wire

11. Connect it to:

* `Remove Index`

---

### Connections recap

* `Stack` → `Last Index`
* `Last Index` → `Remove Index Index`
* `Stack` → `Remove Index Target Array`

Execution:

```
Branch (False)
→ Remove Index (Stack)
```

---

### Why this matters

This is the backtracking part of the algorithm.

> When the maze hits a dead end, it goes backward until it finds another tile with unused neighbors.

Without this step, the maze would get stuck the first time it hits a dead end.

---

### Common mistakes

❌ Forgetting to connect the Branch False execution wire
✔️ This step only runs when there are no neighbors

---

❌ Removing the wrong index
✔️ Always use `Last Index`

---

❌ Clearing the entire stack
✔️ Only remove one item at a time

---

❌ Not connecting the Stack to `Remove Index`
✔️ The node needs the array to modify

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

### Where this happens

This setup is done in the **Event Graph** of your Blueprint.

---

### Instructions

#### Step 1 — Choose a starting point

#### Using BeginPlay vs a Custom Event (Optional)

You have two ways to start your maze generation:

---

### `Event BeginPlay` (Recommended for beginners)

* Runs automatically when the game starts
* No setup required

> Use this if you just want the maze to generate immediately when the level loads.

---

### Custom Event (Optional)

* Lets you trigger maze generation manually
* Can be called from:

  * a button press
  * UI (menus)
  * another Blueprint

> Use this if you want to regenerate the maze during gameplay or control *when* it runs.

---

### Recommendation

If you are following this tutorial for the first time:

> Use `Event BeginPlay`

You can switch to a custom event later once everything is working.


1. Open the **Event Graph**

2. Locate:

* `Event BeginPlay`
  *(or create a custom event if you prefer)*

---

#### Step 2 — Add InitializeGrid

3. Drag a white execution wire from `Event BeginPlay`

4. Search for:
   `InitializeGrid`

5. Click:
   `InitializeGrid`

---

#### Step 3 — Add GenerateMaze

6. Drag a white execution wire from `InitializeGrid`

7. Search for:
   `GenerateMaze`

8. Click:
   `GenerateMaze`

---

#### Note — Visuals come next

At this point, the maze is fully generated in memory.

> You just can’t see it yet.

In the next part of this tutorial, we will:

* read the Grid
* and build the visible maze using meshes

---


---

### Final execution flow

```
Event BeginPlay
→ InitializeGrid
→ GenerateMaze
```

---

### Connections recap

* `Event BeginPlay` → `InitializeGrid`
* `InitializeGrid` → `GenerateMaze`

---

### Why this matters

The maze cannot be generated before the grid exists.

> The order matters.

If the order is wrong:

* the maze may be empty
* generation may fail silently
* meshes may not appear

---

### Common mistakes

❌ Calling `GenerateMaze` before `InitializeGrid`
✔️ Always initialize the grid first

---

❌ Building meshes before generating the maze
✔️ Generate first, then build visuals

---

❌ Not placing this in the Event Graph
✔️ Functions do not run unless called

---

❌ Forgetting a starting node (like BeginPlay)
✔️ Execution must start somewhere

---

### Expected result

When the game starts:

* the grid is created
* the maze is generated
* the mesh is built (if included)

The full maze now appears correctly in your level.


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




## Step 10.10 — Pick a Random Neighbor

If neighbors exist, we now choose one at random.

---

### What this step does

This step selects one valid neighbor from the `ValidNeighbors` array.

> This becomes the next tile the maze will carve into.

---

### Instructions

#### Step 1 — Build the random range

1. Locate your variable:
   `ValidNeighbors`

2. Drag `ValidNeighbors` into the graph as **Get**

3. Drag off the `ValidNeighbors` pin and search for:
   `Length`

4. Click:
   `Length`

5. Drag off the output of the `Length` node

6. Search for:
   `-`

7. Click the **Integer - Integer** node

8. Set the second value to:
   `1`

You now have:

`ValidNeighbors Length - 1`

This gives the maximum valid array index.

---

#### Step 2 — Create the random node

You have two options here.

---

### Option A — Simple random (Recommended for beginners)

9. Right-click in the graph

10. Search for:
    `Random Integer in Range`

11. Click:
    `Random Integer in Range`

---

### Option B — Seeded random (Advanced)

If you want repeatable mazes, use the stream version.

9. Right-click in the graph

10. Search for:
    `Random Integer in Range from Stream`

11. Click:
    `Random Integer in Range from Stream`

12. Locate your variable:
    `RandomStream`

13. Drag `RandomStream` into the graph as **Get**

14. Connect:

* `RandomStream` → `Stream`

> If you cannot find the stream version, use the simple random version for now.

---

#### Step 3 — Set Min and Max

15. Set:

* `Min = 0`

16. Connect:

* `ValidNeighbors Length - 1` → `Max`

---

#### Step 4 — Get the selected neighbor

17. Drag `ValidNeighbors` into the graph as **Get**

18. Drag off the `ValidNeighbors` pin and search for:
    `Get (a copy)`

19. Click:
    `Get (a copy)`

20. Connect:

* random result → **Index**

This retrieves one item from the `ValidNeighbors` array.

---

#### Step 5 — Store the result

21. Drag off the output of `Get (a copy)`

22. Search for:
    `Set NextIndex`

23. Click:
    `Set NextIndex`

24. Connect:

* output → `NextIndex`

---

#### Step 6 — Connect execution flow

25. Connect the white execution wires:

* `Branch (True)` → Random Integer node
* Random Integer node → `Set NextIndex`

---

### Connections recap

* `ValidNeighbors` → `Length`
* `Length - 1` → random `Max`
* random result → `Get (a copy)` on `ValidNeighbors`
* selected value → `Set NextIndex`

Execution:

```
Branch (True)
→ Random Integer in Range
→ Set NextIndex
```

If using the stream version:

* `RandomStream` → `Stream`

---

### Why this matters

This is the step that gives the maze its shape.

> The chosen neighbor becomes the next tile the maze will move into.

Because the choice is random, the same system can generate many different mazes.

---

### Common mistakes

❌ Trying to drag from the Branch pin to find the random node
✔️ Right-click in the graph and search for it instead

---

❌ Using `Length` directly as `Max`
✔️ Use `Length - 1`

---

❌ Forgetting to connect `RandomStream` when using the stream version
✔️ Drag `RandomStream` into the graph as **Get** and connect it

---

❌ Forgetting to store the result
✔️ Always set `NextIndex`

---

❌ Running this from the Branch False pin
✔️ This only runs when neighbors exist

---

### Expected result

`NextIndex` now stores the randomly selected next tile.
