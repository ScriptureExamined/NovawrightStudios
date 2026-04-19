---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints Part 1"
date: 2026-04-18
author: Roberta
categories: [Tutorials]
published: false
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

<a href="{{ '/assets/images/blog/Part1-Step-1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-1.png' | relative_url }}" style="width:25%;" alt="Creating a new Blueprint Actor" class="post-image">
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

9. In the variables section on the left, create four **Public Booleans** (click the Eye icon): `ShowNorthWall`, `ShowSouthWall`, `ShowEastWall`, and `ShowWestWall`. In the **Details Panel**, make sure they are checked (True) by default.

---

<div style="display:flex; gap:10px;">
  <a href="{{ '/assets/images/blog/Part1-Step-3a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-3a.png' | relative_url }}" style="width:100%;" alt="ShowNorthWall details" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-3b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-3b.png' | relative_url }}" style="width:100%;" alt="ShowSouthWall details" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-3c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-3c.png' | relative_url }}" style="width:100%;" alt="ShowEastWall details" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-3d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-3d.png' | relative_url }}" style="width:100%;" alt="ShowWestWall details" class="post-image">
  </a>
</div>

---

> ### Why the Construction Script?
>
> In Unreal Engine, the **Construction Script** runs every time an object is created or changed in the editor, whereas the **Event Graph** only runs once the game actually starts.
>
> By putting our wall visibility logic here, we ensure that if we manually check or uncheck the "Show Wall" boxes in the editor details, the walls will disappear or reappear **instantly** in our viewport. This makes it much easier to test and see your changes without having to hit "Play" every time!

---

10. **The Construction Script Logic:**
    - Click on the **Construction Script** tab at the top of your Blueprint editor.
    - **Drag the Walls:** Go to the **Components** panel on the left. Click and hold `NorthWall`, then drag it directly into the center of the graph. When you let go, a small node will appear labeled **North Wall**.
    - **Add the Visibility Node:** Drag a wire out from the blue pin (the output) of the `NorthWall` node. When you let go of the mouse, a search box will appear. Type `Set Visibility` and select it.
    - **Connecting the Toggle:** Drag your `ShowNorthWall` variable from the Variables list into the graph and select **Get ShowNorthWall**. Connect its red pin to the **New Visibility** checkbox on the node.

    **Pro-Tip for Beginners:**

If you want to save time, you can drag the wall component into the graph, and then drag the Boolean variable directly onto the "New Visibility" pin of the Set Visibility node. Unreal will automatically create the "Get" node and connect it for you!

11. Connect your booleans to the **New Visibility** pins and chain the execution wires together.

<a href="{{ '/assets/images/blog/Part1-Step-3e.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-3e.png' | relative_url }}" style="width:50%;" alt="Connecting the boolean variables to wall visibility" class="post-image">
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

---

<div style="display:flex; gap:10px;">
  <a href="{{ '/assets/images/blog/Part1-Step-4a.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4a.png' | relative_url }}" style="width:100%;" alt="Creating the Generator variables and array" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-4b.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4b.png' | relative_url }}" style="width:100%;" alt="Showing GridSizeX details" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-4c.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4c.png' | relative_url }}" style="width:100%;" alt="Showing GridSizeY details" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-4d.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4d.png' | relative_url }}" style="width:100%;" alt="Showing TileSpacing details" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-4e.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4e.png' | relative_url }}" style="width:100%;" alt="Showing MazeSeed details" class="post-image">
  </a>

  <a href="{{ '/assets/images/blog/Part1-Step-4f.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-4f.png' | relative_url }}" style="width:100%;" alt="Showing GridArray details" class="post-image">
  </a>
</div>

---

#### Step 5 — The Random Engine (Maze Seed)

15. Open the **Event Graph** of `BP_MazeGenerator`.

16. Right-click and add a **Make RandomStream** node.

17. Drag `MazeSeed` into the graph as **Get**. Connect the **Green** pin to **Initial Seed**.

18. **Right-click** the **Blue** "Return Value" pin on the Make node and select **Promote to Variable**. Name it `ActiveStream`.

19. Connect **Event Begin Play** → **Set ActiveStream**.

---

