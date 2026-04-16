---
layout: post
title: "UE5 Maze Tutorial using Blueprints."
date: 2025-08-02
author: Roberta
categories: [Tutorials]
featured: true
excerpt: >
  I found an Unreal Engine maze generation tutorial that would work fantastic for DungeonQuest. It was very hard for me as a beginner, and it was most likely designed for people with a deeper knowledge of UE. It's called Random Maze Generator and you can find it at this <a href="https://voxagon.blogspot.com/2015/02/ue4-tutorial-random-maze-generator.html" target="_blank" rel="noopener noreferrer">site</a>. It's taken me hours just to get to the end of page 5. And it's 14 pages long. Wow. I've decided to put together a beginners tutorial so someone new can follow along and get through this.

  Update: This tutorial was made in version 4.6. It's taken me so long to get to this, UE is now on version 5+, so this is gettiung a good update.  When done, I will remove this last line so you'll know it's finished..
---

# Building a Procedural Maze Generator in UE5 Blueprints — Part 1

## Creating the Grid and Valid Neighbor System

If you have ever tried following an older Unreal maze tutorial, you probably noticed the same thing I did: the core idea is solid, but the Blueprint setup can get messy fast. Extra arrays, overcomplicated macros, and excessive wiring often make the logic harder to understand than it needs to be.

In this guide, we rebuild the system cleanly from scratch using Unreal Engine 5 Blueprints.

In Part 1, we will focus on the foundation:

- building a grid of maze cells
- creating a helper function to convert X/Y into an array index
- creating a function that finds valid neighboring cells

> This is the part that makes the maze “think.”

---

## What We Are Building

The maze is built on a grid of cells. Each cell stores:

- its X position
- its Y position
- whether it has been visited
- whether it is currently a wall

Later, the generator will carve paths by moving through this grid two cells at a time, creating a proper maze structure.

---

## Before You Start

Create a new **Actor Blueprint** called:

`BP_MazeGenerator`

Then create a **Blueprint Structure** called:

`MazeCell`

Inside `MazeCell`, add the following variables:

- `X` — Integer
- `Y` — Integer
- `Visited` — Boolean
- `IsWall` — Boolean

<a href="{{ '/assets/images/blog/Start.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Start.png' | relative_url }}" alt="MazeCell structure screenshot" class="post-image">
</a>

---

## Step 1 — Add the Main Variables

Before building the maze, we need to define the core variables that control the grid and store its data.

---

### What this step does

This step creates the variables used to:

- define the size of the grid
- control spacing
- store all maze cells

> These variables are the foundation of the entire maze system.

---

### Instructions

#### Open your Blueprint

1. Open `BP_MazeGenerator`.

---

#### Add Grid Settings variables

2. In the **My Blueprint** panel, add the following variables:

- `GridWidth` — Integer
- `GridHeight` — Integer
- `TileSize` — Float

3. For each of these variables:

- Enable **Instance Editable** in the Details panel

This allows you to modify them directly in the editor.

---

#### Add Grid Data variable

4. Add another variable:

- `Grid` — MazeCell Array

5. Set the variable type to:

- `MazeCell`
- Then enable the **Array** option (click the grid icon)

---

### Connections recap

- `GridWidth` → Integer (Instance Editable)
- `GridHeight` → Integer (Instance Editable)
- `TileSize` → Float (Instance Editable)
- `Grid` → MazeCell **Array**

---

### Why this matters

These variables define how your maze is built and stored.

- `GridWidth` / `GridHeight` → control the size of the maze
- `TileSize` → controls spacing in the world
- `Grid` → stores every cell in the maze

> Without these, there is no structure to build or reference the maze.

---

### Common mistakes

❌ Forgetting to enable **Instance Editable**  
✔️ This makes testing and tweaking much easier

---

❌ Creating `Grid` as a single struct  
✔️ It must be an **array** of `MazeCell`

---

❌ Using the wrong variable types  
✔️ Make sure:

- Width/Height = Integer
- TileSize = Float

---

### Expected result

You now have all core variables set up:

- Grid dimensions and spacing are configurable
- The `Grid` array is ready to store maze cells

These variables will be used in the next steps to build and populate the grid.

---

<a href="{{ '/assets/images/blog/Step 1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 1.png' | relative_url }}" alt="BP_MazeGenerator variables panel screenshot showing GridWidth, GridHeight, TileSize, and Grid as MazeCell Array" class="post-image">
</a>

---

## Step 2 — Create the `InitializeGrid` Function

Now we will create the function that builds the entire grid for the maze.

---

### What this function does

This function creates every `MazeCell` in the grid and stores them in the `Grid` array.

> It is responsible for generating the full grid structure before the maze is carved.

---

### Create the function

1. In your Blueprint, open the **Functions** section.
2. Click the **+ Function** button.
3. Name the function:
   `InitializeGrid`

---

### Inputs

This function does **not** require any inputs.

---

### Outputs

This function does **not** return a value.

It directly modifies the `Grid` array.

---

### What will happen inside this function

In the following steps, we will:

- Clear the `Grid` array
- Loop through every row and column
- Create a `MazeCell` for each position
- Add each cell to the `Grid`

---

### Why this matters

The maze cannot exist without a grid.

This function ensures:

> Every cell is created and stored before any maze logic runs.

If this step is incorrect, nothing else in the system will work properly.

---

### Common mistakes

❌ Adding inputs that are not needed  
✔️ This function builds the grid using existing variables

---

❌ Expecting a return value  
✔️ The function updates the `Grid` directly

---

❌ Misspelling the function name  
✔️ Keep it exactly: `InitializeGrid`

---

### Expected result

You now have a function that:

- Will generate the full grid
- Prepares the data needed for maze generation

In the next steps, we will build the logic inside this function.

---

<a href="{{ '/assets/images/blog/Step 2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 2.png' | relative_url }}" alt="BP_MazeGenerator variables panel screenshot showing GridWidth, GridHeight, TileSize, and Grid as MazeCell Array" class="post-image">
</a>

---

## Step 2.1 — Clear the Grid

Before we build the grid, we need to make sure it starts empty.

---

### What this step does

This step clears out the `Grid` array before adding new cells.

> It ensures no leftover data remains from previous runs.

---

### Instructions

1. Open the `InitializeGrid` function.

2. Drag the `Grid` variable into the graph as **Get**.

