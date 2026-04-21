---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints — Part 1 (Foundation Setup)"
date: 2026-04-20
author: Roberta
categories: [Tutorials]
published: false
excerpt: >
  In Part 1, we set up the foundation for a procedural maze generator in Unreal Engine 5. We will prepare the project, create data structures, and build the core Blueprint that will power the entire system.
---

# Building a Procedural Maze Generator in UE5 Blueprints — Part 1

## Introduction

Welcome to Part 1 of this beginner-friendly series.

In this part, we are **not building the maze yet**.

Instead, we are building the **foundation** that everything else depends on.

---

## What You Will Build in This Part

By the end of Part 1, you will have:

- A clean project structure
- Two reusable data structures (`S_NeighbourInfo`, `S_MazeCell`)
- A fully set up `BP_MazeGenerator` Blueprint
- All required variables configured
- Instanced mesh components ready for rendering later

> This is the groundwork. If this part is wrong, everything later becomes confusing.

---

## Before You Start

Make sure you have:

- Unreal Engine 5.3 or newer
- A new **Blank** or **Third Person** project

---

# Step 1 — Project Setup and Asset Preparation

---

## What this step does

This step prepares your project so everything stays organized and easy to follow.

> Good organization now prevents confusion later.

---

## Instructions

### Step 1 — Create a new project

1. Open Unreal Engine 5

2. Click:

   **Games**

3. Select:

   **Blank**

4. Click:

   **Next** (may not exeist depending on your version)

5. Choose:
   - Blueprint
   - Desktop/Console
   - Maximum Quality

6. Give your project a name

7. Click:

   **Create**

---

### Step 2 — Create your folder structure

1. Open the **Content Browser**

2. Right-click in empty space

3. Click:

   **New Folder**

4. Name it:

   `MazeGenerator`

5. Double-click to open the folder

6. Create two more folders:

- `Blueprints`
- `Meshes`

---

<a href="{{ '/assets/images/blog/Part1-Step-1.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-1.png' | relative_url }}" alt="Content Browser showing MazeGenerator folder with Blueprints and Meshes subfolders" class="post-image">
</a>

---

### Step 3 — Prepare placeholder meshes (recommended)

For this tutorial, you need two mesh references later:

- one for the floor
- one for the walls

For beginners, the easiest option is to use Unreal’s built-in meshes instead of making your own custom assets.

#### Option A — Use Unreal’s built-in meshes (recommended)

Unreal Engine already includes basic shapes you can use immediately.  
We will use these instead of creating custom meshes.

---

### Step 1 — Show Engine Content (VERY IMPORTANT)

By default, Unreal hides built-in assets.

1. Open the **Content Browser**

2. In the bottom-right corner, click the **Settings** button (gear icon)

3. Enable:

   ✔️ **Show Engine Content**

---

### Step 2 — Locate the built-in meshes

1. In the Content Browser, scroll down until you see a folder called:

   `Engine`

2. Expand:

   `Engine → Content → BasicShapes`

3. Inside this folder, find:

- `Cube`
- `Plane` (optional)

> These are built-in meshes provided by Unreal Engine.

---

### Step 3 — Choose meshes for this tutorial

For simplicity, use:

- `Cube` → for walls
- `Cube` → for floor (temporary)

> We will scale them later, so using the same mesh is perfectly fine.

---

### Step 4 — (Optional but recommended) Create references in your folder

To keep your project organized, you can create copies:

1. Right-click on:

   `Cube`

2. Click:

   **Duplicate**

3. Move or drag the duplicated asset into:

   `MazeGenerator/Meshes`

4. Rename:

- `SM_Floor`
- `SM_Wall`

> If you skip this step, you can still use the Engine meshes directly.  
> This step just keeps your project cleaner.

---

### Step 5 — Verify the mesh

1. Double-click `SM_Floor` or `Cube`

2. The Static Mesh Editor will open

3. You should see:
   - a simple 3D cube
   - dimensions (usually 100×100×100)

---

## Why this matters

- Gives you working meshes immediately
- Avoids needing external 3D software
- Keeps the focus on learning Blueprints

---

## Common mistakes

