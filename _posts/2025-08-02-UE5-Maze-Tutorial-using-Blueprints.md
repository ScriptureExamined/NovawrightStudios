---
layout: post
title: "UE5 Maze Tutorial using Blueprints."
date: 2025-08-02
author: Roberta
categories: [Tutorials]
featured: true
excerpt: >
  I found an Unreal Engine maze generation tutorial that would work fantastic for DungeonQuest. The only problem is it's a total train wreck for beginners to blueprint. It's called Random Maze Generator and you can find it at this site. It's taken me hours just to get to the end of page 5. And it's 14 pages long. Wow. I've decided to put together a beginners tutorial so someone new can follow along and get through this. When I'm done with the series, I'll post a link on the Unreal forum so anyone else searching can find help. The last posts on this were from 2014 and not much help. When done, I will edit this preview.
---

# Building a Procedural Maze Generator in UE5 Blueprints — Part 1

## Creating the Grid and Valid Neighbor System

If you have ever tried following an older Unreal maze tutorial, you probably noticed the same thing I did: the core idea is good, but the Blueprint setup can get messy fast. There are extra arrays, overcomplicated macros, and a lot of wiring that makes the logic harder to understand than it needs to be.

This version rebuilds the system cleanly from scratch in Unreal Engine 5 Blueprints.

In Part 1, we are going to build the foundation:

- a grid of maze cells
- a helper function to convert X/Y into an array index
- a function that finds valid neighboring cells

This is the part that makes the maze “think.”

---

## What We Are Building

The maze will use a grid of cells. Each cell stores:

- its X position
- its Y position
- whether it has been visited
- whether it is currently a wall

Later, the generator will carve paths by moving through this grid two cells at a time.

---

## Before You Start

Create a new Actor Blueprint called:

`BP_MazeGenerator`

Also create a Blueprint Structure called:

`MazeCell`

Inside `MazeCell`, add these variables:

- `X` — Integer
- `Y` — Integer
- `Visited` — Boolean
- `IsWall` — Boolean

<a href="{{ '/assets/images/blog/MazeCellStruct.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/MazeCellStruct.png' | relative_url }}" alt="MazeCell structure screenshot" class="post-image">
</a>

---

# Step 1 — Add the Main Variables

Open `BP_MazeGenerator` and add these variables:

## Grid Settings

- `GridWidth` — Integer
- `GridHeight` — Integer
- `TileSize` — Float

Set these to **Instance Editable** so you can change them in the Details panel later.

## Grid Data

- `Grid` — MazeCell Array

Make sure `Grid` is an **array** of `MazeCell`, not a single struct.

<a href="{{ '/assets/images/blog/BP_MazeGeneratorVariables.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/BP_MazeGeneratorVariables.png' | relative_url }}" alt="BP_MazeGenerator variables panel screenshot showing GridWidth, GridHeight, TileSize, and Grid as MazeCell Array" class="post-image">
</a>

---

# Step 2 — Create the `InitializeGrid` Function

This function creates every cell in the maze and stores it in the `Grid` array.

Create a new function called:

`InitializeGrid`

---

## Step 2.1 — Clear the Grid

Inside `InitializeGrid`:

- drag the `Grid` variable into the graph as **Get**
- drag off it and add the node:
  `Clear`

This ensures the array starts empty each time the grid is rebuilt.

<a href="{{ '/assets/images/blog/Screenshot-showing-InitializeGrid-Grid-Clear.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Screenshot-showing-InitializeGrid-Grid-Clear.png' | relative_url }}" alt="Screenshot showing InitializeGrid  Grid  Clear" class="post-image">
</a>

---

## Step 2.2 — Add Nested For Loops

We need one loop for rows and one loop for columns.

### Outer loop

Add a `ForLoop` for Y.

- First Index = `0`
- Last Index = `GridHeight - 1`

### Inner loop

From the outer loop’s `Loop Body`, add another `ForLoop` for X.

- First Index = `0`
- Last Index = `GridWidth - 1`