3. Drag off `Grid` and search for:
   `Clear`

4. Connect the execution wire so this runs at the start of the function.

---

### Connections recap

- Execution flow → `Clear`
- `Grid` → **Target Array**

---

### Why this matters

If you don’t clear the array first:

- Old cells will remain in the `Grid`
- New cells will be added on top of them
- Your grid size will grow incorrectly

This step ensures:

> The grid is rebuilt cleanly every time the function runs.

---

### Common mistakes

❌ Skipping this step  
✔️ Always clear the grid before rebuilding it

---

❌ Using `Set Grid` instead of `Clear`  
✔️ Use the `Clear` node to empty the array

---

❌ Not connecting the execution wire  
✔️ The Clear node must actually run at the start

---

### Expected result

When `InitializeGrid` runs:

- The `Grid` array is emptied
- The system is ready to rebuild the grid from scratch

---

<a href="{{ '/assets/images/blog/Step 2.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 2.1.png' | relative_url }}" alt="Screenshot showing InitializeGrid  Grid  Clear node at start of function" class="post-image">
</a>

---

## Step 2.2 — Add Nested For Loops

To build the full maze grid, we need to visit every row and every column.

In Blueprint, we do that with **nested ForLoop nodes**:

- one loop for **Y** (rows)
- one loop for **X** (columns)

The outer loop picks the current row.  
The inner loop runs through every column in that row.

---

### What this step does

This step creates the loop structure that will visit every position in the grid.

> For each row (`Y`), we loop through every column (`X`).

This gives us a full 2D grid layout.

---

### Instructions

#### Add the outer loop for rows (Y)

1. Make sure you are still inside the `InitializeGrid` function.

2. After the `Clear` node from Step 2.1, drag off the white execution pin and add a:
   `ForLoop`

3. This first `ForLoop` will represent the **rows** of the grid, which means it will control the **Y** value.

4. Set the **First Index** of this outer loop to:
   `0`

5. To set the **Last Index**:
   - drag `GridHeight` into the graph as **Get**
   - drag off `GridHeight` and add an integer subtraction node:
     `-`
   - set the second input to:
     `1`
   - connect the result into the **Last Index** pin of the outer `ForLoop`

This creates:

`GridHeight - 1`

That means the loop will run through every row, starting at row `0` and ending at the last valid row.

---

#### Add the inner loop for columns (X)

6. From the **Loop Body** pin of the outer `ForLoop`, drag out and add another:
   `ForLoop`

7. This second `ForLoop` will represent the **columns** of the grid, which means it will control the **X** value.

8. Set the **First Index** of this inner loop to:
   `0`

9. To set the **Last Index**:
   - drag `GridWidth` into the graph as **Get**
   - drag off `GridWidth` and add an integer subtraction node:
     `-`
   - set the second input to:
     `1`
   - connect the result into the **Last Index** pin of the inner `ForLoop`

This creates:

`GridWidth - 1`

That means the loop will run through every column in the current row, starting at column `0` and ending at the last valid column.

---

### What the loops mean

These two loops work together like this:

- the **outer loop** selects the current row (`Y`)
- the **inner loop** runs across that row, one column at a time (`X`)

So the flow looks like this:

- row 0, column 0
- row 0, column 1
- row 0, column 2
- continue until the end of the row
- then move to row 1
- repeat for all columns
- continue until every row has been processed

---

### Why we subtract 1

In Unreal Engine arrays and loop indices, counting starts at `0`.

That means if your grid height is `21`, the valid row numbers are:

- `0`
- `1`
- `2`
- ...
- `20`

So the last valid index is not `21`.  
It is `20`.

That is why we use:

- `GridHeight - 1`
- `GridWidth - 1`

---

### Connections recap

- `Clear` → outer `ForLoop`
- Outer `ForLoop First Index` = `0`
- `GridHeight - 1` → outer `ForLoop Last Index`

- Outer `Loop Body` → inner `ForLoop`
- Inner `ForLoop First Index` = `0`
- `GridWidth - 1` → inner `ForLoop Last Index`

---

### Why this matters

This is the structure that allows us to create the full maze grid.

> Without these nested loops, we would only create one row or one column instead of the entire grid.

This step ensures that every position in the maze gets processed.

---

### Common mistakes

❌ Setting `Last Index` directly to `GridHeight` or `GridWidth`  
✔️ Always subtract `1`

---

❌ Reversing the loops  
✔️ Outer loop = Y (rows), Inner loop = X (columns)

---

❌ Connecting the inner loop to the wrong pin  
✔️ The inner loop must come from the **Loop Body** pin of the outer loop

---

❌ Forgetting that both loops need a First Index of `0`  
✔️ Both loops start at `0`

---

### Expected result

You now have a nested loop structure that:

- goes through every row
- goes through every column in each row
- covers the full grid
- prepares each position for creating a `MazeCell`

In the next step, we will use these loop indices to build each cell.

---

<a href="{{ '/assets/images/blog/Step 2.2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 2.2.png' | relative_url }}" alt="Screenshot showing Nested ForLoop setup inside InitializeGrid" class="post-image">
</a>

---

## Step 2.3 — Create a MazeCell

Now we will create a new `MazeCell` for each position in the grid.

---

### What this step does

This step builds a `MazeCell` struct using the current loop indices.

> Each cell starts as an unvisited wall and will be carved later during maze generation.

---

### Instructions

1. Make sure you are inside the **inner loop** (where each grid position is processed).

2. Right-click in the graph and search for:
   `Make MazeCell`

3. Set the values as follows:
   - `X` → **Inner Loop Index**
   - `Y` → **Outer Loop Index**
   - `Visited` → `false`
   - `IsWall` → `true`

---

### Connections recap

- Inner Loop Index → `X`
- Outer Loop Index → `Y`
- `Visited` = `false`
- `IsWall` = `true`

---

### Why this matters

Every cell in your maze starts in the same initial state.

This setup ensures:

> The entire grid begins as solid walls that have not been visited.

The maze generation algorithm will later carve paths by:

- marking cells as visited
- turning walls into open paths

---

### Common mistakes

❌ Mixing up X and Y  
✔️ Inner loop = X, Outer loop = Y

---

❌ Setting `Visited` to true  
✔️ All cells must start as **unvisited**

---

