---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints Part 1"
date: 2026-04-18
author: Roberta
categories: [Tutorials]
published: false
excerpt: >
  In this series, we build a procedurally generated maze from scratch using Unreal Engine 5. In Part 1, we laid the foundation: creating the Maze Cell, setting up the Random Seed engine, and spawning the initial Grid. In this part, we will prepare the Logic Machine for carving: identifying the Entrance and setting up the "Stack" (the memory of where the generator has been).
---

# Procedural Maze Generation in UE5: Part 2 — The Carving Logic

Our generator has a memory (the **GridArray**), but currently, every cell is a solid "waffle" with four walls. To create a maze, we need to pick a starting point and begin "carving" through those walls.

---

#### Step 1 — Create the "Visited" List and Stack

For our algorithm to work, the generator needs to know two things: which cells it has already visited (so it doesn't go in circles) and the path it took (so it can backtrack).

1. In `BP_MazeGenerator`, create a new variable named `VisitedCells`.
2. Set the **Variable Type** to `BP_MazeCell` (**Object Reference**).
3. Change it to an **Array** (the grid icon).

4. Create another variable named `CellStack`.
5. Set the **Variable Type** to `BP_MazeCell` (**Object Reference**) and ensure it is also an **Array**.

<a href="{{ '/assets/images/blog/Part2-Step-1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-1.png' | relative_url }}" style="width:100%;" alt="Creating the VisitedCells and CellStack array variables" class="post-image">
</a>

---

#### Step 2 — Knocking Down the Entrance

Since you want a border around your maze with a specific entrance, we will start at the very first cell we created (**Index 0**) and remove its **South Wall**.

6. At the end of your **Step 7** logic (after the loops have finished spawning everything), add a **Sequence** node.

   > _The first pin (0) of the sequence handled the spawning. We will use the second pin (1) to start the carving._

7. Drag `GridArray` into the graph. Drag off it and search for **Get (a copy)**. Leave the index at `0`.

8. Drag a wire off that **Get** node and search for `Set Show South Wall`. Uncheck the box (**False**).

<a href="{{ '/assets/images/blog/Part2-Step-2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-2.png' | relative_url }}" style="width:100%;" alt="Using the GridArray to find the first cell and hiding its south wall to create an entrance." class="post-image">
</a>

---

#### Step 3 — Starting the Algorithm

Now we tell the "Carver" where to begin its journey.

9. Drag your `VisitedCells` variable into the graph and select **Add**.
10. Connect the **Index 0** cell (from Step 7) to this **Add** node.

11. Drag your `CellStack` variable into the graph and select **Add**.
12. Connect that same **Index 0** cell here as well.

---

### Why the "Stack" Matters

Think of the **CellStack** like a trail of breadcrumbs.

- As the generator moves forward into a new cell, it adds that cell to the **Stack**.
- If the generator hits a dead end (where all neighbors are already visited), it "pops" the top cell off the stack to move backward until it finds a cell with an unvisited neighbor.

---

### Why the "Visited" List Matters

Without the **VisitedCells** list, the generator is like a person lost in a forest who keeps walking in circles. By checking this list before moving, the generator ensures it only carves into "fresh" territory, which is how we guarantee there are no infinite loops in your maze.

---

### Expected Result

When you hit **Play**, the grid will still look like a waffle, but the very first tile (usually the bottom-left corner) will now have its front wall missing. Behind the scenes, the generator has now "marked" that spot as the beginning of the maze and is ready to look for its neighbors.
