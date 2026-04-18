---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 3"
date: 2026-04-17
author: Roberta
categories: [Tutorials]
published: true
excerpt: >
  In Part 2, we completed the full maze generation logic using a stack-based depth-first search system. The maze now exists in memory, but it is not yet visible. In this part, we will read the grid data and begin building the maze visually in the world.
---

# Procedural Maze Generation in UE5: Part 1 — The Grid

In this series, we are building a procedurally generated maze from scratch using **Unreal Engine 5**. We will start by building the "Grid"—the mathematical foundation of every maze.

---

#### Step 1 — Create the Maze Cell Actor

1. Right-click in an empty space in the **Content Browser**.

2. Select:
   `Blueprint Class`

3. Select the Parent Class:
   `Actor`

4. Name the file:
   `BP_MazeCell`

<a href="{{ '/assets/images/blog/Part1-Step-1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-1.png' | relative_url }}" alt="Creating a new Blueprint Actor" class="post-image">
</a>

---

#### Step 2 — Add the Floor Mesh

5. Double-click `BP_MazeCell` to open the editor.

6. Click the green **+ Add** button in the Components panel.

7. Search for and select:
   `Static Mesh` Rename it to FloorMesh.

8. In the **Details Panel** (right side), find the **Static Mesh** dropdown and select:
   `Cube`

9. Under **Scale**, set the values to:
   - **X:** 1.0
   - **Y:** 1.0
   - **Z:** 0.1

<a href="{{ '/assets/images/blog/Part1-Step-2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-2.png' | relative_url }}" alt="Configuring the Floor Mesh scale and type" class="post-image">
</a>

---

#### Step 3 — Create the Generator Actor

10. In the **Content Browser**, right-click and select:
    `Blueprint Class` -> `Actor`

11. Name the file:
    `BP_MazeGenerator`

12. Double-click to open the editor.

---

#### Step 4 — Setup Grid Variables

13. In the **My Blueprint** panel, click the **+** next to **Variables**.

14. Create `GridSizeX` (Type: **Integer**). Click the "Eye" icon to make it **Public**.

15. Create `GridSizeY` (Type: **Integer**). Click the "Eye" icon to make it **Public**.

16. Create `TileSpacing` (Type: **Float**). Click the "Eye" icon to make it **Public**.

17. Click **Compile**, then set the **Default Values** in the Details panel:
    - `GridSizeX`: 10
    - `GridSizeY`: 10
    - `TileSpacing`: 100.0

<div style="display:flex; gap:10px;">
  <a href="{{ '/assets/images/blog/Part1-Step-4a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4a.png' | relative_url }}" style="width:100%;" alt="Configuring the Floor Mesh scale and type" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-4b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4b.png' | relative_url }}" style="width:100%;" alt="Configuring the Floor Mesh scale and type" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-4c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4c.png' | relative_url }}" style="width:100%;" alt="Configuring the Floor Mesh scale and type" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-4d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4d.png' | relative_url }}" style="width:100%;" alt="Configuring the Floor Mesh scale and type" class="post-image">
  </a>
</div>

---

#### Step 5 — The Cleanup (Clear Children)

18. In `BP_MazeGenerator`, go to the **Construction Script** tab.

19. Drag from the **Construction Script** node and search for:
    `Clear Children`

20. Drag the **Default Scene Root** from the Components panel into the graph.

21. Connect:
    - `Default Scene Root` → **Target** (on the Clear Children node).

<a href="{{ '/assets/images/blog/Part1-Step-5.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-5.png' | relative_url }}" alt="Adding the Clear Children node for editor cleanup" class="post-image">
</a>

---

#### Step 6 — Create the Nested Loops

22. Drag from the **Clear Children** execution pin and search for:
    `For Loop`

23. Connect `GridSizeX` minus 1 to the **Last Index**. (This is the X Loop).

24. Drag from the **Loop Body** of the first loop and search for another:
    `For Loop`

25. Connect `GridSizeY` minus 1 to the **Last Index**. (This is the Y Loop).

<a href="{{ '/assets/images/blog/Part1-Step-6.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-6.png' | relative_url }}" alt="Creating nested loops for a 2D grid" class="post-image">
</a>

---

#### Step 7 — Adding the Maze Cells

26. Drag from the **Loop Body** of the **second** loop (the Y loop).

27. Search for and select:
    `Add Child Actor Component`

28. In the Details panel, set **Child Actor Class** to:
    `BP_MazeCell`

29. **Right-click** the blue **Relative Transform** pin and select **Split Struct Pin**.

30. **Right-click** the yellow **Relative Transform Location** pin and select **Split Struct Pin**.

---

#### Step 8 — Calculate Grid Position

31. Drag from the **Index** of the first loop (X) and connect to a `*` (Multiply) node.
    - Multiply by `TileSpacing`.
    - Connect the result to `Relative Transform Location X`.

32. Drag from the **Index** of the second loop (Y) and connect to a `*` (Multiply) node.
    - Multiply by `TileSpacing`.
    - Connect the result to `Relative Transform Location Y`.

<a href="{{ '/assets/images/blog/Part1-Step-8.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-8.png' | relative_url }}" alt="Connecting indices to transform pins" class="post-image">
</a>

---

### Connections Recap

**Execution Flow:** Construction Script → Clear Children → For Loop (X) → For Loop (Y) → Add Child Actor Component

**Data Flow:**

1. X Index × TileSpacing → Location X
2. Y Index × TileSpacing → Location Y
3. BP_MazeCell → Child Actor Class

---

### Why This Matters

A nested loop allows us to fill a 2D space. The "X" loop creates the rows, and for every row, the "Y" loop creates the columns.

> Without the "Clear Children" node, Unreal would keep adding new tiles on top of old ones every time you moved the generator, eventually slowing down your computer.

---

### Expected Result

Drag your `BP_MazeGenerator` into the level. You should see a 10x10 square of tiles. If you change the `GridSize` variables in the Details panel, the square will grow or shrink instantly!