❌ Setting `IsWall` to false  
✔️ All cells must start as **walls**

---

❌ Creating the node outside the loop  
✔️ This must run once per grid cell

---

### Expected result

For each iteration of the inner loop:

- A new `MazeCell` is created
- It stores its position (`X`, `Y`)
- It is marked as:
  - `Visited = false`
  - `IsWall = true`

This cell will be added to the `Grid` array in the next step.

---

<a href="{{ '/assets/images/blog/Step 2.3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 2.3.png' | relative_url }}" alt="Screenshot showing Make MazeCell with X, Y, Visited false, IsWall true" class="post-image">
</a>

---

## Step 2.4 — Add the Cell to the Grid Array

Now that we’ve created a `MazeCell`, we need to store it in the `Grid` array.

This step is what actually builds the grid data.

---

### What this step does

This step takes the `MazeCell` created in the inner loop and adds it to the `Grid` array.

> Each time the inner loop runs, one new cell is added to the grid.

---

### Where this goes

This must happen **inside the inner loop**, using the same execution flow that runs for each cell.

Your flow should now look like this:

    InitializeGrid
      → Clear
      → Outer ForLoop (Y)
          → Inner ForLoop (X)
              → Add (Grid)
                     ↑
                Make MazeCell

The `Add` node is part of the white execution flow.  
The `Make MazeCell` node provides the data that gets added.

---

### Instructions

1. Make sure you are still working inside the **inner ForLoop**.

2. Locate the **Loop Body** execution pin on the inner `ForLoop`.

3. From the **MazeCell pin** of `Make MazeCell`, do the following:
   - Click and drag from the blue pin on `Make MazeCell`
   - Release in empty space in the graph
   - In the search box that appears, type:
     `Add`
   - Look for the node labeled:
     **Add (Array)**
   - Click it to place the node

   This creates an **Add node** that will let us insert the new cell into the `Grid` array.

4. Drag the `Grid` variable into the graph as **Get**.

5. Connect:
   - `Grid` → **Target Array**

6. Make sure the white execution wire goes:
   - inner `ForLoop Loop Body` → `Add`

---

### Connections recap

- inner `ForLoop Loop Body` → `Add` (Exec)
- `Grid` → **Target Array**
- `Make MazeCell` → **Item**

---

### What is happening here

Each time the inner loop runs:

- the loop reaches one grid position
- `Make MazeCell` builds the cell data for that position
- `Add` stores that new cell in the `Grid` array

So the array builds like this:

- first loop → add cell (0,0)
- next loop → add cell (1,0)
- next loop → add cell (2,0)
- continue until the entire grid is filled

---

### Why this matters

Creating the cell is not enough—you must store it.

> The `Grid` array is what the rest of the maze system uses to read and modify cells.

Without this step:

- the grid stays empty
- later steps like neighbor checks will fail

---

### Common mistakes

❌ Trying to connect execution from `Make MazeCell`  
✔️ `Make MazeCell` is a pure node and has no exec pins

❌ Connecting the wrong white wire  
✔️ The exec wire should come from the inner `ForLoop Loop Body`

❌ Using `Set Grid` instead of `Add`  
✔️ Use `Add` to append items to the array

❌ Forgetting to connect `Make MazeCell` to **Item**  
✔️ That is the cell data being stored

❌ Placing the `Add` node outside the inner loop  
✔️ It must run once per cell

---

### Expected result

As the loops run:

- each `MazeCell` is created
- each cell is added to the `Grid` array
- the array grows one element at a time

By the end of both loops:

> `Grid` contains every cell in the maze, in order

---

<a href="{{ '/assets/images/blog/Step 2.4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 2.4.png' | relative_url }}" alt="Screenshot showing Make MazeCell → Add (Grid) setup inside loop" class="post-image">
</a>

---

## Step 3 — Create the `GetIndex` Function

Because the maze is stored in a one-dimensional array, we need a way to convert grid coordinates into a usable array index.

---

### What this function does

This function converts 2D grid coordinates into a single index value.

> It allows us to locate the correct cell inside the `Grid` array.

---

### Create the function

1. In your Blueprint, open the **Functions** section.
2. Click the **+ Function** button.
3. Name the function:
   `GetIndex`

---

### Inputs

Add the following inputs:

- `X` — Integer
- `Y` — Integer

These represent the position in the grid.

---

### Output

Add the following output:

- `Index` — Integer

This will be the calculated position in the array.

---

### Why this matters

Your grid is stored as a **1D array**, but your maze logic works in **2D space**.

This function bridges that gap:

> It converts (X, Y) coordinates into a single index value used to access the grid.

---

### Important concept

Every time you need to access a cell in the grid:

- You will call `GetIndex`
- Pass in `X` and `Y`
- Use the returned `Index` to access the array

---

### Common mistakes

❌ Forgetting to add the output  
✔️ Make sure `Index` is created as an output

---

❌ Using floats instead of integers  
✔️ All values here should be **Integers**

---

❌ Misspelling the function name  
✔️ Keep it exactly: `GetIndex`

---

### Expected result

You now have a function that:

- Takes in `X` and `Y`
- Returns an `Index`

In the next step, we will build the formula that performs this conversion.

---

<a href="{{ '/assets/images/blog/Step 3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 3.png' | relative_url }}" alt="Screenshot showing the GetIndex function with inputs and output configured" class="post-image">
</a>

---

## Step 3.1 — Build the Formula

To access cells in our grid, we need to convert (X, Y) coordinates into a single array index.

---

### What this step does

This step builds the formula that converts 2D grid coordinates into a 1D array index.

> This allows us to correctly access cells stored in the `Grid` array.

---

### The formula

Index = X + (Y \* GridWidth)

---

### Where X and Y come from

The `X` and `Y` values are the **inputs** of the `GetIndex` function.

In Unreal Engine 5, function inputs do **not** appear in the My Blueprint panel.

Instead:

> They are available as pins on the **Function Entry node**

When you open `GetIndex`, you should see:

    GetIndex (Entry)
        X
        Y

These pins are what you will use in this step.

---

### Instructions

1. Locate the **Function Entry node** for `GetIndex`.

2. From the `Y` input pin on the Entry node:
   - click and drag a wire into empty space in the graph
   - release the wire and search for:
     `*`
   - choose the integer **multiply** node

3. Drag `GridWidth` into the graph as **Get**.