<a href="{{ '/assets/images/blog/Part1-Step-5.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-5.png' | relative_url }}" style="width:50%;" alt="Showing setting MazeSeed" class="post-image">
</a>

---

#### Step 6 — Spawning the Grid

20. **Clearing the Memory:** Drag your `GridArray` variable from the Variables list into the graph. Drag a wire off the blue pin and search for **Clear**. Connect the white execution wire from `Set ActiveStream` into this **Clear** node.

    > _This ensures that every time the game starts, our list is empty and ready for a new maze._

21. **The First Loop (X):** Drag a wire from the **Clear** node's execution pin and search for **For Loop**. Drag `GridSizeX` into the graph as **Get**. Drag a wire off `GridSizeX`, type `-` to find the **Subtract** node, type `1` in the bottom box, and plug the result into **Last Index**.

22. **The Second Loop (Y):** Drag a wire off the **Loop Body** of that first loop and add a second **For Loop**. Repeat the subtraction steps using `GridSizeY - 1` for this loop's **Last Index**.

23. **Spawning the Tile:** From the **Loop Body** of that _second_ loop, drag a wire and search for:
    `SpawnActor from Class`.
    In the **Class** dropdown on the node, select `BP_MazeCell`.

24. **Opening the Pins:** The node starts with one orange pin for the location. To see the individual coordinates:
    - **Right-click** the orange **Spawn Transform** pin and select **Split Struct Pin**.
    - **Right-click** the new yellow **Location** pin that appears and select **Split Struct Pin** again.
    - You should now see three green pins labeled **Location X**, **Location Y**, and **Location Z**.

---

<a href="{{ '/assets/images/blog/Part1-Step-6.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-6.png' | relative_url }}" style="width:100%;" alt="A Blueprint graph showing the execution flow starting from a 'Clear GridArray' node into nested For Loops with subtracted indices and a split SpawnActor node." class="post-image">
</a>

---

#### Step 7 — Placement Math & Memory

25. **Finding the Start Point:** Right-click and search for **Get Actor Location**.
    - **Right-click** the orange **Return Value** pin and select **Split Struct Pin**.
      > _This gives us the exact X, Y, and Z coordinates of where you placed the Generator in your level. Without this, the maze would always spawn at the center of the world (0,0,0) instead of where you want it._

26. **Calculating the X Position:** \* Drag a wire from the **Index** pin of your first **For Loop** (the X loop).
    - Type `*` and select **Multiply**. Plug your `TileSpacing` variable into the bottom of that node.
    - Drag a wire from the result, type `+`, and select **Add**.
    - Connect the other side of the **Add** node to the **Return Value X** from your Actor Location.
    - Plug the final result into **Spawn Transform Location X**.

27. **Calculating the Y Position:** \* Repeat the exact same steps for the Y axis: Multiply the **Index** of the second loop by `TileSpacing`, add it to the **Return Value Y**, and plug it into **Spawn Transform Location Y**.

28. **Save to Memory (The Array):** \* Drag your `GridArray` variable into the graph. Drag a wire off its pin and search for the **Add** node.
    - **The Wire Connection:** Connect the white execution wire from the **SpawnActor** node into the **Add** node.
    - **The Reference Connection:** Connect the blue **Return Value** (the actual cell we just created) from the Spawn node into the blue input pin of the **Add** node.

<a href="{{ '/assets/images/blog/Part1-Step-7.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part1-Step-7.png' | relative_url }}" style="width:100%;" alt="Complete grid spawning logic showing the math for local-to-world coordinate conversion and adding the result to the GridArray." class="post-image">
</a>

---

### Why the Math Matters

Think of the Loop Index as a **Coordinate** (like 0, 1, 2) and the Tile Spacing as the **Size**.
If your spacing is 100:

- Tile 0 is at `0 * 100 = 0`.
- Tile 1 is at `1 * 100 = 100`.
- Tile 2 is at `2 * 100 = 200`.

By adding the **Actor Location** at the end, we shift that entire grid to start wherever the Generator is sitting in your level!

---

### Why the Array Matters

By using the **Add** node, we are taking the "Cell" we just spawned and putting it into our `GridArray` list. Because the loops run in order, **Index 0** in our list will always be the first tile (the Entrance), and the last index will be the far corner (the Exit).

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

---

> Stay tuned for part 2.

---