❌ Not enabling **Show Engine Content**  
✔️ You won’t see the BasicShapes folder without it

---

❌ Looking in your project folders only  
✔️ Built-in meshes are inside the **Engine** folder

---

❌ Thinking you need custom assets first  
✔️ You don’t—these are perfect for learning

---

## Expected result

You now have access to:

- a Cube mesh for walls
- a Cube mesh for floors

These will be assigned later in your Blueprint.

Later, you can replace them with better-looking meshes.

> We are only setting up the system right now. The exact art does not matter yet.

---

<a href="{{ '/assets/images/blog/Part1-Step-2.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-2.png' | relative_url }}" alt="Engine Content BasicShapes folder showing Cube and Plane meshes" class="post-image">
</a>

---

#### Option B — Import your own meshes

If you already have custom meshes:

1. Open the **Content Browser**

2. Open your:

   `MazeGenerator/Meshes`

   folder

3. Click:

   **Import**

4. Select your mesh files from your computer

5. Import:
   - a floor mesh
   - a wall mesh

---

## Why this matters

You will assign these meshes to your maze generator later.

If you do not have custom meshes yet, that is fine.

> Built-in meshes are completely acceptable for learning and testing.

---

## Common mistakes

❌ Creating assets in random folders  
✔️ Keep everything inside `MazeGenerator`

---

❌ Skipping mesh setup  
✔️ You will need meshes later for visualization

---

## Expected result

You now have:

- `MazeGenerator/Blueprints`
- `MazeGenerator/Meshes`
- access to placeholder meshes for floor and wall use

---

# Step 2 — Create the Data Structures

---

## What this step does

This step creates **custom data containers (structs)**.

These will store:
- maze cell data
- neighbor relationships

> Without these, your maze logic cannot function.

---

## Step 2.1 — Create `S_NeighborInfo`

---

### What this step does

This struct stores information about neighboring cells.

---

### Instructions

1. Go to:

   `MazeGenerator → Blueprints`

2. Right-click

3. Search for:

   **Structure**

4. Name it:

   `S_NeighborInfo`

---

### Step 2.1.1 — Add variables

Double click to open the struct:

Add:

- `CellIndex` (Integer)
- `DeltaX` (Integer)
- `DeltaY` (Integer)

---

### Why this matters

This struct tells your system:
- which cell is a neighbor
- in what direction it exists

---

### Common mistakes

❌ Using wrong variable types  
✔️ All must be **Integer**

---

### Expected result

You now have a struct that describes neighbor relationships.

---

<a href="{{ '/assets/images/blog/Part1-Step-3.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-3.png' | relative_url }}" alt="S_NeighbourInfo struct with CellIndex, DeltaX, and DeltaY variables" class="post-image">
</a>

---

## Step 2.2 — Create `S_MazeCell`

---

### What this step does

This struct represents **one cell in the maze**.

---

### Instructions

1. Right-click in `Blueprints`

2. Search for:

   **Structure**

3. Name it:

   `S_MazeCell`

---

### Step 2.2.1 — Add variables

Double click to open the struct:

Add:

- `Row` (Integer)
- `Col` (Integer)
- `bVisited` (Boolean, default = False)
- `bWallNorth` (Boolean, default = True)
- `bWallEast` (Boolean, default = True)
- `bWallSouth` (Boolean, default = True)
- `bWallWest` (Boolean, default = True)

---

### Why this matters

Each cell:
- tracks its position
- remembers if it was visited
- stores all four walls

> This is the core data for the maze.

---

### Common mistakes

❌ Forgetting default values  
✔️ Walls must start as **True**

---

### Expected result

You now have a full maze cell data structure.

---

<a href="{{ '/assets/images/blog/Part1-Step-4.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-4.png' | relative_url }}" alt="S_MazeCell struct showing row, column, visited state, and four wall booleans" class="post-image">
</a>

---

# Step 3 — Create the Maze Generator Blueprint

---

## What this step does

This creates the main Blueprint that controls everything.

---

## Instructions

1. Right-click inside:

   `Blueprints`

2. Click:

   **Blueprint Class**

3. Select:

   **Actor**

4. Name it:

   `BP_MazeGenerator`

5. Double-click to open it