4. Connect:
   - `Y` → first input of the multiply node
   - `GridWidth` → second input of the multiply node

5. From the `X` input pin on the Entry node:

- click and drag a wire into the graph
- search for:
  `+`
- select the integer **Add** node

6. From the output of the multiply node:
   - connect it to the second input of the Add node

7. Connect:
   - result of `(Y * GridWidth)` → first input of the Add node
   - `X` → second input of the Add node

8. Connect the output of the add node to the **Return Node**.

---

### Connections recap

- `Y * GridWidth`
- Result + `X`
- Final result → **Return Node**

---

### Why this matters

Your grid is stored as a **1D array**, but you think in **2D coordinates**.

This formula converts:

> (X, Y) → Array Index

Without this conversion, you would not be able to correctly locate cells in the grid.

---

### Example

If `GridWidth = 21`:

- `(0, 0)` → `0 + (0 * 21)` = `0`
- `(1, 0)` → `1 + (0 * 21)` = `1`
- `(0, 1)` → `0 + (1 * 21)` = `21`
- `(1, 1)` → `1 + (1 * 21)` = `22`

---

### Common mistakes

❌ Looking for X and Y in the variable list  
✔️ They are on the **Function Entry node**

---

❌ Forgetting parentheses (order of operations)  
✔️ Always calculate `(Y * GridWidth)` first

---

❌ Swapping X and Y  
✔️ Formula is: `X + (Y * GridWidth)`

---

❌ Not connecting to the Return Node  
✔️ The final value must go into the function output

---

### Expected result

You now have a working formula that:

- Converts grid coordinates into an array index
- Allows accurate lookup of any cell in the grid

This will be used throughout the maze system whenever we need to access a specific tile.

---

<a href="{{ '/assets/images/blog/Step 3.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 3.1.png' | relative_url }}" alt="Screenshot showing multiply → add → return node setup" class="post-image">
</a>

---

## Step 4 — Create `GetValidNeighbors`

This is the core function for this part of the maze system.

It is responsible for finding all valid neighboring cells from a given position.

---

### What this function does

This function takes a single cell index and:

- checks all four directions (Left, Right, Up, Down)
- filters out invalid or visited cells
- returns a list of valid neighbors

> Only unvisited, in-bounds cells will be included in the result.

---

### Create the function

1. In your Blueprint, open the **Functions** section.
2. Click the **+ Function** button.
3. Name the function:
   `GetValidNeighbors`

---

### Inputs

Add the following input:

- `CurrentIndex` — Integer

This represents the current position in the grid.

---

### Outputs

Add the following output:

- `Neighbors` — Integer Array

This will store all valid neighboring cell indices.

---

### Why this matters

This function drives the maze generation logic.

> It determines where the algorithm can move next.

If this function is incorrect, the maze will not generate properly.

---

### Important concept

This function works with **indices**, not coordinates.

- The grid is stored as a **1D array**
- Each cell is accessed using an index
- We convert between (X, Y) and Index as needed

---

### Common mistakes

❌ Forgetting to add the output array  
✔️ You must create `Neighbors` as an **Integer Array**

---

❌ Using coordinates instead of indices  
✔️ This function should return **indices**, not X/Y values

---

❌ Misspelling the function name  
✔️ Keep it exactly: `GetValidNeighbors`

---

### Expected result

You now have a function that:

- Accepts a `CurrentIndex`
- Will return an array of valid neighbor indices

In the next steps, we will build the logic inside this function step-by-step.

---

<a href="{{ '/assets/images/blog/Step 4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 4.png' | relative_url }}" alt="Screenshot showing the GetValidNeighbors function with input and output configured" class="post-image">
</a>

---

## Step 4.1 — Add Local Variables

Before we begin building the logic, we need to create a set of local variables that will be used throughout this function.

---

### What this step does

This step defines temporary variables that exist only within this function.

> These variables store positions, test values, and neighbor results during execution.

---

### Instructions

1. Open your GetValidNeighbors function.

2. In the **My Blueprint** panel, locate the **Local Variables** section.

3. Add the following variables:
   - `CurrentX` — Integer
   - `CurrentY` — Integer
   - `TestX` — Integer
   - `TestY` — Integer
   - `TestIndex` — Integer
   - `LocalNeighbors` — Integer Array

4. For `LocalNeighbors`:
   - Set the variable type to **Integer**
   - Click the array icon to make it an **Array**

---

### Important note

⚠️ These must be **Local Variables**, not regular Blueprint variables.

- Local Variables exist **only inside this function**
- They are reset each time the function runs
- They keep your Blueprint clean and organized

---

### Why this matters

Using local variables ensures:

> Your function remains self-contained and does not interfere with other parts of your Blueprint.

It also prevents bugs caused by leftover values from previous runs.

---

### Common mistakes

❌ Creating regular Blueprint variables instead of Local Variables  
✔️ Always use the **Local Variables** section inside the function

---

❌ Forgetting to make `LocalNeighbors` an array  
✔️ It must be an **Integer Array**, not a single Integer

---

❌ Misspelling variable names  
✔️ Keep names consistent (`TestIndex`, not `Testindex`, etc.)

---

### Expected result

You now have all required variables ready:

- Position tracking (`CurrentX`, `CurrentY`)
- Test coordinates (`TestX`, `TestY`)
- Index tracking (`TestIndex`)
- Neighbor storage (`LocalNeighbors`)

These will be used in the following steps to build your neighbor-checking logic.

---

<a href="{{ '/assets/images/blog/Step 4.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 4.1.png' | relative_url }}" alt="Screenshot showing Local variables inside GetValidNeighbors" class="post-image">
</a>

---

## Step 4.2 — Read the Current Cell

Now we need to retrieve the current cell from the grid so we can work with its position.

---

### What this step does

This step pulls the `MazeCell` at `CurrentIndex` from the `Grid` array and extracts its `X` and `Y` values.

> These values will be used to calculate neighboring positions in the next steps.

---

### Instructions

1. Break the wire going to `Return Node` and put it off to the side.

2. Drag the `Grid` variable into the graph as **Get**.

3. Drag off `Grid` and search for:
   `Get (a copy)`

