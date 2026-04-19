---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints Part 1"
date: 2026-04-19
author: Roberta
categories: [Tutorials]
published: true
excerpt: >
  In this series, we build a procedurally generated maze from scratch using Unreal Engine 5. In Part 1, we lay the foundation: creating the Maze Cell, setting up the Random Seed engine, and spawning the initial Grid.
---

# Procedural Maze Generation in UE5: Part 1 — The Foundation

In this series, we are building a procedurally generated maze from scratch using **Unreal Engine 5**. We will start by building the "Grid", the mathematical foundation of every maze, and a "Random Engine" to make it repeatable.

---

#### Step 1 — Create the Maze Cell Actor

1. Right-click in an empty space in the **Content Browser**.

2. Select:
   `Blueprint Class`

3. Select the Parent Class:
   `Actor`

4. Name the file:
   `BP_MazeCell`

---

<a href="{{ '/assets/images/blog/Part1-Step-1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-1.png' | relative_url }}" alt="Creating a new Blueprint Actor" class="post-image">
</a>

---

#### Step 2 — Add the Floor and Walls

5. Double-click `BP_MazeCell` to open the editor.

6. Click the green **+ Add** button in the Components panel. Search for `Static Mesh` and rename it to `FloorMesh`. Set the **Static Mesh** to `Cube` and the **Scale** to: **X: 1.0, Y: 1.0, Z: 0.1**.

7. Click **+ Add** again and add another `Static Mesh`. Rename it to `NorthWall`. Set the **Static Mesh** to `Cube` and the **Scale** to: **X: 1.0, Y: 0.1, Z: 1.0**. Set its **Location** to **X: 50.0, Y: 0, Z: 50**.

8. **Duplicate** the NorthWall three times to create the rest of the box:

| Wall Name     | Location (X, Y, Z) | Rotation (X, Y, Z) |
| :------------ | :----------------- | :----------------- |
| **SouthWall** | -50, 0, 50         | 0, 0, 0            |
| **EastWall**  | 0, 50, 50          | 0, 0, 90           |
| **WestWall**  | 0, -50, 50         | 0, 0, 90           |

---

<div style="display:flex; gap:10px;">
  <a href="{{ '/assets/images/blog/Part1-Step-2a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-2a.png' | relative_url }}" style="width:100%;" alt="Configuring the Floor Mesh" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-2b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-2b.png' | relative_url }}" style="width:100%;" alt="Configuring the NorthWall mesh" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-2c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-2c.png' | relative_url }}" style="width:100%;" alt="Configuring the SouthWall mesh" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-2d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-2d.png' | relative_url }}" style="width:100%;" alt="Configuring the EastWall mesh" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-2e.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-2e.png' | relative_url }}" style="width:100%;" alt="Configuring the WestWall mesh" class="post-image">
  </a>
</div>

---

#### Step 3 — Visibility Logic

9. Create four **Public Booleans** (click the Eye icon): `ShowNorthWall`, `ShowSouthWall`, `ShowEastWall`, and `ShowWestWall`. In the **Details Panel**, make sure they are checked (True) by default.

10. In the **Construction Script** tab, drag the wall components into the graph as **Get**. Drag off them to create `Set Visibility` nodes.

11. Connect your booleans to the **New Visibility** pins and chain the execution wires together.

<a href="{{ '/assets/images/blog/Part1-Step-3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-3.png' | relative_url }}" alt="Connecting the boolean variables to wall visibility" class="post-image">
</a>

---

#### Step 4 — Setup the Generator & Variables

12. Create a new **Actor** Blueprint named `BP_MazeGenerator` and open it.

13. In the **Variables** panel, create these four **Public** variables:
    - `GridSizeX` (Integer) - Default: 10
    - `GridSizeY` (Integer) - Default: 10
    - `TileSpacing` (Float) - Default: 100.0
    - `MazeSeed` (Integer) - Default: 0

14. Create one more variable named `GridArray`. Set its type to `BP_MazeCell` (Object Reference). Click the icon next to the type and change it to the **Grid icon** (Array).

<a href="{{ '/assets/images/blog/Part1-Step-4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-4.png' | relative_url }}" alt="Creating the Generator variables and array" class="post-image">
</a>

---

#### Step 5 — The Random Engine (Maze Seed)

15. Open the **Event Graph** of `BP_MazeGenerator`.

16. Right-click and add a **Make RandomStream** node.

17. Drag `MazeSeed` into the graph as **Get**. Connect the **Green** pin to **Initial Seed**.

18. **Right-click** the **Blue** "Return Value" pin on the Make node and select **Promote to Variable**. Name it `ActiveStream`.

19. Connect **Event Begin Play** → **Set ActiveStream**.

---

#### Step 6 — Spawning the Grid

20. Drag your `GridArray` variable into the graph and select **Clear**. Connect this after `Set ActiveStream`.

21. Drag a wire from **Clear** and add a **For Loop**. Drag `GridSizeX` in, **Subtract 1**, and plug into **Last Index**.

22. From the **Loop Body**, add a second **For Loop** using `GridSizeY - 1`.

23. From the **second** Loop Body, add a **SpawnActor from Class** node. Set the Class to `BP_MazeCell`.

24. **Right-click** the orange **Spawn Transform** and yellow **Location** pins to **Split** them.

---

#### Step 7 — Placement Math & Memory

25. Add a **Get Actor Location** node. **Right-click** the orange pin and select **Split Struct Pin**.

26. **X Location:** (X Loop Index × `TileSpacing`) + Actor Location X. Plug into **Spawn Transform Location X**.
27. **Y Location:** (Y Loop Index × `TileSpacing`) + Actor Location Y. Plug into **Spawn Transform Location Y**.

28. **Save to Memory:** Drag `GridArray` into the graph. Drag off it and search for **Add**. Connect the blue **Return Value** of the Spawn node to the Add node. Connect the execution wire from Spawn to Add.

<a href="{{ '/assets/images/blog/Part1-Step-7.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-7.png' | relative_url }}" alt="Complete grid spawning and array logic" class="post-image">
</a>

---

### Connections recap

**Execution flow:**
Event Begin Play → Set ActiveStream → Clear GridArray → For Loop (X) → For Loop (Y) → SpawnActor → Add to GridArray

**Data flow:**

- `MazeSeed` → `ActiveStream` (Our Random Engine)
- Loop Indices → World Position (Where the tile goes)
- Spawned Actor → `GridArray` (Our Memory)

---

### Why this matters

By saving every cell into the **GridArray**, our generator now has a "Memory." We can now tell it to look at Index 0 to create an entrance, or use the `ActiveStream` to randomly pick neighbors and carve a path through the "waffle."

---

### Expected result

When you hit **Play**, a 10x10 square of walled tiles will appear. It looks like a waffle now, but because we have a **Seed** and a **GridArray**, we are ready to start carving a perfect, repeatable maze!