This gives us a full 2D grid.

<a href="{{ '/assets/images/blog/Nested-ForLoop-setup-inside-InitializeGrid.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Nested-ForLoop-setup-inside-InitializeGrid.png' | relative_url }}" alt="Screenshot showing Nested ForLoop setup inside InitializeGrid" class="post-image">
</a>

---

## Step 2.3 — Create a MazeCell

Inside the inner loop:

- right-click and add:
  `Make MazeCell`

Set it like this:

- `X = inner loop Index`
- `Y = outer loop Index`
- `Visited = false`
- `IsWall = true`

That means every cell starts as an unvisited wall.

<a href="{{ '/assets/images/blog/Make-MazeCell-with-X-Y-Visited false-IsWall-true.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Make-MazeCell-with-X-Y-Visited false-IsWall-true.png' | relative_url }}" alt="Screenshot showing Make MazeCell with X, Y, Visited false, IsWall true" class="post-image">
</a>

---

## Step 2.4 — Add the Cell to the Grid Array

Still inside the inner loop:

- drag `Grid` into the graph as **Get**
- drag off it and add:
  `Add`

Connect:

- `Target Array = Grid`
- `Item = Make MazeCell`

At the end of this function, the Grid array will contain every cell in the maze.

### Screenshot Placeholder

**[Screenshot: Make MazeCell connected into Add node targeting Grid]**

---

# Step 3 — Create the `GetIndex` Function

Because the maze is stored in a one-dimensional array, we need a way to convert grid coordinates into an array index.

Create a new function called:

`GetIndex`

Inputs:

- `X` — Integer
- `Y` — Integer

Output:

- `Index` — Integer

---

## Step 3.1 — Build the Formula

Use this formula:

`Index = X + (Y * GridWidth)`

In Blueprint:

- multiply `Y * GridWidth`
- add `X`
- connect the result to the Return Node

### Screenshot Placeholder

**[Screenshot: GetIndex function using X + (Y * GridWidth)]**

---

## Why This Matters

If your grid width is 21:

- `(0,0)` becomes 0
- `(1,0)` becomes 1
- `(0,1)` becomes 21
- `(1,1)` becomes 22

This is how we look up the correct cell later.

---

# Step 4 — Create `GetValidNeighbors`

This is the most important function in this part of the tutorial.

Its job is simple:

- take the current cell
- check the four directions
- return only the valid neighboring cells

Create a new function called:

`GetValidNeighbors`

Input:

- `CurrentIndex` — Integer

Output:

- `Neighbors` — Integer Array

---

## Step 4.1 — Add Local Variables

Inside the function, create these **Local Variables**:

- `CurrentX` — Integer
- `CurrentY` — Integer
- `TestX` — Integer
- `TestY` — Integer
- `TestIndex` — Integer
- `LocalNeighbors` — Integer Array

Use local variables here. Do not make these regular Blueprint variables.

### Screenshot Placeholder

**[Screenshot: Local variables inside GetValidNeighbors]**

---

## Step 4.2 — Read the Current Cell

We need to get the current MazeCell from the Grid array.

Do this:

- drag `Grid` into the graph as **Get**
- drag off it and choose:
  `Get (a copy)`
- plug `CurrentIndex` into the Index pin
- drag off the result and add:
  `Break MazeCell`

Now store the values:

- `X → Set CurrentX`
- `Y → Set CurrentY`

### Screenshot Placeholder

**[Screenshot: Grid → Get (a copy) → Break MazeCell → Set CurrentX / Set CurrentY]**

---

## Step 4.3 — Add a Sequence Node

After `Set CurrentY`, add a `Sequence` node.

Click `Add pin` until it has:

- Then 0
- Then 1
- Then 2
- Then 3

We will use those for:

- Left
- Right
- Up
- Down

### Screenshot Placeholder

**[Screenshot: Sequence node with Then 0 through Then 3]**

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

For LEFT:

- `TestX = CurrentX - 2`
- `TestY = CurrentY`

That means:

- drag in `CurrentX`
- subtract `2`
- connect into `Set TestX`

Then:

- drag in `CurrentY`
- connect into `Set TestY`

The white exec flow should be:

`Sequence Then 0 → Set TestX → Set TestY`

### Screenshot Placeholder

**[Screenshot: LEFT setup using CurrentX - 2 and CurrentY]**

---

## Step 5.2 — Add the Bounds Check

We only want cells inside the valid maze area.

Build these four checks:

- `TestX > 0`
- `TestX < GridWidth - 1`
- `TestY > 0`
- `TestY < GridHeight - 1`

Combine them using `AND` nodes, then plug the final result into a `Branch`.

### Screenshot Placeholder

**[Screenshot: Bounds check using four comparisons and AND nodes]**

---

## Step 5.3 — Convert to Index

On the **True** pin of that Branch:

- call `GetIndex`
- connect `X = TestX`
- connect `Y = TestY`

Then store the result in:

- `Set TestIndex`

### Screenshot Placeholder

**[Screenshot: Branch True → GetIndex → Set TestIndex]**

---

## Step 5.4 — Check If the Tile Has Been Visited

Now test the actual cell:

- drag `Grid` into the graph as **Get**
- drag off and choose:
  `Get (a copy)`
- use `TestIndex` as the Index
- add `Break MazeCell`

Then:

- take `Visited`
- pass it through a `NOT` node
- plug that into another `Branch`

If the Branch is True, the tile is a valid neighbor.

### Screenshot Placeholder

**[Screenshot: Grid → Get (a copy) using TestIndex → Break MazeCell → NOT Visited → Branch]**

---

## Step 5.5 — Add the Valid Neighbor

On the **True** pin of that second Branch:

- drag `LocalNeighbors` into the graph as **Get**
- drag off it and add:
  `Add`

Connect:

- `Target Array = LocalNeighbors`
- `Item = TestIndex`

### Screenshot Placeholder

**[Screenshot: Add node using LocalNeighbors and TestIndex]**

---

# Step 6 — Duplicate for the Other Three Directions

Once LEFT is working, duplicate the whole direction block three times and change only the coordinate math.

---

## RIGHT

- `TestX = CurrentX + 2`
- `TestY = CurrentY`

Connect:

- `Sequence Then 1 → RIGHT Set TestX`

### Screenshot Placeholder

**[Screenshot: RIGHT direction block]**

---

## UP

- `TestX = CurrentX`
- `TestY = CurrentY - 2`

Connect:

- `Sequence Then 2 → UP Set TestX`

### Screenshot Placeholder

**[Screenshot: UP direction block]**

---

## DOWN

- `TestX = CurrentX`
- `TestY = CurrentY + 2`

Connect:

- `Sequence Then 3 → DOWN Set TestX`

### Screenshot Placeholder

**[Screenshot: DOWN direction block]**

---

# Step 7 — Add the Return Node

If your Return Node is missing, right-click in the function graph and add:

`Return Node`

Now connect:

- `LocalNeighbors` into the `Neighbors` pin on the Return Node

This means the function returns every valid neighbor it found.

### Screenshot Placeholder

**[Screenshot: Return Node with LocalNeighbors connected to Neighbors]**

---

# Final Execution Flow for `GetValidNeighbors`

Your function should now flow like this:

`GetValidNeighbors  
→ Set CurrentX  
→ Set CurrentY  
→ Sequence  
   Then 0 → LEFT  
   Then 1 → RIGHT  
   Then 2 → UP  
   Then 3 → DOWN  
→ Return Node`

### Screenshot Placeholder

**[Screenshot: Full GetValidNeighbors function overview]**

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

### Local Variables

Use **Local Variables** inside functions for temporary values like:

- CurrentX
- CurrentY
- TestX
- TestY
- TestIndex
- LocalNeighbors

These are cleaner and safer than turning everything into Blueprint-wide variables.

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