4. On the `Get (a copy)` node, locate the input pin used to select the array position.

   In Unreal, this pin may be labeled:
   - **Index**, or
   - **Dimension 1 Integer** (depending on the version)
   - Connect `CurrentIndex` → this input pin

   This retrieves the MazeCell at the current position.

5. Drag off the output of `Get (a copy)` and add:
   `Break MazeCell`

6. From the `Break MazeCell` node:
   - From the `X` output pin:
     - click and drag a wire into empty space
     - search for:
       `Set CurrentX`
     - select the node

   - From the `Y` output pin:
     - click and drag a wire into empty space
     - search for:
       `Set CurrentY`
     - select the node

7. Connect the execution flow:
   - Connect the incoming execution wire to `Set CurrentX`
   - Connect `Set CurrentX` → `Set CurrentY`
   - Leave `Return Node` off to the side as we are still building the function

---

### Connections recap

- `Grid` → `Get (a copy)`
- `CurrentIndex` → **Index**
- Output → `Break MazeCell`
- `X` → `Set CurrentX`
- `Y` → `Set CurrentY`

---

### Why this matters

Your grid stores cells as a structured type (`MazeCell`), not just raw values.

This step allows you to:

> Extract the position data (X and Y) from the current cell so you can calculate neighbors.

Without this, you wouldn’t know where you are in the grid.

---

### Common mistakes

❌ Forgetting to use `CurrentIndex`  
✔️ Always use `CurrentIndex` to get the correct cell

---

❌ Not breaking the struct  
✔️ You must use `Break MazeCell` to access `X` and `Y`

---

❌ Only setting one value  
✔️ You need both `CurrentX` and `CurrentY`

---

❌ Using the wrong variable instead of `Grid`  
✔️ Make sure you're pulling from the main grid array

---

### Expected result

After this step runs:

- `CurrentX` contains the X position of the current cell
- `CurrentY` contains the Y position of the current cell

These values will be used in the next step to check all neighboring directions.

---

<a href="{{ '/assets/images/blog/Step 4.2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 4.2.png' | relative_url }}" alt="Screenshot showing Grid  Get (a copy)  Break MazeCell Set CurrentX / Set CurrentY" class="post-image">
</a>

---

## Step 4.3 — Add a Sequence Node

Now that `CurrentX` and `CurrentY` are set, we need a way to process multiple directions in order.

We will use a **Sequence** node to handle each direction step-by-step.

---

### What this step does

The **Sequence** node allows us to run multiple execution paths in order.

> Each output pin will represent a different direction to check.

---

### Instructions

1. Locate the node where you just finished setting:
   - `Set CurrentY`

2. Drag off the execution pin from `Set CurrentY` and add a:
   `Sequence` node

3. Select the Sequence node and click:
   `Add pin`

4. Continue clicking **Add pin** until you have:
   - Then 0
   - Then 1
   - Then 2
   - Then 3
   - Then 4

---

### What each pin will be used for

We will use each output for a different part of the logic:

- **Then 0** → LEFT
- **Then 1** → RIGHT
- **Then 2** → UP
- **Then 3** → DOWN
- **Then 4** → Return Node

---

### Connections recap

- `Set CurrentY` → `Sequence`
- Sequence outputs:
  - Then 0
  - Then 1
  - Then 2
  - Then 3
  - Then 4

---

### Why this matters

Without the Sequence node, you would only be able to execute one path at a time.

This node ensures:

> All four directions are checked, one after another, every time this function runs.

---

### Common mistakes

❌ Forgetting to add enough pins  
✔️ Make sure you have **Then 0 through Then 4**

---

❌ Not connecting the execution wire  
✔️ `Set CurrentY` must flow into the Sequence node

---

❌ Mixing up the order of directions  
✔️ Keep the order consistent (Left, Right, Up, Down)

---

### Expected result

You now have a Sequence node that will:

- Execute five steps in order
- Provide a clean structure for checking all directions
- Prepare the flow for adding neighbors and returning results

---

<a href="{{ '/assets/images/blog/Step 4.3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 4.3.png' | relative_url }}" alt="Screenshot showing Sequence node with Then 0 through Then 4" class="post-image">
</a>

---

# Step 5 — Build the Left Direction

For each direction, we:

1. calculate test coordinates
2. check bounds
3. convert to index
4. check if visited
5. add to LocalNeighbors if valid

Start with LEFT.

---

## Step 5.1 — Set Test Coordinates for LEFT

We begin by calculating the test coordinates for the **LEFT** direction.

This means moving two cells to the left from the current position.

---

### What this step does

This step sets up a potential neighbor position by adjusting the current coordinates.

> LEFT means decreasing the X value while keeping Y the same.

---

### Instructions

1. Locate the **Sequence** node in your function.
2. From **Then 0**, begin the execution flow for the LEFT direction.

3. Set `TestX`:
   - Drag in `CurrentX` as **Get**
   - Add a subtraction (`-`) node
   - Set the value to `2`
   - Drag off the return pin and search for `Set TestX`
   - Connect the `Then 0` execution pin to `Set TestX` execution pin

4. Set `TestY`:
   - Drag in `CurrentY` as **Get**
   - Drag off the return pin and search for `Set TestY`
   - Connect the `Set TestX` execution pin to `Set TestY` execution pin

---

### Connections recap

- `Sequence Then 0` → `Set TestX` → `Set TestY`
- `CurrentX - 2` → `Set TestX`
- `CurrentY` → `Set TestY`

---

### Why this matters

In this maze system, we move in steps of **2** to skip over walls and land on the next valid cell.

This step calculates:

> The coordinates of the cell to the LEFT of the current position

These coordinates will be tested in the next steps.

---

### Common mistakes

❌ Subtracting `1` instead of `2`  
✔️ Always move by `2` to maintain proper maze spacing

---

❌ Changing both X and Y  
✔️ LEFT only affects X — Y stays the same

---

❌ Breaking execution flow  
✔️ Make sure the white wire goes:
`Then 0 → Set TestX → Set TestY`

---

### Expected result

After this step runs:

- `TestX` = `CurrentX - 2`
- `TestY` = `CurrentY`

These values will be used in the next step to check if the position is valid.

---

<a href="{{ '/assets/images/blog/Step 5.1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 5.1.png' | relative_url }}" alt="Screenshot showing LEFT setup using CurrentX - 2 and CurrentY" class="post-image">
</a>

---

## Step 5.2 — Add the Bounds Check