---

## Why this matters

This Blueprint will:
- generate the maze
- store all data
- eventually render the maze

---

## Expected result

You now have an empty `BP_MazeGenerator`.

---

<a href="{{ '/assets/images/blog/Part1-Step-5.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-5.png' | relative_url }}" alt="Blueprint Class creation menu showing Actor selected for BP_MazeGenerator" class="post-image">
</a>

---

# Step 4 — Add Variables and Components

---

## What this step does

This step defines all settings and components your maze will use.

---

## Step 4.1 — Create Variables

---

### Instructions

Inside `BP_MazeGenerator`:

Go to **My Blueprint → Variables**

Add the following:

---

### Maze Settings

- `MazeWidth` (Integer, Default = 12)
- `MazeHeight` (Integer, Default = 12)
- `CellSize` (Float, Default = 200.0)
- `MazeSeed` (Integer, Default = 42)

---

### Data Storage

- `MazeGrid` (Array of `S_MazeCell`)
- `RandomStream` (Random Stream)

---

### Step 4.1.1 — Make variables editable

For each variable you want to adjust in the level:

1. Select the variable

2. In the **Details** panel:

   ✔️ Check **Instance Editable**

For this tutorial, that usually means:

- `MazeWidth`
- `MazeHeight`
- `CellSize`
- `MazeSeed`

You do **not** need to make `MazeGrid` or `RandomStream` editable.

---

## Why this matters

- Lets you tweak maze size and seed in the editor
- Keeps your system flexible

---

## Common mistakes

❌ Forgetting Instance Editable  
✔️ You won’t be able to change values in the level

---

❌ Making every variable editable  
✔️ Only expose the ones you actually want to change

---

## Expected result

Your main maze settings are now created and visible.

---

<a href="{{ '/assets/images/blog/Part1-Step-6.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-6.png' | relative_url }}" alt="BP_MazeGenerator variables panel showing maze settings and data variables" class="post-image">
</a>

---

## Step 4.2 — Add HISM Components

---

### What this step does

Adds components that will render the maze efficiently.

---

### Instructions

1. Open the **Components** panel inside `BP_MazeGenerator`

2. Click:

   **Add**

3. Search for:

   `Hierarchical Instanced Static Mesh`

4. Click it

5. Rename the new component:

   `FloorHISM`

---

6. Repeat the process to add a second component

7. Rename it:

   `WallHISM`

---

### Step 4.2.1 — Assign meshes

Select:

`FloorHISM`

Then in the **Details** panel:

- Find **Static Mesh**
- Assign `SM_Floor` if you duplicated the mesh
- Or assign `Cube` if you are using the built-in mesh directly

---

Select:

`WallHISM`

Then:

- Assign `SM_Wall` if you duplicated the mesh
- Or assign `Cube` if you are using the built-in mesh directly

---

## Why this matters

HISM allows:
- many repeated meshes
- much better performance than spawning separate mesh actors

> This is a much better choice for grid-based systems like mazes.

---

## Common mistakes

❌ Using regular Static Mesh Components  
✔️ Use **Hierarchical Instanced Static Mesh**

---

❌ Forgetting to assign a mesh  
✔️ Nothing will appear later if the mesh is empty

---

❌ Naming components unclearly  
✔️ Use `FloorHISM` and `WallHISM` so the Blueprint stays readable

---

## Expected result

You now have:

- `FloorHISM`
- `WallHISM`

Both are added as components and both have a mesh assigned.

---

<a href="{{ '/assets/images/blog/Part1-Step-7.png' | relative_url }}">
  <img src="{{ '/assets/images/blog/Part1-Step-7.png' | relative_url }}" alt="BP_MazeGenerator components panel showing FloorHISM and WallHISM with assigned meshes" class="post-image">
</a>

---

# What You Have Built So Far

At this point, your system now has:

- organized project structure
- two working data structures
- a maze generator Blueprint
- all required variables
- rendering components ready

> You now have the full foundation in place.

---

## Up Next

In Part 2, we will:

- initialize the maze grid
- implement the recursive backtracker algorithm
- create helper functions
- generate a complete maze in memory

👉 This is where the maze logic begins.

---