Before we use our test coordinates, we need to make sure they are inside the valid maze area.

This step prevents us from checking tiles that are outside the grid.

---

### What this step does

This step verifies that `TestX` and `TestY` are within the allowed grid boundaries.

> Only coordinates inside the maze will pass this check.

---

### Instructions

#### Step 1 — Create the X comparisons

1. From `TestX`, drag out and create:
   - `>` (Greater Than) node
   - Set the value to `0`

2. From `TestX`, drag out again and create:
   - `<` (Less Than) node

3. To build `GridWidth - 1`:
   - Drag `GridWidth` into the graph as **Get**
   - Drag off it and create a subtraction (`-`) node
   - Set the second value to `1`

4. Connect:
   - `GridWidth - 1` → second input of the `<` node

You now have:

- `TestX > 0`
- `TestX < GridWidth - 1`

---

#### Step 2 — Create the Y comparisons

5. From `TestY`, drag out and create:
   - `>` (Greater Than) node
   - Set the value to `0`

6. From `TestY`, drag out again and create:
   - `<` (Less Than) node

7. To build `GridHeight - 1`:
   - Drag `GridHeight` into the graph as **Get**
   - Drag off it and create a subtraction (`-`) node
   - Set the second value to `1`

8. Connect:
   - `GridHeight - 1` → second input of the `<` node

You now have:

- `TestY > 0`
- `TestY < GridHeight - 1`

---

#### Step 3 — Combine the X conditions

9. From the output of `TestX > 0`:
   - drag out and search for:
     `AND`
   - select the Boolean **AND** node

10. Connect:

- `TestX > 0` → first input
- `TestX < GridWidth - 1` → second input

This checks if X is inside valid bounds.

---

#### Step 4 — Combine the Y conditions

11. From the output of `TestY > 0`:

- drag out and create another **AND** node

12. Connect:

- `TestY > 0` → first input
- `TestY < GridHeight - 1` → second input

This checks if Y is inside valid bounds.

---

#### Step 5 — Combine both results

13. From the output of the X AND node:

- drag out and create a third **AND** node

14. Connect:

- X result → first input
- Y result → second input

This final AND means:

> X is valid AND Y is valid

---

#### Step 6 — Add the Branch

15. From the output of the final AND node:

- drag out and search for:
  `Branch`
- select the Branch node

16. Connect:

- final AND output → **Condition** input on the Branch

---

### Connections recap

- `TestX > 0` AND `TestX < GridWidth - 1`
- `TestY > 0` AND `TestY < GridHeight - 1`
- Combine both results with a final AND
- Final AND → **Branch Condition**

---

### Why this matters

Arrays in Unreal Engine will crash or throw errors if you try to access an invalid index.

This step ensures:

> We only process coordinates that exist inside the grid.

It also keeps your maze generation stable and predictable.

---

### Common mistakes

❌ Forgetting to subtract `1` from GridWidth / GridHeight  
✔️ Use `GridWidth - 1` and `GridHeight - 1` to stay inside bounds

---

❌ Creating only one AND node  
✔️ You need **three AND nodes total**

---

❌ Wiring AND nodes incorrectly  
✔️ Build left-to-right: X checks → Y checks → final AND

---

❌ Plugging a single condition directly into the Branch  
✔️ The Branch must use the **final combined result**

---

### Expected result

- If all four conditions are **True**, the Branch returns **True**
- If any condition is **False**, the Branch returns **False**

When the Branch is **True**, the coordinates are safe to use in the next step.

---

<a href="{{ '/assets/images/blog/Step 5.2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 5.2.png' | relative_url }}" alt="Screenshot showing Bounds check using four comparisons and AND nodes" class="post-image">
</a>

---

## Step 5.3 — Convert to Index

Now that we know the coordinates are within bounds, we need to convert them into a usable index for our grid array.

---

### What this step does

This step takes the valid grid coordinates (`TestX`, `TestY`) and converts them into a single array index.

> This index (`TestIndex`) is used to access the correct cell in the `Grid` array.

---

### Instructions

1. Locate the **Branch** node from Step 5.2 that checks whether the test coordinates are inside the maze bounds.

2. From the **True** output pin of that Branch:
   - click and drag a wire into empty space in the graph
   - search for:
     `GetIndex`
   - select your `GetIndex` function

3. On the `GetIndex` node, locate the input pins:
   - `X`
   - `Y`

4. Drag `TestX` into the graph as **Get**.

5. Connect:
   - `TestX` → `X` on the `GetIndex` node

6. Drag `TestY` into the graph as **Get**.

7. Connect:
   - `TestY` → `Y` on the `GetIndex` node

8. From the **Return Value** pin of the `GetIndex` node:
   - click and drag a wire into empty space
   - search for:
     `Set TestIndex`
   - select the node

9. Connect the white execution wire:
   - **True** (Branch) → `GetIndex`
   - `GetIndex` → `Set TestIndex`

10. Connect:
    - **Return Value** from `GetIndex` → value input on `Set TestIndex`

---

### Connections recap

- **True** (Branch) → `GetIndex` (Exec)
- `TestX` → `X`
- `TestY` → `Y`
- `GetIndex` → `Set TestIndex` (Exec)
- Return Value → `Set TestIndex`

---

### Execution flow

Your white execution wires should now look like this:

    Branch (True)
        → GetIndex
        → Set TestIndex

---

### Why this matters

Your grid is stored as a **1D array**, but you’re working with **2D coordinates**.

This step converts:

> (X, Y) → Array Index

Without this conversion, you would not be able to correctly access the tile in the `Grid`.

---

### Common mistakes

❌ Forgetting to create the `GetIndex` call from the Branch’s **True** pin  
✔️ Drag from **True** and add the `GetIndex` function

❌ Forgetting the white execution wire into `Set TestIndex`  
✔️ `GetIndex` must flow into `Set TestIndex`

❌ Mixing up X and Y inputs  
✔️ Double-check: `TestX → X`, `TestY → Y`

❌ Not storing the result  
✔️ You must use `Set TestIndex` or the value will not be saved for the next step

---

### Expected result

When the coordinates are valid:

- `GetIndex` converts (`TestX`, `TestY`) into a single integer
- that value is stored in `TestIndex`

This index will be used in the next step to access the correct cell in the grid.

---

<a href="{{ '/assets/images/blog/Step 5.3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 5.3.png' | relative_url }}" alt="Screenshot showing Branch True connected to GetIndex connected to Set TestIndex" class="post-image">
</a>

---

## Step 5.4 — Check If the Tile Has Been Visited

Now that we have a potential neighbor (`TestIndex`), we need to check if that tile has already been visited.

We only want to include neighbors that have **not** been visited yet.

---

### What this step does

This step checks the `Visited` property of the tile at `TestIndex`.

> If the tile has **not** been visited, it is considered a valid neighbor.

---

### Where this goes

This step continues directly after Step 5.3.

Your execution flow should now look like this:

    Branch (Bounds Check True)
        → GetIndex
        → Set TestIndex
        → (this step begins here)

---

### Instructions

#### Step 1 — Get the cell from the Grid array

1. From the execution output of `Set TestIndex`:
   - drag a wire into empty space
   - search for:
     `Get (a copy)`
   - select the node

2. Drag the `Grid` variable into the graph as **Get**.

3. Connect:
   - `Grid` → **Target Array** on the `Get (a copy)` node

4. Drag `TestIndex` into the graph as **Get**.

5. Connect:
   - `TestIndex` → the input pin on `Get (a copy)`  
     (this pin may be labeled **Index** or **Dimension 1 Integer**)

This retrieves the `MazeCell` at position `TestIndex`.

---

#### Step 2 — Break the MazeCell

6. From the output of `Get (a copy)`:
   - drag a wire into empty space
   - search for:
     `Break MazeCell`
   - select the node

This gives you access to the cell’s data (X, Y, Visited, IsWall).

---

#### Step 3 — Check the Visited value

7. From the `Visited` output pin on `Break MazeCell`:
   - drag a wire into empty space
   - search for:
     `NOT`
   - select the Boolean **NOT** node

This flips the value:

- `Visited = True` → becomes `False`
- `Visited = False` → becomes `True`

---

#### Step 4 — Add the Branch

8. From the output of the `NOT` node:
   - drag a wire into empty space
   - search for:
     `Branch`
   - select the Branch node

9. Connect the execution flow:
   - `Set TestIndex` → `Branch`

10. Connect:

- `NOT` output → **Condition** on the Branch

---

### Connections recap

- `Set TestIndex` → `Branch)` (Exec)
- `Grid` → **Target Array**
- `TestIndex` → **Index / Dimension 1 Integer**
- Output → `Break MazeCell`
- `Visited` → `NOT`
- `NOT` → **Branch Condition**

---

### Execution flow

Your white execution wires should now look like this:

    Set TestIndex
        → Branch

---

### What this means

The Branch will return:

- **True** → the tile has **NOT** been visited (valid neighbor)
- **False** → the tile has already been visited (skip it)

---

### Why this matters

Maze generation only works correctly if we avoid revisiting tiles.

This step ensures:

> Only unvisited tiles are considered valid neighbors.

If you skip this, your maze can loop back on itself and break the algorithm.

---

### Common mistakes

❌ Forgetting to connect the execution wire into `Get (a copy)`  
✔️ The node must run as part of the execution flow

---

❌ Forgetting to use `TestIndex` as the Index  
✔️ Always use `TestIndex` to check the correct tile

---

❌ Skipping the `NOT` node  
✔️ We want **NOT Visited**, not Visited

---

❌ Not connecting `Get (a copy)` to the Branch execution  
✔️ The Branch must execute after retrieving the cell

---

❌ Not breaking the `MazeCell` struct  
✔️ You must use `Break MazeCell` to access `Visited`

---

### Expected result

- If the tile **has not been visited**, the Branch returns **True**
- If the tile **has been visited**, the Branch returns **False**

When the Branch is **True**, this tile can now be added as a valid neighbor in the next step.

---

<a href="{{ '/assets/images/blog/Step 5.4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 5.4.png' | relative_url }}" alt="Screenshot showing Grid to Get (a copy) using TestIndex to Break MazeCell to NOT Visited to Branch" class="post-image">
</a>

---

## Step 5.5 — Add the Valid Neighbor

Now that the second **Branch** has confirmed that `TestIndex` is valid, we need to store it in our local array of neighbors.

This step adds `TestIndex` into `LocalNeighbors`.

### What this step does

If the second Branch returns **True**, we want Blueprint to do this:

> Add `TestIndex` to `LocalNeighbors`

That way, every valid neighbor gets saved into the array for later use.

### Instructions

1. Locate the **second Branch** node in your function.
2. From the **True** output pin of that Branch, continue the execution flow.
3. In the **My Blueprint** panel, find `LocalNeighbors`.
4. Drag `LocalNeighbors` into the graph as **Get**.
5. Drag off the `LocalNeighbors` pin and search for `Add`.
6. Choose the **Add (Array)** node.
7. Connect `LocalNeighbors` to **Target Array**.
8. Drag `TestIndex` into the graph as **Get**.
9. Connect `TestIndex` to **Item**.
10. Connect the **True** execution pin from the Branch into the **Add** node’s execution input.

### Connections recap

- **True** (second Branch) → **Exec** on `Add`
- `LocalNeighbors` → **Target Array**
- `TestIndex` → **Item**

### Why this matters

This is the step that actually saves the valid neighbor.

Without it, your logic may correctly detect a valid neighbor, but it will never be added to the `LocalNeighbors` array. That means your maze generation will not have the neighbor data it needs for later steps.

### Common mistakes

❌ Dragging in `LocalNeighbors` as **Set** instead of **Get**  
✔️ Always use **Get** when feeding into the Add node

---

❌ Forgetting to connect the white execution wire from the Branch  
✔️ The Add node must be connected to the **True** pin

---

❌ Plugging the wrong variable into **Item**  
✔️ It must be `TestIndex`

---

❌ Creating the wrong kind of `Add` node  
✔️ Drag off `LocalNeighbors` to create the correct **Add (Array)** node

### Expected result

When the Branch returns **True**, Blueprint adds `TestIndex` to `LocalNeighbors`.

For example, if `TestIndex` is `12`, then after this node runs, `12` is now stored in the `LocalNeighbors` array.

### Direction flow note

At this point, you have completed the full logic for the **LEFT** direction.

Make sure this entire block is connected to:

- `Sequence Then 0` That was created in step 5.1.

> Note: We may adjust or extend these connections later as we build the full function.

In the next step, we will duplicate this block for the other directions using:

- `Then 1` → RIGHT
- `Then 2` → UP
- `Then 3` → DOWN

---

<a href="{{ '/assets/images/blog/Step 5.5.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 5.5.png' | relative_url }}" alt="Screenshot showing full logic for the left direction" class="post-image">
</a>

---

# Step 6 — Duplicate for the Other Three Directions

Once the **LEFT** direction is fully working, duplicate that entire direction block for the other three directions.

This means duplicating the full chain that begins after Sequence `Then 0`:

- `Set TestX`
- `Set TestY`

and continues through:

- bounds check
- `GetIndex`
- `Set TestIndex`
- visited check
- add valid neighbor

Then reconnect each duplicated block to the Sequence node:

- `Then 1` → RIGHT
- `Then 2` → UP
- `Then 3` → DOWN

Only the coordinate math at the start of each block should change.

---

## RIGHT

- `TestX = CurrentX + 2`
- `TestY = CurrentY`

Connect:

- `Sequence Then 1 → RIGHT Set TestX`

---

<a href="{{ '/assets/images/blog/Step 6 Right.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 6 Right.png' | relative_url }}" alt="Screenshot showing full logic for the right direction" class="post-image">
</a>

---

## UP

- `TestX = CurrentX`
- `TestY = CurrentY - 2`

Connect:

- `Sequence Then 2 → UP Set TestX`

---

<a href="{{ '/assets/images/blog/Step 6 Up.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 6 Up.png' | relative_url }}" alt="Screenshot showing full logic for the up direction" class="post-image">
</a>

---

## DOWN

- `TestX = CurrentX`
- `TestY = CurrentY + 2`

Connect:

- `Sequence Then 3 → DOWN Set TestX`

---

<a href="{{ '/assets/images/blog/Step 6 Down.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 6 Down.png' | relative_url }}" alt="Screenshot showing full logic for the down direction" class="post-image">
</a>

---

# Step 7 — Add the Return Node

Now we will return the list of valid neighbors that we built in this function.

---

### What this step does

This step sends the completed `LocalNeighbors` array out of the function.

> The function will return all valid, unvisited neighboring cells.

---

### Important concept

All four directions (LEFT, RIGHT, UP, DOWN):

- **do NOT connect directly to the Return Node**
- they each add valid results into `LocalNeighbors`

Then:

> The Return Node returns the **entire `LocalNeighbors` array at once**

---

### Instructions

1. Locate your **Return Node**.
   - If you deleted it:
     - right-click in the graph
     - search for:
       `Return Node`
     - select it

2. Connect the data:
   - drag `LocalNeighbors` into the graph as **Get**
   - connect it to:
     - `Neighbors` pin on the Return Node

3. Connect the execution flow:
   - locate your **Sequence** node
   - connect:
     - `Then 4` → `Return Node`

---

### Execution flow

Your function should now end like this:

    Then 0 → LEFT (adds to LocalNeighbors)
    Then 1 → RIGHT (adds to LocalNeighbors)
    Then 2 → UP (adds to LocalNeighbors)
    Then 3 → DOWN (adds to LocalNeighbors)
    Then 4 → Return Node

---

### What is happening

- Each direction checks a neighbor
- If valid, it adds that neighbor to `LocalNeighbors`
- After all directions are processed:
  - the Return Node sends the full list back

---

### Common mistakes

❌ Connecting LEFT/RIGHT/UP/DOWN directly to the Return Node  
✔️ Only `LocalNeighbors` connects to the Return Node

---

❌ Forgetting the execution wire  
✔️ `Then 4` must connect to the Return Node

---

❌ Connecting the Return Node too early  
✔️ It must run **after all directions are checked**

---

❌ Forgetting to use `LocalNeighbors`  
✔️ That array is what collects all valid neighbors

---

### Expected result

- All four directions are checked
- Valid neighbors are added to `LocalNeighbors`
- The Return Node outputs the full list

> The function now correctly returns all valid neighboring cells.

---

<a href="{{ '/assets/images/blog/Step 7.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Step 7.png' | relative_url }}" alt="Screenshot showing Return Node with LocalNeighbors connected to Neighbors" class="post-image">
</a>

---

# Final Execution Flow for `GetValidNeighbors`

Your function should now flow like this:

    GetValidNeighbors
      → Set CurrentX
      → Set CurrentY
      → Sequence
          Then 0 → LEFT
          Then 1 → RIGHT
          Then 2 → UP
          Then 3 → DOWN
          Then 4 → Return Node

---

<a href="{{ '/assets/images/blog/Full GetValidNeighbors.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Full GetValidNeighbors.png' | relative_url }}" alt="Screenshot showing Return Node with LocalNeighbors connected to Neighbors" class="post-image">
</a>

---

# What You Have Built So Far

At this point, your maze system can now:

- create a full grid of wall cells
- convert X/Y into array positions
- check all four directions
- return only valid, unvisited neighboring cells

That is the full foundation for procedural maze generation.

In the next part, we will use this system to generate the actual maze path using stack-based backtracking.

---

## Beginner Notes

If you are new to Blueprints, here are a few things worth remembering:

---

### “Get” vs “Get (a copy)”

When working with arrays, Unreal often uses the node name:

`Get (a copy)`

That simply means:

- get one element from an array at a specific index

So when you see instructions like:

- “Get the cell from Grid using CurrentIndex”

what you actually do in Unreal is:

- drag `Grid` into the graph as **Get**
- drag off it and choose **Get (a copy)**
- plug in the index

---

### Local Variables

Use **Local Variables** inside functions for temporary values like:

- CurrentX
- CurrentY
- TestX
- TestY
- TestIndex
- LocalNeighbors

These are cleaner and safer than turning everything into Blueprint-wide variables.

---

### Sequence Node

The Sequence node is a simple way to run:

- Left
- Right
- Up
- Down

without needing messy chains of wires between all the direction blocks.

---

## Suggested Defaults

If you want a simple starting point, try:

- `GridWidth = 21`
- `GridHeight = 21`
- `TileSize = 100`

Odd grid sizes work best for this type of maze setup.

---

## Up Next

Part 2 will build the actual maze generation loop:

- choosing a start tile
- using valid neighbors
- carving paths
- backtracking when stuck
